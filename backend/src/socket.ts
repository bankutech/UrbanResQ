import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { query } from './config/db';

let io: SocketIOServer | null = null;
let lastSeenAlertId = 0;
let pollingInterval: NodeJS.Timeout | null = null;

const startAlertPolling = async () => {
  if (pollingInterval) return;
  
  try {
    const initRes: any[] = await query('SELECT MAX(alert_id) as max_id FROM alerts');
    lastSeenAlertId = initRes[0]?.max_id || 0;
  } catch (err) {
    console.error('[Socket] Failed to get initial max alert_id:', err);
  }

  pollingInterval = setInterval(async () => {
    if (!io) return;
    try {
      const newAlerts: any[] = await query(
        'SELECT * FROM alerts WHERE alert_id > ? ORDER BY alert_id ASC', 
        [lastSeenAlertId]
      );
      
      if (newAlerts.length > 0) {
        lastSeenAlertId = newAlerts[newAlerts.length - 1].alert_id;
        io.emit('new_alerts', newAlerts);
      }
    } catch (err) {
      console.error('[Socket] Polling error:', err);
    }
  }, 2000);
};

export const initSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  startAlertPolling();

  return io;
};

export const emitUpdate = (event: string, data?: any) => {
  if (io) {
    io.emit(event, data);
  }
};

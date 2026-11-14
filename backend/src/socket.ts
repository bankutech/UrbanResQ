import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { query } from './config/db';

let io: SocketIOServer | null = null;
let lastSeenAlertTime: Date = new Date();
const seenAlertIds = new Set<string>();
let pollingInterval: NodeJS.Timeout | null = null;

const startAlertPolling = async () => {
  if (pollingInterval) return;
  
  try {
    const initRes: any[] = await query('SELECT MAX(created_at) as max_time FROM alerts');
    if (initRes[0]?.max_time) {
      lastSeenAlertTime = new Date(initRes[0].max_time);
    }
  } catch (err) {
    console.error('[Socket] Failed to get initial max alert time:', err);
  }

  pollingInterval = setInterval(async () => {
    if (!io) return;
    try {
      const newAlerts: any[] = await query(
        'SELECT * FROM alerts WHERE created_at >= ? ORDER BY created_at ASC', 
        [lastSeenAlertTime]
      );
      
      const freshAlerts = newAlerts.filter(a => !seenAlertIds.has(a.alert_id));

      if (freshAlerts.length > 0) {
        freshAlerts.forEach(a => {
          seenAlertIds.add(a.alert_id);
          if (seenAlertIds.size > 2000) {
            const firstKey = seenAlertIds.values().next().value;
            if (firstKey) seenAlertIds.delete(firstKey);
          }
        });

        const latestTime = new Date(freshAlerts[freshAlerts.length - 1].created_at);
        if (latestTime >= lastSeenAlertTime) {
          lastSeenAlertTime = latestTime;
        }

        io.emit('new_alerts', freshAlerts);
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

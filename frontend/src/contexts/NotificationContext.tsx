import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

export interface Alert {
  alert_id: string;
  alert_type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  entity_type?: string;
  entity_id?: string;
  is_acknowledged: boolean;
  created_at: string;
}

interface NotificationContextType {
  alerts: Alert[];
  unreadCount: number;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  socket: Socket | null;
}

import { getSocket } from '../hooks/useSocket';

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = getSocket();
    if (newSocket.disconnected) {
      newSocket.connect();
    }
    setSocket(newSocket);

    const handleConnect = () => {
      console.log("[Socket] Connected to server");
    };

    newSocket.on("connect", handleConnect);

    const handleNewAlerts = (newAlerts: Alert[]) => {
      setAlerts((prev) => {
        // Filter out duplicates just in case
        const existingIds = new Set(prev.map((a) => a.alert_id));
        const toAdd = newAlerts.filter((a) => !existingIds.has(a.alert_id));
        return [...toAdd, ...prev].slice(0, 50); // Keep last 50
      });
    };

    newSocket.on("new_alerts", handleNewAlerts);

    setSocket(newSocket);

    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("new_alerts", handleNewAlerts);
    };
  }, [user]);

  const markAsRead = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.alert_id === alertId ? { ...a, is_acknowledged: true } : a,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, is_acknowledged: true })));
  }, []);

  const unreadCount = alerts.filter((a) => !a.is_acknowledged).length;

  const value = useMemo(
    () => ({
      alerts,
      unreadCount,
      markAsRead,
      markAllAsRead,
      socket,
    }),
    [alerts, unreadCount, markAsRead, markAllAsRead, socket],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}

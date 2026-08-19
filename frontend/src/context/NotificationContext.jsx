import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket, disconnectSocket } from '../api/socket';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);
const TOAST_LIFETIME_MS = 6000;

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const activeMatchIdRef = useRef(null);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setActiveMatchId = useCallback((matchId) => {
    activeMatchIdRef.current = matchId;
  }, []);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    function handleNewMessage(payload) {
      if (payload.matchId === activeMatchIdRef.current) return; // already looking at that chat
      const id = `${payload.matchId}-${payload.createdAt}`;
      setToasts((prev) => [...prev, { id, ...payload }]);
      setTimeout(() => dismissToast(id), TOAST_LIFETIME_MS);
    }

    socket.on('notification:new-message', handleNewMessage);
    return () => socket.off('notification:new-message', handleNewMessage);
  }, [user, dismissToast]);

  function openChat(toast) {
    dismissToast(toast.id);
    navigate(`/matches/${toast.matchId}/chat`, { state: { counterpartName: toast.senderName } });
  }

  return (
    <NotificationContext.Provider value={{ setActiveMatchId }}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-stack">
          {toasts.map((t) => (
            <button key={t.id} className="toast" onClick={() => openChat(t)}>
              <span className="toast-title">New message from {t.senderName}</span>
              <span className="toast-body">{t.text}</span>
            </button>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

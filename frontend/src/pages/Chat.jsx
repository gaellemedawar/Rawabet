import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import client from '../api/client';
import { getSocket } from '../api/socket';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { CoffeeCupIcon } from '../components/Motifs';

export default function Chat() {
  const { matchId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { setActiveMatchId } = useNotifications();

  const [messages, setMessages] = useState(null);
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  const counterpartName = location.state?.counterpartName || 'your match';

  useEffect(() => {
    let cancelled = false;
    setActiveMatchId(matchId);

    client
      .get(`/matches/${matchId}/messages`)
      .then(({ data }) => {
        if (!cancelled) setMessages(data.messages);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load messages');
      });

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit('match:join', matchId, (ack) => {
      if (!ack?.ok) {
        setConnectionError(ack?.error || 'Could not join this chat.');
      }
    });

    function handleNewMessage(message) {
      if (message.match !== matchId) return;
      setMessages((prev) => (prev ? [...prev, message] : [message]));
    }
    socket.on('message:new', handleNewMessage);

    return () => {
      cancelled = true;
      socket.off('message:new', handleNewMessage);
      socket.emit('match:leave', matchId);
      setActiveMatchId(null);
    };
  }, [matchId, setActiveMatchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const socket = getSocket();
    socket.emit('message:send', { matchId, text }, (ack) => {
      if (!ack?.ok) {
        setConnectionError(ack?.error || 'Message failed to send.');
      }
    });
    setDraft('');
  }

  if (error) return <div className="page-message">{error}</div>;
  if (messages === null) return <div className="page-loading">Loading chat...</div>;

  return (
    <div className="chat-page">
      <div className="chat-header">
        <Link to="/matches" className="chat-back-link">
          &larr; Matches
        </Link>
        <h1>{counterpartName}</h1>
      </div>

      {connectionError && <div className="form-error">{connectionError}</div>}

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <CoffeeCupIcon className="empty-state-icon" size={40} />
            <p className="muted">No messages yet — say hello!</p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m._id}
            className={`chat-bubble-row ${m.senderUser === user.id ? 'from-me' : 'from-them'}`}
          >
            <div className="chat-bubble">
              <p>{m.text}</p>
              <span className="chat-bubble-time">
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
        />
        <button type="submit" className="btn-primary" disabled={!draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

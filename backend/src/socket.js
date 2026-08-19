import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';
import { getMatchForParticipant } from './utils/matchAccess.js';

export function attachSocket(httpServer, allowedOrigins) {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error('Missing auth token');
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub);
      if (!user) throw new Error('User no longer exists');
      socket.user = user;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.data.joinedMatches = new Map(); // matchId -> populated Match doc
    // A personal room so this user can be notified of activity (e.g. a new
    // chat message) on ANY of their matches, not just the one they're viewing.
    socket.join(`user:${socket.user._id}`);

    socket.on('match:join', async (matchId, callback) => {
      try {
        const { match, role } = await getMatchForParticipant(matchId, socket.user._id);
        socket.join(`match:${matchId}`);
        socket.data.joinedMatches.set(matchId, match);
        socket.data.role = role;
        callback?.({ ok: true });
      } catch (err) {
        callback?.({ ok: false, error: err.message });
      }
    });

    socket.on('match:leave', (matchId) => {
      socket.leave(`match:${matchId}`);
      socket.data.joinedMatches.delete(matchId);
    });

    socket.on('message:send', async ({ matchId, text } = {}, callback) => {
      try {
        const match = socket.data.joinedMatches.get(matchId);
        if (!match) throw new Error('Join the match room before sending messages');
        const trimmed = (text || '').trim();
        if (!trimmed) throw new Error('Message text is required');

        const message = await Message.create({
          match: matchId,
          senderUser: socket.user._id,
          senderRole: socket.data.role,
          text: trimmed,
        });

        io.to(`match:${matchId}`).emit('message:new', {
          _id: message._id,
          match: matchId,
          senderUser: socket.user._id,
          senderRole: socket.data.role,
          text: message.text,
          createdAt: message.createdAt,
        });

        const isSenderInvestor = socket.data.role === 'investor';
        const senderName = isSenderInvestor ? match.investorProfile.fullName : match.businessProfile.businessName;
        const recipientUserId = isSenderInvestor ? match.businessProfile.user : match.investorProfile.user;

        io.to(`user:${recipientUserId}`).emit('notification:new-message', {
          matchId,
          senderName,
          text: message.text,
          createdAt: message.createdAt,
        });

        callback?.({ ok: true });
      } catch (err) {
        callback?.({ ok: false, error: err.message });
      }
    });
  });

  return io;
}

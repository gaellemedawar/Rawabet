import InvestorProfile from '../models/InvestorProfile.js';
import BusinessProfile from '../models/BusinessProfile.js';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import { getMatchForParticipant } from '../utils/matchAccess.js';

// GET /api/matches  -- role-aware: investors see matched businesses, businesses see matched investors.
export async function getMyMatches(req, res) {
  if (req.user.role === 'investor') {
    const investor = await InvestorProfile.findOne({ user: req.user._id });
    if (!investor) return res.status(404).json({ message: 'Complete your investor profile first' });

    const matches = await Match.find({ investorProfile: investor._id })
      .populate({ path: 'businessProfile', populate: { path: 'user', select: 'email' } })
      .sort({ createdAt: -1 });

    return res.json({ matches });
  }

  const business = await BusinessProfile.findOne({ user: req.user._id });
  if (!business) return res.status(404).json({ message: 'Complete your business profile first' });

  const matches = await Match.find({ businessProfile: business._id })
    .populate({ path: 'investorProfile', populate: { path: 'user', select: 'email' } })
    .sort({ createdAt: -1 });

  res.json({ matches });
}

// GET /api/matches/:matchId/messages -- chat history for a match, oldest first.
export async function getMatchMessages(req, res) {
  await getMatchForParticipant(req.params.matchId, req.user._id);

  const messages = await Message.find({ match: req.params.matchId }).sort({ createdAt: 1 });
  res.json({ messages });
}

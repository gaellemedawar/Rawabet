import Match from '../models/Match.js';

/**
 * Loads a match and verifies the given user is one of its two participants.
 * Throws a 404 if the match doesn't exist, 403 if the user isn't in it.
 * Returns { match, role } where role is 'investor' or 'business'.
 */
export async function getMatchForParticipant(matchId, userId) {
  const match = await Match.findById(matchId).populate('investorProfile').populate('businessProfile');
  if (!match) {
    const err = new Error('Match not found');
    err.status = 404;
    throw err;
  }

  const isInvestor = match.investorProfile.user.toString() === userId.toString();
  const isBusiness = match.businessProfile.user.toString() === userId.toString();
  if (!isInvestor && !isBusiness) {
    const err = new Error('You are not a participant in this match');
    err.status = 403;
    throw err;
  }

  return { match, role: isInvestor ? 'investor' : 'business' };
}

import InvestorProfile from '../models/InvestorProfile.js';
import BusinessProfile from '../models/BusinessProfile.js';
import Swipe from '../models/Swipe.js';
import Match from '../models/Match.js';
import { scoreBusinessesForInvestor } from '../services/aiMatchService.js';

const DECK_CANDIDATE_POOL = 15;

// GET /api/deck  (investor only)
// Builds a pool of businesses the investor hasn't swiped on yet, biased
// toward their stated niches/regions, then has the AI rank them.
export async function getInvestorDeck(req, res) {
  const investor = await InvestorProfile.findOne({ user: req.user._id });
  if (!investor) return res.status(404).json({ message: 'Complete your investor profile first' });

  const alreadySwiped = await Swipe.find({ investorProfile: investor._id, swipedBy: 'investor' }).distinct(
    'businessProfile'
  );

  const preferred = await BusinessProfile.find({
    _id: { $nin: alreadySwiped },
    $or: [{ niche: { $in: investor.niches } }, { region: { $in: investor.geographicInterests } }],
  }).limit(DECK_CANDIDATE_POOL);

  let candidates = preferred;
  if (candidates.length < DECK_CANDIDATE_POOL) {
    const excludeIds = [...alreadySwiped, ...preferred.map((p) => p._id)];
    const rest = await BusinessProfile.find({ _id: { $nin: excludeIds } }).limit(
      DECK_CANDIDATE_POOL - candidates.length
    );
    candidates = [...candidates, ...rest];
  }

  if (candidates.length === 0) return res.json({ deck: [] });

  const scores = await scoreBusinessesForInvestor(investor, candidates);
  const scoreById = new Map(scores.map((s) => [s.businessId, s]));

  const deck = candidates
    .map((b) => ({
      business: b,
      aiScore: scoreById.get(b._id.toString())?.score ?? 0,
      aiExplanation: scoreById.get(b._id.toString())?.explanation ?? '',
    }))
    .sort((a, b) => b.aiScore - a.aiScore);

  res.json({ deck });
}

// POST /api/deck/swipe  (investor only)  { businessId, direction }
export async function investorSwipe(req, res) {
  const { businessId, direction, aiScore, aiExplanation } = req.body;
  if (!businessId || !['like', 'pass'].includes(direction)) {
    return res.status(400).json({ message: 'businessId and a valid direction are required' });
  }

  const investor = await InvestorProfile.findOne({ user: req.user._id });
  if (!investor) return res.status(404).json({ message: 'Complete your investor profile first' });

  const business = await BusinessProfile.findById(businessId);
  if (!business) return res.status(404).json({ message: 'Business not found' });

  await Swipe.findOneAndUpdate(
    { investorProfile: investor._id, businessProfile: business._id, swipedBy: 'investor' },
    { direction, aiScore, aiExplanation },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let matched = false;
  if (direction === 'like') {
    const businessLikedBack = await Swipe.findOne({
      investorProfile: investor._id,
      businessProfile: business._id,
      swipedBy: 'business',
      direction: 'like',
    });
    if (businessLikedBack) {
      await Match.findOneAndUpdate(
        { investorProfile: investor._id, businessProfile: business._id },
        { aiScore, aiExplanation },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      matched = true;
    }
  }

  res.json({ matched });
}

// GET /api/business/likes  (business only)
// Investors who liked this business and are awaiting a decision.
export async function getInvestorsWhoLikedMe(req, res) {
  const business = await BusinessProfile.findOne({ user: req.user._id });
  if (!business) return res.status(404).json({ message: 'Complete your business profile first' });

  const alreadyDecided = await Swipe.find({ businessProfile: business._id, swipedBy: 'business' }).distinct(
    'investorProfile'
  );

  const incomingLikes = await Swipe.find({
    businessProfile: business._id,
    swipedBy: 'investor',
    direction: 'like',
    investorProfile: { $nin: alreadyDecided },
  }).populate('investorProfile');

  res.json({
    likes: incomingLikes.map((s) => ({
      investor: s.investorProfile,
      aiScore: s.aiScore,
      aiExplanation: s.aiExplanation,
    })),
  });
}

// POST /api/business/swipe  (business only)  { investorProfileId, direction }
export async function businessSwipe(req, res) {
  const { investorProfileId, direction } = req.body;
  if (!investorProfileId || !['like', 'pass'].includes(direction)) {
    return res.status(400).json({ message: 'investorProfileId and a valid direction are required' });
  }

  const business = await BusinessProfile.findOne({ user: req.user._id });
  if (!business) return res.status(404).json({ message: 'Complete your business profile first' });

  const investor = await InvestorProfile.findById(investorProfileId);
  if (!investor) return res.status(404).json({ message: 'Investor not found' });

  await Swipe.findOneAndUpdate(
    { investorProfile: investor._id, businessProfile: business._id, swipedBy: 'business' },
    { direction },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let matched = false;
  if (direction === 'like') {
    const investorLiked = await Swipe.findOne({
      investorProfile: investor._id,
      businessProfile: business._id,
      swipedBy: 'investor',
      direction: 'like',
    });
    if (investorLiked) {
      await Match.findOneAndUpdate(
        { investorProfile: investor._id, businessProfile: business._id },
        { aiScore: investorLiked.aiScore, aiExplanation: investorLiked.aiExplanation },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      matched = true;
    }
  }

  res.json({ matched });
}

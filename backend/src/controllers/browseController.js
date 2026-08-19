import BusinessProfile from '../models/BusinessProfile.js';
import InvestorProfile from '../models/InvestorProfile.js';
import Match from '../models/Match.js';

// GET /api/browse/businesses -- any authenticated user.
// Filters: niche, region, minAmount, maxAmount (on amountNeeded).
// Excludes businesses the requester (if an investor) is already matched
// with, and excludes a business owner's own profile from their own view.
export async function listBusinesses(req, res) {
  const { niche, region, minAmount, maxAmount } = req.query;
  const filter = {};
  if (niche) filter.niche = niche;
  if (region) filter.region = region;
  if (minAmount) filter.amountNeeded = { ...(filter.amountNeeded || {}), $gte: Number(minAmount) };
  if (maxAmount) filter.amountNeeded = { ...(filter.amountNeeded || {}), $lte: Number(maxAmount) };

  if (req.user.role === 'investor') {
    const investor = await InvestorProfile.findOne({ user: req.user._id });
    if (investor) {
      const matchedIds = await Match.find({ investorProfile: investor._id }).distinct('businessProfile');
      if (matchedIds.length) filter._id = { $nin: matchedIds };
    }
  } else {
    const business = await BusinessProfile.findOne({ user: req.user._id });
    if (business) filter._id = { $nin: [business._id] };
  }

  const businesses = await BusinessProfile.find(filter).sort({ createdAt: -1 });
  res.json({ businesses });
}

// GET /api/browse/investors -- any authenticated user.
// Filters: niche, region, minAmount, maxAmount (overlap against the
// investor's investmentMin/investmentMax range).
// Excludes investors the requester (if a business) is already matched with.
export async function listInvestors(req, res) {
  const { niche, region, minAmount, maxAmount } = req.query;
  const filter = {};
  if (niche) filter.niches = niche;
  if (region) filter.geographicInterests = region;
  if (minAmount) filter.investmentMax = { $gte: Number(minAmount) };
  if (maxAmount) filter.investmentMin = { $lte: Number(maxAmount) };

  if (req.user.role === 'business') {
    const business = await BusinessProfile.findOne({ user: req.user._id });
    if (business) {
      const matchedIds = await Match.find({ businessProfile: business._id }).distinct('investorProfile');
      if (matchedIds.length) filter._id = { $nin: matchedIds };
    }
  }

  const investors = await InvestorProfile.find(filter).sort({ createdAt: -1 });
  res.json({ investors });
}

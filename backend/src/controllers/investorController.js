import InvestorProfile from '../models/InvestorProfile.js';
import User from '../models/User.js';
import { LEBANON_REGIONS, BUSINESS_NICHES } from '../config/constants.js';

export async function upsertMyProfile(req, res) {
  const { fullName, bio, investmentMin, investmentMax, niches, geographicInterests } = req.body;

  if (!fullName || investmentMin == null || investmentMax == null || !niches?.length || !geographicInterests?.length) {
    return res.status(400).json({
      message: 'fullName, investmentMin, investmentMax, niches and geographicInterests are required',
    });
  }
  if (Number(investmentMin) > Number(investmentMax)) {
    return res.status(400).json({ message: 'investmentMin cannot be greater than investmentMax' });
  }
  const invalidNiche = niches.find((n) => !BUSINESS_NICHES.includes(n));
  if (invalidNiche) return res.status(400).json({ message: `Invalid niche: ${invalidNiche}` });
  const invalidRegion = geographicInterests.find((r) => !LEBANON_REGIONS.includes(r));
  if (invalidRegion) return res.status(400).json({ message: `Invalid region: ${invalidRegion}` });

  const profile = await InvestorProfile.findOneAndUpdate(
    { user: req.user._id },
    { user: req.user._id, fullName, bio, investmentMin, investmentMax, niches, geographicInterests },
    { new: true, upsert: true, runValidators: true }
  );

  await User.findByIdAndUpdate(req.user._id, { onboardingComplete: true });

  res.json({ profile });
}

export async function getMyProfile(req, res) {
  const profile = await InvestorProfile.findOne({ user: req.user._id });
  if (!profile) return res.status(404).json({ message: 'No investor profile yet' });
  res.json({ profile });
}

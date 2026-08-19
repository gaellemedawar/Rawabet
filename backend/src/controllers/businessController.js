import fs from 'fs';
import path from 'path';
import BusinessProfile from '../models/BusinessProfile.js';
import User from '../models/User.js';
import { LEBANON_REGIONS, BUSINESS_NICHES } from '../config/constants.js';

export async function upsertMyProfile(req, res) {
  const { businessName, ownerName, description, niche, region, amountNeeded } = req.body;

  if (!businessName || !ownerName || !description || !niche || !region || amountNeeded == null) {
    return res.status(400).json({
      message: 'businessName, ownerName, description, niche, region and amountNeeded are required',
    });
  }
  if (!BUSINESS_NICHES.includes(niche)) {
    return res.status(400).json({ message: `Invalid niche: ${niche}` });
  }
  if (!LEBANON_REGIONS.includes(region)) {
    return res.status(400).json({ message: `Invalid region: ${region}` });
  }

  const newImagePaths = (req.files || []).map((f) => `/uploads/${f.filename}`);

  const existing = await BusinessProfile.findOne({ user: req.user._id });
  const images = existing ? [...existing.images, ...newImagePaths] : newImagePaths;

  const profile = await BusinessProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      businessName,
      ownerName,
      description,
      niche,
      region,
      amountNeeded,
      images,
    },
    { new: true, upsert: true, runValidators: true }
  );

  await User.findByIdAndUpdate(req.user._id, { onboardingComplete: true });

  res.json({ profile });
}

export async function getMyProfile(req, res) {
  const profile = await BusinessProfile.findOne({ user: req.user._id });
  if (!profile) return res.status(404).json({ message: 'No business profile yet' });
  res.json({ profile });
}

export async function deleteMyImage(req, res) {
  const { filename } = req.params;
  const profile = await BusinessProfile.findOne({ user: req.user._id });
  if (!profile) return res.status(404).json({ message: 'No business profile yet' });

  const imagePath = `/uploads/${filename}`;
  if (!profile.images.includes(imagePath)) {
    return res.status(404).json({ message: 'Image not found on this profile' });
  }

  profile.images = profile.images.filter((img) => img !== imagePath);
  await profile.save();

  const diskPath = path.resolve('uploads', filename);
  fs.unlink(diskPath, () => {}); // best-effort cleanup

  res.json({ profile });
}

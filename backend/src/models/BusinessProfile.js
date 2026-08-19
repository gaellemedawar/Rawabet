import mongoose from 'mongoose';
import { LEBANON_REGIONS, BUSINESS_NICHES } from '../config/constants.js';

const businessProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    niche: { type: String, enum: BUSINESS_NICHES, required: true },
    region: { type: String, enum: LEBANON_REGIONS, required: true },
    amountNeeded: { type: Number, required: true, min: 0 },
    images: {
      type: [String], // paths relative to /uploads, served statically
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('BusinessProfile', businessProfileSchema);

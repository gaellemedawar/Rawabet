import mongoose from 'mongoose';
import { LEBANON_REGIONS, BUSINESS_NICHES } from '../config/constants.js';

const investorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    bio: { type: String, trim: true, maxlength: 1000 },
    investmentMin: { type: Number, required: true, min: 0 },
    investmentMax: { type: Number, required: true, min: 0 },
    niches: {
      type: [String],
      enum: BUSINESS_NICHES,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    geographicInterests: {
      type: [String],
      enum: LEBANON_REGIONS,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('InvestorProfile', investorProfileSchema);

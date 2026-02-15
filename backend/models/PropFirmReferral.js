import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
  },
  referralCode: {
    type: String,
    trim: true,
  },
  referralLink: {
    type: String,
    trim: true,
  },
  instructions: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

referralSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('PropFirmReferral', referralSchema);
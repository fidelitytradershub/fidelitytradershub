import mongoose from 'mongoose';

const propFirmAccountSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
  },
  accountType: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  features: {
    type: [String],
    default: [],
  },
  benefits: {
    type: [String],
    default: [],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Unique per company + accountType
propFirmAccountSchema.index({ company: 1, accountType: 1 }, { unique: true });

propFirmAccountSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('PropFirmAccount', propFirmAccountSchema);
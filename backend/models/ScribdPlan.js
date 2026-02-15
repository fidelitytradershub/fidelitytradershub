// models/ScribdPlan.js
import mongoose from 'mongoose';

const scribdPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    default: 'Scribd Plus',
    required: true,
    immutable: true, // fixed name
  },

  duration: {
    type: String,
    default: 'monthly',
    immutable: true, // fixed monthly only
  },

  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be non-negative'],
  },

  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN'],
  },

  features: {
    type: [String],
    default: [
      'Unlimited access to ebooks, audiobooks & magazines',
      'Offline reading & listening',
      'Ad-free experience',
      'Read on any device',
      'Unlimited downloads (within fair use)',
      'Family sharing (up to 3 accounts)',
      'Early access to new releases',
    ],
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

scribdPlanSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('ScribdPlan', scribdPlanSchema);
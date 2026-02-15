// models/Plan.js
import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    unique: true,
    enum: ['basic-5-days', 'basic-monthly', 'intermediate', 'pro'],
    lowercase: true,
    trim: true,
  },

  description: {
    type: String,
    trim: true,
    default: '',
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

  durationDays: {
    type: Number,
    required: true,
    min: 1,
    // 5 for basic-5-days, 30 for the monthly plans
  },

  features: {
    type: [String],
    default: [],
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

// Keep the timestamp update
planSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('fxreplayPlan', planSchema);
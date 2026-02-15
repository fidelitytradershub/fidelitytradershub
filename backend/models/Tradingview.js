import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
  },
  duration: {
    type: String,
    enum: ['monthly', 'yearly'], // Enforce your durations
    required: [true, 'Duration is required'],
  },
  purchaseType: {
    type: String,
    enum: ['individual', 'partnership', 'bulk'], // Enforce your purchase types
    required: [true, 'Purchase type is required'],
  },
  discount: {
    type: Number,
    default: 0, // Optional discount percentage
    min: 0,
    max: 100,
  },
});

const planSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['essential', 'plus', 'premium'], // Enforce your plan types
    required: [true, 'Plan type is required'],
    unique: true, // One document per type (simplifies admin management)
  },
  features: {
    type: [String], // Array of strings, e.g., ['Feature 1', 'Feature 2']
    default: [],
  },
  pricing: {
    type: [pricingSchema], // Array of pricing options
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: 'At least one pricing option is required',
    },
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

// Update timestamp on save
planSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Plan', planSchema);
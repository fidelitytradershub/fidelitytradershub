import mongoose from "mongoose";

const exchangeRateSchema = new mongoose.Schema({
  buyRateNgn: {
    type: Number,
    required: [true, 'Buy rate (NGN per USD) is required'],
    min: [0, 'Buy rate must be non-negative'],
  },

  sellRateNgn: {
    type: Number,
    required: [true, 'Sell rate (NGN per USD) is required'],
    min: [0, 'Sell rate must be non-negative'],
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
  });

const ExchangeRate = mongoose.model("ExchangeRate", exchangeRateSchema);

export default ExchangeRate;


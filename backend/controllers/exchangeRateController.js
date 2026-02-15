import ExchangeRate from '../models/ExchangeRate.js';

// ────────────────────────────────────────────────
// Admin: Set/Update buy and sell rates
// ────────────────────────────────────────────────
export const setExchangeRate = async (req, res) => {
  const { buyRateNgn, sellRateNgn } = req.body;

  if (!buyRateNgn || !sellRateNgn) {
    return res.status(400).json({
      success: false,
      message: 'Both buyRateNgn and sellRateNgn are required',
    });
  }

  if (buyRateNgn <= 0 || sellRateNgn <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Rates must be positive numbers',
    });
  }

  try {
    let exchangeRate = await ExchangeRate.findOne();

    if (!exchangeRate) {
      // First time – create
      exchangeRate = new ExchangeRate({
        buyRateNgn,
        sellRateNgn,
        updatedBy: req.user?._id, // from auth middleware
      });
    } else {
      // Update existing
      exchangeRate.buyRateNgn = buyRateNgn;
      exchangeRate.sellRateNgn = sellRateNgn;
      exchangeRate.updatedBy = req.user?._id;
    }

    await exchangeRate.save();

    return res.status(200).json({
      success: true,
      message: 'Exchange rates updated successfully',
      data: {
        buyRateNgn: exchangeRate.buyRateNgn,
        sellRateNgn: exchangeRate.sellRateNgn,
        updatedAt: exchangeRate.updatedAt,
      },
    });
  } catch (error) {
    console.error('Set exchange rate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update exchange rates',
      error: error.message,
    });
  }
};

// ────────────────────────────────────────────────
// Public: Get current buy & sell rates
// ────────────────────────────────────────────────
export const getExchangeRate = async (req, res) => {
  try {
    const exchangeRate = await ExchangeRate.findOne().sort({ updatedAt: -1 });

    if (!exchangeRate) {
      return res.status(404).json({
        success: false,
        message: 'Exchange rates not set yet',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        buyRateNgn: exchangeRate.buyRateNgn,
        sellRateNgn: exchangeRate.sellRateNgn,
        lastUpdated: exchangeRate.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get exchange rate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
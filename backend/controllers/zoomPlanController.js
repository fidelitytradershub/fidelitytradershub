import ZoomPlan from '../models/ZoomPlan.js';

// ────────────────────────────────────────────────
// Public – Get current Zoom Pro plan (monthly only)
// ────────────────────────────────────────────────
export const getZoomPlan = async (req, res) => {
  try {
    const plan = await ZoomPlan.findOne({ isActive: true });

    if (!plan) {
      return res.status(200).json({
        success: true,
        message: 'No active Zoom Pro plan found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Get Zoom plan error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// Admin – Update or create Zoom Pro monthly plan
// ────────────────────────────────────────────────
export const upsertZoomPlan = async (req, res) => {
  try {
    const {
      price,
      currency = 'USD',
      features,
      isActive = true,
    } = req.body;

    if (price == null || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required',
      });
    }

    const plan = await ZoomPlan.findOneAndUpdate(
      { planName: 'Zoom Pro', duration: 'monthly' },
      {
        price,
        currency,
        features: features || undefined,
        isActive,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Zoom Pro monthly plan updated/created',
      data: plan,
    });
  } catch (error) {
    console.error('Upsert Zoom plan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
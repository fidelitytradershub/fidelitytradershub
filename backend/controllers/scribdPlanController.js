import ScribdPlan from '../models/ScribdPlan.js';

// ────────────────────────────────────────────────
// Public – Get current Scribd Plus monthly plan
// ────────────────────────────────────────────────
export const getScribdPlan = async (req, res) => {
  try {
    const plan = await ScribdPlan.findOne({ isActive: true });

    if (!plan) {
      return res.status(200).json({
        success: true,
        message: 'No active Scribd Plus plan found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Get Scribd plan error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// Admin – Update or create Scribd Plus monthly plan
// ────────────────────────────────────────────────
export const upsertScribdPlan = async (req, res) => {
  try {
    const {
      price,
      currency = 'NGN',
      features,
      isActive = true,
    } = req.body;

    if (price == null || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required',
      });
    }

    const plan = await ScribdPlan.findOneAndUpdate(
      { planName: 'Scribd Plus', duration: 'monthly' },
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
      message: 'Scribd Plus monthly plan updated/created',
      data: plan,
    });
  } catch (error) {
    console.error('Upsert Scribd plan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
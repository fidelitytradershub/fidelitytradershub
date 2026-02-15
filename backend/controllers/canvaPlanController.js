import CanvaPlan from '../models/CanvaPlan.js';

// ────────────────────────────────────────────────
// Public – Get current Canva Pro plans (monthly + yearly)
// ────────────────────────────────────────────────
export const getCanvaPlans = async (req, res) => {
  try {
    const plans = await CanvaPlan.find({ isActive: true })
      .sort({ duration: 1 }); // monthly first, then yearly

    if (plans.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active Canva Pro plans found',
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Get Canva plans error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// Admin – Update or create Canva Pro plan (monthly or yearly)
// ────────────────────────────────────────────────
export const upsertCanvaPlan = async (req, res) => {
  try {
    const {
      duration,     // required: "monthly" or "yearly"
      price,
      currency = 'NGN',
      features,
      isActive = true,
    } = req.body;

    if (!duration || !['monthly', 'yearly'].includes(duration)) {
      return res.status(400).json({
        success: false,
        message: 'duration must be "monthly" or "yearly"',
      });
    }

    if (price == null || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required',
      });
    }

    const plan = await CanvaPlan.findOneAndUpdate(
      { duration },
      {
        planName: 'Canva Pro',
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
      message: `Canva Pro (${duration}) updated/created`,
      data: plan,
    });
  } catch (error) {
    console.error('Upsert Canva plan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


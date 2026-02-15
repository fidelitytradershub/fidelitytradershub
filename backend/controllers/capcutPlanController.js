import CapcutPlan from '../models/CapcutPlan.js';

// ────────────────────────────────────────────────
// Public – Get all active CapCut Pro plans
// ────────────────────────────────────────────────
export const getCapcutPlans = async (req, res) => {
  try {
    const plans = await CapcutPlan.find({ isActive: true })
      .sort({ duration: 1, purchaseType: 1 });

    if (plans.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active CapCut Pro plans found',
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Get CapCut plans error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// Admin – Create / Update CapCut Pro plan
// ────────────────────────────────────────────────
export const upsertCapcutPlan = async (req, res) => {
  try {
    const {
      duration,         // "monthly" or "yearly"
      purchaseType,     // "individual" or "shared"
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

    if (!purchaseType || !['individual', 'shared'].includes(purchaseType)) {
      return res.status(400).json({
        success: false,
        message: 'purchaseType must be "individual" or "shared"',
      });
    }

    if (price == null || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required',
      });
    }

    const plan = await CapcutPlan.findOneAndUpdate(
      { duration, purchaseType },
      {
        planName: 'CapCut Pro',
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
      message: `CapCut Pro (${duration} - ${purchaseType}) updated/created`,
      data: plan,
    });
  } catch (error) {
    console.error('Upsert CapCut plan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
import NetflixPlan from '../models/NetflixPlan.js';

// ────────────────────────────────────────────────
// Public – Get current Netflix Premium plans (individual + shared)
// ────────────────────────────────────────────────
export const getNetflixPlans = async (req, res) => {
  try {
    const plans = await NetflixPlan.find({ isActive: true })
      .sort({ purchaseOption: 1 }); // individual first, then shared

    if (plans.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active Netflix Premium plans found',
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Get Netflix plans error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────
// Admin – Update or create Netflix Premium plan (individual or shared)
// ────────────────────────────────────────────────
export const upsertNetflixPlan = async (req, res) => {
  try {
    const {
      purchaseOption,   // required: "individual" or "shared"
      price,
      currency = 'NGN',
      features,
      isActive = true,
    } = req.body;

    if (!purchaseOption || !['individual', 'shared'].includes(purchaseOption)) {
      return res.status(400).json({
        success: false,
        message: 'purchaseOption must be "individual" or "shared"',
      });
    }

    if (price == null || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required',
      });
    }

    const plan = await NetflixPlan.findOneAndUpdate(
      { purchaseOption },
      {
        planType: 'Premium',
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
      message: `Netflix Premium (${purchaseOption}) updated/created`,
      data: plan,
    });
  } catch (error) {
    console.error('Upsert Netflix plan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
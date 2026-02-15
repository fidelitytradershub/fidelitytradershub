import Plan from '../models/Tradingview.js';

// ────────────────────────────────────────────────
// GET – Public: Fetch all plans
// ────────────────────────────────────────────────
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ type: 1 }); // Sort by type: essential → premium
    if (!plans.length) {
      return res.status(404).json({ message: 'No plans found' });
    }
    res.status(200).json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ────────────────────────────────────────────────
// PUT – Admin only: Update or create a plan (including pricing)
// ────────────────────────────────────────────────
export const updatePlan = async (req, res) => {
  try {
    const { type, features, pricing } = req.body;

    if (!type || !pricing || !Array.isArray(pricing) || pricing.length === 0) {
      return res.status(400).json({ message: 'Type and at least one pricing option are required' });
    }

    // Validate pricing array
    pricing.forEach((p) => {
      if (!p.price || !p.duration || !p.purchaseType) {
        throw new Error('Each pricing option must have price, duration, and purchaseType');
      }
    });

    // Find and update (or create new if not exists)
    const updatedPlan = await Plan.findOneAndUpdate(
      { type }, // Unique by type
      {
        features: features || [], // Optional features array
        pricing, // Overwrite pricing array
        isActive: true,
      },
      { upsert: true, new: true, runValidators: true } // Create if not exists
    );

    res.status(200).json({
      message: 'Plan updated successfully',
      plan: updatedPlan,
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
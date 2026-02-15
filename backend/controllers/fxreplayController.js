// controllers/planController.js
import Plan from '../models/Fxreplay.js';

// GET all active plans (public - for frontend display)
export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ order: 1, name: 1 });
    
    if (plans.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active plans found',
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error('Get plans error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching plans',
      error: error.message,
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const {
      name,           // required: basic-5-days, basic-monthly, intermediate, pro
      description,
      price,
      currency = 'NGN',
      durationDays,
      features = [],
      isActive = true,
    } = req.body;

    // Basic validation
    if (!name || price == null || !durationDays) {
      return res.status(400).json({
        success: false,
        message: 'name, price, and durationDays are required',
      });
    }

    if (!['basic-5-days', 'basic-monthly', 'intermediate', 'pro'].includes(name.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan name. Allowed: basic-5-days, basic-monthly, intermediate, pro',
      });
    }

    const plan = await Plan.findOneAndUpdate(
      { name: name.toLowerCase() },
      {
        description: description || '',
        price,
        currency,
        durationDays,
        features,
        isActive,
      },
      {
        upsert: true,           // create if not exists
        new: true,              // return updated document
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Plan upserted successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Upsert plan error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving plan',
      error: error.message,
    });
  }
};
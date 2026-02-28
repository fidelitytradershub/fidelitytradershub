import PropFirmAccount from '../models/PropFirmAccount.js';

// Public – only available accounts (existing, unchanged)
export const getAvailablePropAccounts = async (req, res) => {
  try {
    const accounts = await PropFirmAccount.find({ isAvailable: true })
      .sort({ company: 1, accountType: 1 });
    res.json({ success: true, count: accounts.length, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin – all accounts regardless of availability
export const getAllPropAccounts = async (req, res) => {
  try {
    const accounts = await PropFirmAccount.find()
      .sort({ company: 1, accountType: 1 });
    res.json({ success: true, count: accounts.length, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin – upsert account (no images anymore)
export const upsertPropAccount = async (req, res) => {
  try {
    const {
      company,
      accountType,
      description,
      features = [],
      benefits = [],
      isAvailable = true,
    } = req.body;

    if (!company || !accountType || !description) {
      return res.status(400).json({
        success: false,
        message: 'company, accountType, and description are required',
      });
    }

    // Ensure features & benefits are arrays
    const safeFeatures = Array.isArray(features) ? features : [];
    const safeBenefits = Array.isArray(benefits) ? benefits : [];

    const account = await PropFirmAccount.findOneAndUpdate(
      { company: company.trim(), accountType: accountType.trim() },
      {
        description: description.trim(),
        features: safeFeatures,
        benefits: safeBenefits,
        isAvailable: isAvailable === 'true' || isAvailable === true,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.json({ success: true, message: 'Account saved', data: account });
  } catch (err) {
    console.error('Upsert error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin – delete account
export const deletePropAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await PropFirmAccount.findByIdAndDelete(id);
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
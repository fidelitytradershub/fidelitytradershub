import PropFirmReferral from '../models/PropFirmReferral.js';

// Public – get active referrals
export const getReferrals = async (req, res) => {
  try {
    const referrals = await PropFirmReferral.find({ isActive: true })
      .sort({ company: 1 });

    res.json({ success: true, count: referrals.length, data: referrals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin – upsert referral
export const upsertReferral = async (req, res) => {
  try {
    const {
      company,
      referralCode,
      referralLink,
      instructions,
      isActive = true,
    } = req.body;

    if (!company || !instructions) {
      return res.status(400).json({ success: false, message: 'company and instructions required' });
    }

    const referral = await PropFirmReferral.findOneAndUpdate(
      { company },
      {
        referralCode: referralCode?.trim(),
        referralLink: referralLink?.trim(),
        instructions: instructions.trim(),
        isActive,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Referral saved', data: referral });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin – delete referral
export const deleteReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const referral = await PropFirmReferral.findByIdAndDelete(id);
    if (!referral) return res.status(404).json({ success: false, message: 'Referral not found' });
    res.json({ success: true, message: 'Referral deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
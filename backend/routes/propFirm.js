import express from 'express';
import {
  getAvailablePropAccounts,
  getAllPropAccounts,
  upsertPropAccount,
  deletePropAccount,
} from '../controllers/propFirmAccountController.js';

import {
  getReferrals,
  upsertReferral,
  deleteReferral,
} from '../controllers/propFirmReferralController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── Accounts (no Multer needed anymore) ────────────────────────────────
router.get('/accounts', getAvailablePropAccounts);
router.get('/accounts/all', protect, getAllPropAccounts);      // admin
router.put('/accounts', protect, upsertPropAccount);  // ← no upload middleware
router.delete('/accounts/:id', protect, deletePropAccount);

// ─── Referrals (unchanged) ──────────────────────────────────────────────
router.get('/referrals', getReferrals);
router.put('/referrals', protect, upsertReferral);
router.delete('/referrals/:id', protect, deleteReferral);

export default router;
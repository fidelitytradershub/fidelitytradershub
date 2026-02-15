import express from 'express';
import { getCapcutPlans, upsertCapcutPlan } from '../controllers/capcutPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public – see current CapCut Pro pricing
router.get('/', getCapcutPlans);

// Admin only – update/create plan
router.put('/', protect, upsertCapcutPlan);

export default router;
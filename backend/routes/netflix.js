import express from 'express';
import { getNetflixPlans, upsertNetflixPlan } from '../controllers/netflixPlanController.js';
import { protect } from '../middleware/authMiddleware.js'; // your admin auth

const router = express.Router();

// Public – anyone can see current Netflix Premium pricing
router.get('/', getNetflixPlans);

// Admin only – create/update individual or shared plan
router.put('/', protect, upsertNetflixPlan);

export default router;
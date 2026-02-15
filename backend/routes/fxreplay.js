// routes/plans.js
import express from 'express';
import { getAllPlans, updatePlan } from '../controllers/fxreplayController.js';
import { protect } from '../middleware/authMiddleware.js'; // your JWT admin check

const router = express.Router();

// Public - anyone can see active plans
router.get('/', getAllPlans);

// Admin only - create or update plan
router.put('/', protect, updatePlan);

export default router;
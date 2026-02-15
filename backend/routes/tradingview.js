import express from 'express';
import { getPlans, updatePlan } from '../controllers/tradingviewController.js';
import {protect} from '../middleware/authMiddleware.js'; // Your admin auth

const router = express.Router();

// Public GET – fetch all plans
router.get('/', getPlans);

// Admin PUT – update/create plan
router.put('/', protect, updatePlan);

export default router;
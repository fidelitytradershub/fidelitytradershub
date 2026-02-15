import express from 'express';
import { getCanvaPlans, upsertCanvaPlan } from '../controllers/canvaPlanController.js';
import { protect } from '../middleware/authMiddleware.js'; // your admin auth

const router = express.Router();

// Public – anyone can see current Canva Pro pricing
router.get('/', getCanvaPlans);

// Admin only – create/update monthly or yearly plan
router.put('/', protect, upsertCanvaPlan);

export default router;
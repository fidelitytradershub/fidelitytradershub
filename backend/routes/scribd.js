import express from 'express';
import { getScribdPlan, upsertScribdPlan } from '../controllers/scribdPlanController.js';
import { protect } from '../middleware/authMiddleware.js'; // your admin auth middleware

const router = express.Router();

// Public – anyone can see current Scribd Plus pricing
router.get('/', getScribdPlan);

// Admin only – update Scribd Plus monthly plan
router.put('/', protect, upsertScribdPlan);

export default router;
import express from 'express';
import { getZoomPlan, upsertZoomPlan } from '../controllers/zoomPlanController.js';
import { protect } from '../middleware/authMiddleware.js'; // your admin auth

const router = express.Router();

// Public – anyone can see current Zoom Pro pricing
router.get('/', getZoomPlan);

// Admin only – update Zoom Pro monthly plan
router.put('/', protect, upsertZoomPlan);

export default router;
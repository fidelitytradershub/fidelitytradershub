import express from 'express';
import multer from 'multer';
import { getAboutUs, updateAboutUs } from '../controllers/aboutController.js';
import {protect} from '../middleware/authMiddleware.js'; // your JWT middleware

const router = express.Router();

// Multer setup (memory storage – already in your code)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 10MB – adjust as needed
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// ────────────────────────────────────────────────
// Public route – anyone can read
router.get('/', getAboutUs);

// Protected route – only authenticated admin
router.put(
  '/',
  protect,              // ← checks JWT
  upload.single('image'),      // field name = 'image'
  updateAboutUs
);

export default router;
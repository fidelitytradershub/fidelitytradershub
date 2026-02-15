const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ExchangeRate = require('../models/ExchangeRate');
const AboutUs = require('../models/AboutUs');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');

// ────────────────────────────────────────────────
// Auth middleware (protect admin routes)
// ────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // optional: you can attach more user info later
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ────────────────────────────────────────────────
// Multer – memory storage (no disk write)
// ────────────────────────────────────────────────
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG & GIF files allowed'), false);
    }
  },
});

// ────────────────────────────────────────────────
// Exchange Rate Routes (no file upload → unchanged logic)
// ────────────────────────────────────────────────

router.post('/exchange-rate', authMiddleware, async (req, res) => {
  try {
    const { usdToNgn } = req.body;
    if (!usdToNgn || isNaN(usdToNgn) || usdToNgn <= 0) {
      return res.status(400).json({ error: 'Valid positive USD to NGN rate required' });
    }

    let rate = await ExchangeRate.findOne();
    if (!rate) {
      rate = new ExchangeRate({ usdToNgn });
    } else {
      rate.usdToNgn = usdToNgn;
    }
    rate.updatedAt = Date.now();
    await rate.save();

    res.json({ message: 'Exchange rate updated', rate: rate.usdToNgn });
  } catch (err) {
    console.error('Exchange rate update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/exchange-rate', async (req, res) => {
  try {
    const rate = await ExchangeRate.findOne().sort({ updatedAt: -1 });
    res.json({ usdToNgn: rate ? rate.usdToNgn : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ────────────────────────────────────────────────
// About Us – with Cloudinary upload
// ────────────────────────────────────────────────

router.post('/about-us', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    let about = await AboutUs.findOne();

    if (!about) {
      about = new AboutUs({ content });
    } else {
      about.content = content;
    }

    // Handle image upload if provided
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'about-us-images',           // nice organization in dashboard
            resource_type: 'image',
            public_id: `about-main-${Date.now()}`, // avoid overwrites
            overwrite: true,
            quality: 'auto',                      // Cloudinary auto-optimization
            fetch_format: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });

      const uploadResult = await uploadPromise;

      about.imageUrl = uploadResult.secure_url;
      about.updatedAt = Date.now();
    }

    await about.save();

    res.json({
      message: 'About Us updated successfully',
      about: {
        content: about.content,
        imageUrl: about.imageUrl,
        updatedAt: about.updatedAt,
      },
    });
  } catch (err) {
    console.error('About Us update error:', err);
    res.status(500).json({
      error: err.message?.includes('Only') ? err.message : 'Server error during update/upload',
    });
  }
});

router.get('/about-us', async (req, res) => {
  try {
    const about = await AboutUs.findOne().sort({ updatedAt: -1 });
    res.json(about || { content: 'No about us content yet', imageUrl: null });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
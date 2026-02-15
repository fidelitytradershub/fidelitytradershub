import About from '../models/About.js';
import { compressFile, uploadFile } from '../config/cloudinary.js';
// ────────────────────────────────────────────────
// GET – Public: Get current About Us content
// ────────────────────────────────────────────────
export const getAboutUs = async (req, res) => {
  try {
    let about = await About.findOne().sort({ updatedAt: -1 });

    // If no document exists yet → create default
    if (!about) {
      about = new About({
        content: 'Welcome to our platform. Edit this content in the admin panel.',
        imageUrl: null,
      });
      await about.save();
    }

    return res.status(200).json(about);
  } catch (error) {
    console.error('Get About Us error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch About Us content',
      error: error.message,
    });
  }
};

// ────────────────────────────────────────────────
// PUT – Admin only: Update About Us (content + optional image)
// ────────────────────────────────────────────────
export const updateAboutUs = async (req, res) => {
  try {
    const { content } = req.body;
    const file = req.file; // multer single file

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    let about = await About.findOne().sort({ updatedAt: -1 });

    // Prepare update object
    const updateData = {
      content: content.trim(),
      updatedAt: new Date(),
    };

    // Handle image if uploaded
    if (file) {
      // Optional: compress first (your existing function)
      let processedBuffer = await compressFile(file.buffer, file.mimetype);

      // Upload to Cloudinary
      const uploadResult = await uploadFile(processedBuffer, 'about-us');

      updateData.imageUrl = uploadResult.secure_url;
    }

    if (about) {
      // Update existing document
      Object.assign(about, updateData);
      await about.save();
    } else {
      // First time → create new
      about = new About(updateData);
      await about.save();
    }

    return res.status(200).json({
      success: true,
      message: 'About Us updated successfully',
      data: about,
    });
  } catch (error) {
    console.error('Update About Us error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update About Us',
      error: error.message,
    });
  }
};
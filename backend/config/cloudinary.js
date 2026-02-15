import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Compress Large Files (Limit: 5MB)
export const compressFile = async (fileBuffer, mimetype) => {
  if (fileBuffer.length <= 5 * 1024 * 1024) {
    return fileBuffer; // No need to compress
  }

  console.log("⚡ Compressing file...");

  if (mimetype.startsWith("image/")) {
    try {
      return await sharp(fileBuffer)
        .resize({ width: 1024 }) // Resize for optimization
        .jpeg({ quality: 80 }) // Compress quality
        .toBuffer();
    } catch (error) {
      console.error("🚨 Image Compression Error:", error.message);
      return fileBuffer; // Return original buffer if compression fails
    }
  } else {
    // For non-image files (e.g., docx, pdf), return original buffer
    // Future optimization for specific file types can be added here
    return fileBuffer;
  }
};

// Upload File to Cloudinary
export const uploadFile = async (fileBuffer, folder = "admin_uploads") => {
  try {
    console.log("🟡 Uploading file to Cloudinary...");

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder, resource_type: "auto" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(fileBuffer);
    });

    console.log("✅ Cloudinary Upload Successful:", result.secure_url);
    return result;
  } catch (error) {
    console.error("🚨 Cloudinary Upload Error:", error.message);
    throw new Error("Failed to upload file to Cloudinary");
  }
};
import multer from "multer";

// Multer Configuration (Memory Storage)
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
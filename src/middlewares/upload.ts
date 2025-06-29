import multer from 'multer';

// Use memory storage to get file as buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;

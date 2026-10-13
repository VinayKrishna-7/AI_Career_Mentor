import multer from 'multer';

// Memory storage keeps file buffers in RAM, avoiding insecure disk storage
const storage = multer.memoryStorage();

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF documents are supported.'), false);
    }
  },
});

export default uploadResume;

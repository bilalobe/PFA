import multer, { diskStorage } from 'multer';

// Set up Multer storage configuration
const storage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Set up Multer upload configuration with file filters and size limits
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG and PNG images are allowed.'));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB max file size
  }
});


export default upload;


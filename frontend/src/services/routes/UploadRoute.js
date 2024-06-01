import { Router } from 'express';
const router = Router();
import upload from '../config/multerConfig';

// Define the file upload route
router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ filename: req.file.filename, path: req.file.path });
});

export default router;

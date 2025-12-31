import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { upload, verifyMagicBytes } from '../middlewares/upload.middleware';

const router = Router();

// Rate limiter: 10 uploads per 15 minutes per IP
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many uploads. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/upload - Upload a single image (rate limited)
router.post('/', uploadLimiter, upload.single('image'), verifyMagicBytes, (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the relative path for storage in database
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

export default router;


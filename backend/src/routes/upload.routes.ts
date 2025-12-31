import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fileType from 'file-type';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter: 10 uploads per 15 minutes per IP
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many uploads. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `product-${uniqueSuffix}${ext}`);
    },
});

// File filter (only images - initial MIME check)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Allowed magic byte signatures
const ALLOWED_MAGIC_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Middleware to verify file magic bytes after upload
const verifyMagicBytes = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return next();
    }

    try {
        const filePath = req.file.path;
        const type = await fileType.fromFile(filePath);

        if (!type || !ALLOWED_MAGIC_TYPES.includes(type.mime)) {
            // Delete the invalid file
            fs.unlinkSync(filePath);
            return res.status(400).json({
                error: 'Invalid file content. File does not match declared type.'
            });
        }

        next();
    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ error: 'Failed to verify file type.' });
    }
};

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


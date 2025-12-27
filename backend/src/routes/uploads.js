import express from 'express';
import multer from 'multer';
import authenticate from '../middleware/auth.js';
import { uploadFile } from '../services/storage.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept PDFs, PPTs, and executables
        const allowedMimes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/x-msdownload',
            'application/zip',
            'application/x-zip-compressed'
        ];

        if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.exe')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Upload resume
router.post('/resume', authenticate, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await uploadFile(req.file, 'resumes');

        res.json({
            message: 'Resume uploaded successfully',
            file: result
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ error: 'Failed to upload resume' });
    }
});

// Upload idea PPT
router.post('/ppt', authenticate, upload.single('ppt'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await uploadFile(req.file, 'presentations');

        res.json({
            message: 'Presentation uploaded successfully',
            file: result
        });
    } catch (error) {
        console.error('PPT upload error:', error);
        res.status(500).json({ error: 'Failed to upload presentation' });
    }
});

// Upload executable/project files
router.post('/executable', authenticate, upload.single('executable'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await uploadFile(req.file, 'executables');

        res.json({
            message: 'File uploaded successfully',
            file: result
        });
    } catch (error) {
        console.error('Executable upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

export default router;

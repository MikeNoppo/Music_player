const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, process.env.UPLOAD_PATH));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: process.env.MAX_FILE_SIZE * 1024 * 1024 // Convert MB to bytes
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'audio/mpeg' || path.extname(file.originalname).toLowerCase() === '.mp3') {
            cb(null, true);
        } else {
            cb(new Error('Only MP3 files are allowed!'), false);
        }
    }
});

// API Endpoints
app.get('/api/songs', async (req, res) => {
    try {
        const files = await fs.readdir(path.join(__dirname, process.env.UPLOAD_PATH));
        const songs = files
            .filter(file => file.endsWith('.mp3'))
            .map(file => ({
                title: file.replace('.mp3', ''),
                file: `/songs/${file}`
            }));
        res.json(songs || []);
    } catch (error) {
        console.error('Error reading songs:', error);
        res.status(500).json([]);
    }
});

// Endpoint for song upload
app.post('/api/songs', upload.single('song'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({ 
            message: 'File uploaded successfully',
            file: req.file
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Endpoint for deleting song
app.delete('/api/songs/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, process.env.UPLOAD_PATH, filename);
        
        try {
            await fs.access(filePath);
        } catch (error) {
            return res.status(404).json({ error: 'File not found' });
        }

        await fs.unlink(filePath);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Error handling for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE}MB` 
            });
        }
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
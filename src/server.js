const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API get song 

app.get('/api/songs', async (req, res) => {
    try {
        const songsDir = path.join(__dirname, '../public/songs');
        const files = await fs.promises.readdir(songsDir);
        const songs = files
            .filter(file => file.endsWith('.mp3'))
            .map(file => ({
                title: path.parse(file).name,
                file: `/songs/${file}`
            }));
        res.json(songs);
    } catch (error) {
        console.error('Error reading songs:', error);
        res.status(500).json({ error: 'Error reading songs directory' });
    }
});

// API POST SONG

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, process.env.UPLOAD_PATH || '../public/songs');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage, 
    limits: {
        fileSize: (process.env.UPLOAD_LIMIT_MB || 50) * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if(file.mimetype === 'audio/mpeg' || path.extname(file.originalname).toLowerCase() === '.mp3'){
            return cb(null, true);
        }else{
            cb(new Error('File type not supported'), false);
        }
    }
});

app.post('/api/songs', upload.single('song'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                error: 'NO FILE UPLOADED, OR FILETYPE NOT SUPPORTED' 
            });
        }
        
        // Validate filename - allow more characters but still maintain security
        const filename = req.file.originalname;
        if (!/^[a-zA-Z0-9-_\. !@#$%^&()+=\[\]{}'\s]+$/.test(filename)) {
            return res.status(400).json({ 
                error: 'Invalid filename. Allowed characters: letters, numbers, spaces, and common symbols (!@#$%^&()-_+=[]{})'
            });
        }

        res.json({ 
            message: 'File uploaded successfully', 
            file: req.file 
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 
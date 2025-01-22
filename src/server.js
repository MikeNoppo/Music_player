const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API get song 

app.get('/api/songs', (req, res) => {
    const songsDir = path.join(__dirname, '../public/songs');
    fs.readdir(songsDir, (err, files) => {
        if(err){
            res.status(500).json({error :'Error reading songs directory'});
        }
        const songs = files.filter(file => file.endsWith('.mp3')).map(file => {
            return {
                title: path.parse(file).name,
                file: `/songs/${file}`
            }
        });
        res.json(songs);
    })
});

// API POST SONG

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/songs');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage, 
    limits: {
        fileSize: 50 * 1024 * 1024
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
    if(!req.file){
        return res.status(400).json({error: 'NO FILE UPLOADED, OR FILETYPE NOT SUPPORTED'});
    }
    res.json({message: 'File uploaded successfully', file: req.file});
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 
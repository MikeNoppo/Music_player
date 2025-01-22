# Music Player Web App

A simple web-based music player application built using **Node.js** for the backend and **HTML, CSS, JavaScript** for the frontend. This application allows users to play songs, upload new songs, and view the list of available songs.

## Features

- **Play Songs**: Users can select and play songs from the available song list.
- **Upload Songs**: Users can upload new songs in MP3 format.
- **Song List**: Displays the list of songs available on the server.
- **Responsive**: Responsive design for desktop and mobile.

## Technologies Used

- **Backend**:
    - Node.js
    - Express.js
    - Multer (for handling file uploads)
- **Frontend**:
    - HTML
    - CSS (with modern Spotify-inspired styling)
    - JavaScript (for frontend interaction and logic)
- **Others**:
    - FontAwesome (for icons)
    - Google Fonts (Montserrat)

## Installation Guide

1. **Clone Repository**:
     ```bash
     git clone https://github.com/username/repository-name.git
     cd repository-name
2. **Install Dependencies**
    ```bash
        npm install
3. **Create public/songs Folder**
    ```bash
        mkdir -p public/songs
4. **Run the server**
    ```bash
        node src/server.js
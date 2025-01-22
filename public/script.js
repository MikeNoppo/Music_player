        // Fungsi untuk memuat daftar lagu
        async function loadSongs() {
            try {
                const response = await fetch('/api/songs');
                const songs = await response.json();
                const playlist = document.getElementById('playlist');
                const audioPlayer = document.getElementById('audioPlayer');

                // Kosongkan daftar lagu sebelumnya
                playlist.innerHTML = '';

                // Tambahkan setiap lagu ke daftar
                songs.forEach(song => {
                    const listItem = document.createElement('li');
                    listItem.textContent = song.title;
                    listItem.addEventListener('click', () => {
                        audioPlayer.src = song.file;
                        audioPlayer.play();
                    });
                    playlist.appendChild(listItem);
                });
            } catch (error) {
                console.error('Gagal memuat daftar lagu:', error);
            }
        }

        // Fungsi untuk mengunggah lagu
        async function uploadSong() {
            const fileInput = document.getElementById('songUpload');
            const uploadStatus = document.getElementById('uploadStatus');

            if (fileInput.files.length === 0) {
                uploadStatus.textContent = 'Pilih file MP3 terlebih dahulu!';
                return;
            }

            const formData = new FormData();
            formData.append('song', fileInput.files[0]);

            try {
                const response = await fetch('/api/songs', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (response.ok) {
                    uploadStatus.textContent = 'Upload berhasil: ' + result.message;
                    loadSongs(); // Muat ulang daftar lagu setelah upload
                } else {
                    uploadStatus.textContent = 'Upload gagal: ' + result.error;
                }
            } catch (error) {
                uploadStatus.textContent = 'Terjadi kesalahan saat mengunggah file.';
                console.error('Error:', error);
            }
        }

        // Muat daftar lagu saat halaman dimuat
        window.onload = loadSongs;
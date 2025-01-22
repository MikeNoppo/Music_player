        // Tambahkan fungsi pencarian
        const searchInput = document.getElementById('searchInput');
        let allSongs = []; // Menyimpan semua lagu

        async function loadSongs() {
            try {
                const response = await fetch('/api/songs');
                allSongs = await response.json();
                displaySongs(allSongs);
            } catch (error) {
                console.error('Gagal memuat daftar lagu:', error);
            }
        }

        function displaySongs(songs) {
            const playlist = document.getElementById('playlist');
            playlist.innerHTML = '';

            songs.forEach(song => {
                const listItem = document.createElement('li');
                listItem.textContent = song.title;
                listItem.addEventListener('click', () => {
                    playlist.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                    listItem.classList.add('active');
                    
                    audioPlayer.src = song.file;
                    audioPlayer.play();
                    currentSongSpan.textContent = song.title;
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                });
                playlist.appendChild(listItem);
            });
        }

        // Fungsi pencarian
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredSongs = allSongs.filter(song => 
                song.title.toLowerCase().includes(searchTerm)
            );
            displaySongs(filteredSongs);
        });

        // Tambahkan event listeners untuk drag & drop
        const uploadArea = document.getElementById('uploadArea');
        const uploadStatus = document.getElementById('uploadStatus');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length) {
                document.getElementById('songUpload').files = files;
            }
        });

        // Update fungsi upload dengan feedback visual
        async function uploadSong() {
            const fileInput = document.getElementById('songUpload');
            const uploadStatus = document.getElementById('uploadStatus');
            const uploadBtn = document.querySelector('.upload-btn');

            if (fileInput.files.length === 0) {
                showStatus('Pilih file MP3 terlebih dahulu!', 'error');
                return;
            }

            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            showStatus('Mengupload...', 'loading');

            const formData = new FormData();
            formData.append('song', fileInput.files[0]);

            try {
                const response = await fetch('/api/songs', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (response.ok) {
                    showStatus('✓ Upload berhasil!', 'success');
                    loadSongs();
                    fileInput.value = '';
                } else {
                    showStatus('✗ ' + result.error, 'error');
                }
            } catch (error) {
                showStatus('✗ Terjadi kesalahan saat upload', 'error');
                console.error('Error:', error);
            } finally {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Lagu';
            }
        }

        // Fungsi helper untuk menampilkan status
        function showStatus(message, type) {
            const uploadStatus = document.getElementById('uploadStatus');
            uploadStatus.textContent = message;
            uploadStatus.className = 'upload-status show ' + type;
            
            if (type === 'success' || type === 'error') {
                setTimeout(() => {
                    uploadStatus.classList.remove('show');
                }, 3000);
            }
        }

        // Muat daftar lagu saat halaman dimuat
        window.onload = loadSongs;

        const volumeBtn = document.getElementById('volumeBtn');
        const volumeControl = document.querySelector('.volume-control');
        const volumeSlider = document.getElementById('volumeSlider');
        const audioPlayer = document.getElementById('audioPlayer');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const progressBar = document.querySelector('.progress-bar');
        const progressFill = document.querySelector('.progress-fill');
        const currentTimeSpan = document.getElementById('currentTime');
        const durationSpan = document.getElementById('duration');
        const currentSongSpan = document.getElementById('currentSong');

        volumeBtn.addEventListener('click', () => {
            volumeBtn.classList.toggle('active');
            volumeControl.classList.toggle('active');
        });

        volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            audioPlayer.volume = value / 100;
            // Update icon berdasarkan level volume
            const volumeIcon = volumeBtn.querySelector('i');
            if (value == 0) {
                volumeIcon.className = 'fas fa-volume-mute';
            } else if (value < 50) {
                volumeIcon.className = 'fas fa-volume-down';
            } else {
                volumeIcon.className = 'fas fa-volume-up';
            }
        });

        // Tutup volume control saat klik di luar
        document.addEventListener('click', (e) => {
            if (!volumeBtn.contains(e.target) && !volumeControl.contains(e.target)) {
                volumeControl.classList.remove('active');
            }
        });

        // Format waktu dari detik ke MM:SS
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        // Update progress bar
        audioPlayer.addEventListener('timeupdate', () => {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressFill.style.width = `${percent}%`;
            currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
        });

        // Set duration ketika metadata audio sudah dimuat
        audioPlayer.addEventListener('loadedmetadata', () => {
            durationSpan.textContent = formatTime(audioPlayer.duration);
        });

        // Update fungsi untuk play/pause dengan feedback
        playPauseBtn.addEventListener('click', () => {
            playPauseBtn.classList.add('loading');
            
            if (audioPlayer.paused) {
                audioPlayer.play().then(() => {
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    playPauseBtn.classList.remove('loading');
                }).catch(error => {
                    console.error('Playback failed:', error);
                    playPauseBtn.classList.remove('loading');
                });
            } else {
                audioPlayer.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                playPauseBtn.classList.remove('loading');
            }
        });

        // Klik pada progress bar untuk mengubah posisi lagu
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = percent * audioPlayer.duration;
        });

        const repeatBtn = document.getElementById('repeatBtn');
        let repeatMode = 'none'; // none -> all -> one

        repeatBtn.addEventListener('click', () => {
            // Tambah kelas animasi
            repeatBtn.classList.add('animate');
            
            // Hapus kelas animasi setelah animasi selesai
            setTimeout(() => {
                repeatBtn.classList.remove('animate');
            }, 500);

            switch(repeatMode) {
                case 'none':
                    repeatMode = 'all';
                    repeatBtn.classList.add('active');
                    repeatBtn.classList.remove('repeat-one');
                    break;
                case 'all':
                    repeatMode = 'one';
                    repeatBtn.classList.add('repeat-one');
                    break;
                case 'one':
                    repeatMode = 'none';
                    repeatBtn.classList.remove('active', 'repeat-one');
                    break;
            }
        });

        // Modifikasi event listener 'ended' untuk menangani repeat
        audioPlayer.addEventListener('ended', () => {
            switch(repeatMode) {
                case 'one':
                    audioPlayer.currentTime = 0;
                    audioPlayer.play();
                    break;
                case 'all':
                    // Cari lagu berikutnya dalam playlist
                    const playlist = document.getElementById('playlist');
                    const currentSong = playlist.querySelector('.active');
                    const nextSong = currentSong.nextElementSibling || playlist.firstElementChild;
                    nextSong.click();
                    break;
                default:
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    progressFill.style.width = '0%';
                    break;
            }
        });
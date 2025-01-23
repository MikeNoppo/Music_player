        // Tambahkan fungsi pencarian
        const searchInput = document.getElementById('searchInput');
        let allSongs = []; // Menyimpan semua lagu

        async function loadSongs() {
            try {
                const response = await fetch('/api/songs');
                if (!response.ok) {
                    throw new Error('Failed to fetch songs');
                }
                const songs = await response.json();
                
                // Pastikan songs adalah array
                if (!Array.isArray(songs)) {
                    throw new Error('Invalid songs data format');
                }
                
                displaySongs(songs);
            } catch (error) {
                console.error('Failed to load songs:', error);
                showStatus('✗ Failed to load songs list', 'error');
            }
        }

        function displaySongs(songs) {
            if (!Array.isArray(songs)) {
                console.error('Invalid songs data:', songs);
                return;
            }

            const playlist = document.getElementById('playlist');
            playlist.innerHTML = '';

            songs.forEach(song => {
                const listItem = document.createElement('li');
                
                // Buat span untuk judul lagu
                const titleSpan = document.createElement('span');
                titleSpan.textContent = song.title;
                listItem.appendChild(titleSpan);

                // Tambahkan event listener untuk memutar lagu
                listItem.addEventListener('click', () => {
                    playSong(song);
                    document.querySelectorAll('#playlist li').forEach(item => {
                        item.classList.remove('active');
                    });
                    listItem.classList.add('active');
                });

                // Tambahkan tombol hapus
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.className = 'delete-btn';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const fileName = song.file.split('/').pop();
                    showDeleteConfirmation(fileName);
                });

                listItem.appendChild(deleteBtn);
                playlist.appendChild(listItem);

                if (audioPlayer.src.includes(song.file)) {
                    listItem.classList.add('active');
                }
            });
        }

        // Audio Visualizer Setup
        let audioContext;
        let analyser;
        let dataArray;
        const canvas = document.getElementById('visualizer');
        const canvasCtx = canvas.getContext('2d');
        let animationId;

        function initializeAudioVisualizer() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);
            }

            // Hubungkan audio player ke analyser
            const source = audioContext.createMediaElementSource(audioPlayer);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
        }

        function drawVisualizer() {
            // Bersihkan animasi sebelumnya jika ada
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }

            // Sesuaikan ukuran canvas dengan display
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            function draw() {
                animationId = requestAnimationFrame(draw);

                // Dapatkan data frekuensi
                analyser.getByteFrequencyData(dataArray);

                // Clear canvas
                canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                // Hitung lebar bar
                const barWidth = (canvas.width / dataArray.length) * 2.5;
                let barHeight;
                let x = 0;

                // Gambar bars
                for (let i = 0; i < dataArray.length; i++) {
                    barHeight = (dataArray[i] / 255) * canvas.height;

                    // Gradient warna
                    const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
                    gradient.addColorStop(0, '#1DB954'); // Spotify green
                    gradient.addColorStop(1, '#1ed760'); // Lighter green

                    canvasCtx.fillStyle = gradient;
                    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                    x += barWidth + 1;
                }
            }

            draw();
        }

        // Tambahkan fungsi untuk menggambar teks MIKEL
        function drawIdleVisualizer() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }

            // Sesuaikan ukuran canvas
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            // Setup untuk animasi idle
            const letters = ['M', 'I', 'K', 'E', 'L'];
            const spacing = canvas.width / (letters.length + 1);
            let amplitude = 30; // Tinggi gelombang
            
            function drawIdle() {
                animationId = requestAnimationFrame(drawIdle);

                // Clear canvas dengan efek fade
                canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

                // Gambar setiap huruf
                letters.forEach((letter, index) => {
                    // Posisi x untuk setiap huruf
                    const x = spacing * (index + 1);
                    
                    // Animasi naik turun yang berbeda untuk setiap huruf
                    const y = canvas.height / 2 + 
                             Math.sin(Date.now() * 0.002 + index * 0.5) * amplitude;

                    // Warna hijau
                    const color = '#1DB954'; // Warna hijau sesuai visualisasi
                    
                    // Setup font
                    canvasCtx.font = 'bold 48px Montserrat';
                    canvasCtx.textAlign = 'center';
                    canvasCtx.textBaseline = 'middle';
                    
                    // Efek glow
                    canvasCtx.shadowBlur = 20;
                    canvasCtx.shadowColor = color;
                    
                    // Gambar teks
                    canvasCtx.fillStyle = color;
                    canvasCtx.fillText(letter, x, y);
                });
            }

            drawIdle();
        }

        // Update fungsi playSong
        function playSong(song) {
            if (!audioContext) {
                initializeAudioVisualizer();
            }
            
            audioPlayer.src = song.file;
            audioPlayer.play();
            document.getElementById('currentSong').textContent = song.title;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            
            // Mulai visualizer musik
            drawVisualizer();
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
        const fileInput = document.getElementById('songUpload');
        const uploadContent = document.querySelector('.upload-content');
        const filePreview = document.querySelector('.file-preview');
        const fileName = document.querySelector('.file-name');
        const fileSize = document.querySelector('.file-size');
        const removeFileBtn = document.querySelector('.remove-file');
        const uploadBtn = document.querySelector('.upload-btn');

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function handleFileSelect(file) {
            if (file) {
                // Update preview
                fileName.textContent = file.name;
                fileSize.textContent = formatFileSize(file.size);
                uploadArea.classList.add('has-file');
                filePreview.style.display = 'flex';
                uploadContent.style.display = 'none';
                uploadBtn.style.display = 'inline-block'; // Tampilkan tombol upload
            } else {
                resetUploadForm();
            }
        }

        function resetUploadForm() {
            fileInput.value = '';
            uploadArea.classList.remove('has-file');
            filePreview.style.display = 'none';
            uploadContent.style.display = 'block';
            uploadBtn.style.display = 'none'; // Sembunyikan tombol upload
        }

        // File Input Change
        fileInput.addEventListener('change', (e) => {
            handleFileSelect(e.target.files[0]);
        });

        // Drag and Drop
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
            const file = e.dataTransfer.files[0];
            fileInput.files = e.dataTransfer.files;
            handleFileSelect(file);
        });

        // Remove File
        removeFileBtn.addEventListener('click', () => {
            resetUploadForm();
        });

        // Update Upload Function
        async function uploadSong() {
            if (!fileInput.files.length) {
                showStatus('Pilih file MP3 terlebih dahulu!', 'error');
                return;
            }

            const file = fileInput.files[0];
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                showStatus('File terlalu besar! Maksimum 50MB', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('song', file);

            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

            try {
                const response = await fetch('/api/songs', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (response.ok) {
                    showStatus('✓ Upload berhasil!', 'success');
                    loadSongs(); // Reload song list
                    resetUploadForm(); // Reset form setelah upload berhasil
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
        function showStatus(message, type = 'success') {
            const statusDiv = document.getElementById('status');
            if (!statusDiv) {
                const div = document.createElement('div');
                div.id = 'status';
                document.body.appendChild(div);
            }
            
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = `status ${type}`;
            status.style.display = 'block';
            
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
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

        // Update event listener untuk play/pause
        playPauseBtn.addEventListener('click', () => {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            if (audioPlayer.paused) {
                audioPlayer.play();
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                if (!animationId) {
                    drawVisualizer();
                }
            } else {
                audioPlayer.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
        });

        // Klik pada progress bar untuk mengubah posisi lagu
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = percent * audioPlayer.duration;
        });

        const repeatBtn = document.getElementById('repeatBtn');
        let repeatMode = 'none'; // none -> one

        repeatBtn.addEventListener('click', () => {
            // Tambah kelas animasi
            repeatBtn.classList.add('animate');
            
            // Hapus kelas animasi setelah animasi selesai
            setTimeout(() => {
                repeatBtn.classList.remove('animate');
            }, 500);

            switch(repeatMode) {
                case 'none':
                    repeatMode = 'one';
                    repeatBtn.classList.add('active', 'repeat-one');
                    break;
                case 'one':
                    repeatMode = 'none';
                    repeatBtn.classList.remove('active', 'repeat-one');
                    break;
            }
        });

        // Fungsi untuk memutar lagu berikutnya
        function playNextSong() {
            const playlist = document.getElementById('playlist');
            const currentSong = playlist.querySelector('.active');
            
            if (currentSong) {
                const nextSong = currentSong.nextElementSibling;
                if (nextSong) {
                    nextSong.click();
                } else {
                    // Jika di akhir playlist, kembali ke lagu pertama
                    const firstSong = playlist.firstElementChild;
                    if (firstSong) {
                        firstSong.click();
                    }
                }
            } else {
                // Jika tidak ada lagu yang aktif, putar lagu pertama
                const firstSong = playlist.firstElementChild;
                if (firstSong) {
                    firstSong.click();
                }
            }
        }

        // Fungsi untuk memutar lagu sebelumnya
        function playPreviousSong() {
            const playlist = document.getElementById('playlist');
            const currentSong = playlist.querySelector('.active');
            
            if (currentSong) {
                const previousSong = currentSong.previousElementSibling;
                if (previousSong) {
                    previousSong.click();
                } else {
                    // Jika di awal playlist, putar lagu terakhir
                    const lastSong = playlist.lastElementChild;
                    if (lastSong) {
                        lastSong.click();
                    }
                }
            } else {
                // Jika tidak ada lagu yang aktif, putar lagu terakhir
                const lastSong = playlist.lastElementChild;
                if (lastSong) {
                    lastSong.click();
                }
            }
        }

        // Tambahkan event listeners untuk tombol next dan previous
        nextBtn.addEventListener('click', playNextSong);
        prevBtn.addEventListener('click', playPreviousSong);

        // Update event listener untuk ended (autoplay next song)
        audioPlayer.addEventListener('ended', () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }

            if (repeatMode === 'one') {
                audioPlayer.currentTime = 0;
                audioPlayer.play();
                drawVisualizer();
                repeatMode = 'none';
                repeatBtn.classList.remove('active', 'repeat-one');
            } else {
                // Putar lagu berikutnya secara otomatis
                playNextSong();
            }
        });

        // Tambahkan fungsi untuk memastikan state repeat tetap konsisten
        function updateRepeatState() {
            switch(repeatMode) {
                case 'all':
                    repeatBtn.classList.add('active');
                    repeatBtn.classList.remove('repeat-one');
                    break;
                case 'one':
                    repeatBtn.classList.add('active', 'repeat-one');
                    break;
                case 'none':
                    repeatBtn.classList.remove('active', 'repeat-one');
                    break;
            }
        }

        // Initial state: sembunyikan tombol upload
        document.addEventListener('DOMContentLoaded', () => {
            uploadBtn.style.display = 'none';
            drawIdleVisualizer();
        });

        // Fungsi untuk menangani konfirmasi hapus
        function showDeleteConfirmation(fileName) {
            // Validasi fileName
            if (!fileName) {
                showStatus('✗ Nama file tidak valid', 'error');
                return;
            }

            const modal = document.getElementById('deleteModal');
            const confirmBtn = modal.querySelector('.confirm-btn');
            const cancelBtn = modal.querySelector('.cancel-btn');

            // Tampilkan modal dengan animasi
            modal.classList.add('active');

            // Handle konfirmasi
            const handleConfirm = async () => {
                try {
                    const response = await fetch(`/api/songs/${encodeURIComponent(fileName)}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        showStatus('✓ Lagu berhasil dihapus!', 'success');
                        loadSongs(); // Reload daftar lagu
                    } else {
                        const result = await response.json();
                        showStatus('✗ ' + (result.error || 'Gagal menghapus lagu'), 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showStatus('✗ Terjadi kesalahan saat menghapus lagu', 'error');
                } finally {
                    // Tutup modal
                    modal.classList.remove('active');
                    
                    // Cleanup event listeners
                    confirmBtn.removeEventListener('click', handleConfirm);
                    cancelBtn.removeEventListener('click', handleCancel);
                }
            };

            // Handle pembatalan
            const handleCancel = () => {
                modal.classList.remove('active');
                // Cleanup event listeners
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };

            // Tambahkan event listeners
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);

            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    handleCancel();
                }
            });
        }

        // Mobile Menu Handling
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });

        // Close sidebar when clicking a song on mobile
        document.querySelectorAll('#playlist li').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
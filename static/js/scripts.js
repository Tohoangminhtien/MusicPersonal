let audio = new Audio();
let isPlaying = false;
let isRepeat = false;
let currentTrackIndex = 0;
let songs = [];

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateProgressBar() {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('current-time').textContent = formatTime(audio.currentTime);
        document.getElementById('total-time').textContent = formatTime(audio.duration);
    }
}

function updateCurrentSong(songName) {
    const currentSongElement = document.getElementById('current-song');
    currentSongElement.textContent = songName || 'Select a song to play';
    // Reset animation
    currentSongElement.style.animation = 'none';
    currentSongElement.offsetHeight; // Trigger reflow
    currentSongElement.style.animation = null;
}

function togglePlay() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (isPlaying) {
        audio.pause();
        playPauseBtn.textContent = '▶️';
        playPauseBtn.classList.remove('active');
    } else {
        audio.play();
        playPauseBtn.textContent = '⏸️';
        playPauseBtn.classList.add('active');
    }
    isPlaying = !isPlaying;
}

function toggleRepeat() {
    const repeatBtn = document.getElementById('repeat-btn');
    isRepeat = !isRepeat;
    if (isRepeat) {
        repeatBtn.textContent = '🔂';
        repeatBtn.classList.add('active');
    } else {
        repeatBtn.textContent = '🔁';
        repeatBtn.classList.remove('active');
    }
    audio.loop = isRepeat;
}

function previousTrack() {
    if (songs.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + songs.length) % songs.length;
    playMusic(songs[currentTrackIndex].path, currentTrackIndex);
}

function nextTrack() {
    if (songs.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % songs.length;
    playMusic(songs[currentTrackIndex].path, currentTrackIndex);
}

function playMusic(path, index) {
    audio.src = path;
    currentTrackIndex = index;
    audio.play();
    isPlaying = true;

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: path.slice(5, -4),
            artwork: [
                { src: "static/logo/music.png", sizes: '96x96', type: 'image/jpeg' },
                { src: "static/logo/music.png", sizes: '128x128', type: 'image/jpeg' },
                { src: "static/logo/music.png", sizes: '256x256', type: 'image/jpeg' }
            ]
        });
    }

    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.textContent = '⏸️';
    playPauseBtn.classList.add('active');

    // Update song title
    updateCurrentSong(songs[index].name);

    // Highlight current playing song
    document.querySelectorAll('tr').forEach(row => {
        row.classList.remove('bg-blue-50');
        const playBtn = row.querySelector('.delete-btn');
        if (playBtn) playBtn.textContent = '▶️';
    });
    const rows = document.querySelectorAll('tr');
    if (rows[index + 1]) { // +1 because of header row
        rows[index + 1].classList.add('bg-blue-50');
        const playBtn = rows[index + 1].querySelector('.delete-btn');
        if (playBtn) playBtn.textContent = '⏸️';
    }
}

// Auto play next track when current track ends
audio.addEventListener('ended', () => {
    if (!isRepeat) {
        nextTrack();
    }
});

// Update progress bar as audio plays
audio.addEventListener('timeupdate', updateProgressBar);

axios.get("/music")
    .then(response => {
        const table = document.getElementById("table");
        songs = response.data;

        songs.forEach((song, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td class="whitespace-nowrap py-5 px-5 text-sm font-medium text-gray-900">${song.stt}</td>
                        <td class="whitespace-nowrap py-5 px-5 text-sm font-medium text-gray-900">${song.name}</td>
                        <td class="whitespace-nowrap py-5 px-5 text-sm">
                            <button onclick="playMusic('${song.path}', ${index})" class="text-indigo-600 hover:text-indigo-900 delete-btn">▶️</button>
                        </td>
                        <td class="whitespace-nowrap py-5 px-5 text-center text-sm">
                            <button onclick="" class="text-indigo-600 hover:text-indigo-900 delete-btn">❌</button>
                        </td>
                    `;
            table.appendChild(row);
        });
    })
    .catch(err => {
        alert(err);
    });

function save() {
    axios.post("/music", {
        name: document.getElementById("music_name").value,
        url: document.getElementById("music_url").value
    }).then(res => {
        window.location.href = "/"
    }).catch(er => {
        alert(er.response.data.message)
    })
}
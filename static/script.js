let currentVideoId = null;
let playlist = [];
let currentIndex = 0;
let isPlaying = false;
let searchType = 'video';

const elements = {};

document.addEventListener('DOMContentLoaded', function() {
    elements.searchInput = document.getElementById('search-input');
    elements.searchBtn = document.getElementById('search-btn');
    elements.typeBtns = document.querySelectorAll('.type-btn');
    elements.resultsGrid = document.getElementById('results-grid');
    elements.resultsCount = document.getElementById('results-count');
    elements.loadingSpinner = document.getElementById('loading-spinner');
    elements.videoContainer = document.getElementById('video-container');
    elements.playerWrapper = document.getElementById('player-wrapper');
    elements.playerIframe = document.getElementById('player-iframe');
    elements.thumbnailPreview = document.getElementById('thumbnail-preview');
    elements.playerControls = document.getElementById('player-controls');
    elements.playPauseBtn = document.getElementById('play-pause-btn');
    elements.prevBtn = document.getElementById('prev-btn');
    elements.nextBtn = document.getElementById('next-btn');
    elements.progressBar = document.getElementById('progress-bar');
    elements.progressPlayed = document.getElementById('progress-played');
    elements.currentTime = document.getElementById('current-time');
    elements.duration = document.getElementById('duration');
    elements.volumeBtn = document.getElementById('volume-btn');
    elements.volumeSlider = document.getElementById('volume-slider');
    elements.fullscreenBtn = document.getElementById('fullscreen-btn');
    elements.videoTitle = document.getElementById('video-title');
    elements.videoChannel = document.getElementById('video-channel');
    elements.nowPlaying = document.getElementById('now-playing');
    elements.loader = document.getElementById('loader');
    elements.doubleClickHint = document.getElementById('double-click-hint');
    elements.queueList = document.getElementById('queue-list');
    elements.playlistQueue = document.getElementById('playlist-queue');
    elements.clearQueueBtn = document.getElementById('clear-queue');

    setupEventListeners();
    console.log('App initialized');
});

function loadVideo(videoId, title, channel) {
    currentVideoId = videoId;
    elements.loader.classList.add('visible');
    elements.thumbnailPreview.classList.remove('visible');

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=http://localhost:5000`;
    elements.playerIframe.src = embedUrl;
    
    elements.videoTitle.textContent = title || 'Loading...';
    elements.videoChannel.textContent = channel || '';
    elements.nowPlaying.textContent = title || '';

    isPlaying = true;
    updatePlayPauseButton();
    updateActiveQueueItem();
}

function togglePlay() {
    if (!currentVideoId) return;
    
    if (isPlaying) {
        elements.playerIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        isPlaying = false;
    } else {
        elements.playerIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        isPlaying = true;
    }
    updatePlayPauseButton();
}

function seekTo(seconds) {
    if (!currentVideoId) return;
    elements.playerIframe.contentWindow.postMessage(`{"event":"command","func":"seekTo","args":[${seconds > 0 ? '+' : ''}${seconds}]}`, '*');
    showSkipHint(seconds > 0 ? 'forward' : 'backward');
}

function showSkipHint(direction) {
    elements.doubleClickHint.classList.add('visible');
    setTimeout(() => {
        elements.doubleClickHint.classList.remove('visible');
    }, 800);
}

function playNext() {
    if (playlist.length > 0 && currentIndex < playlist.length - 1) {
        currentIndex++;
        const video = playlist[currentIndex];
        loadVideo(video.video_id, video.title, video.channel);
    }
}

function playPrevious() {
    if (playlist.length > 0 && currentIndex > 0) {
        currentIndex--;
        const video = playlist[currentIndex];
        loadVideo(video.video_id, video.title, video.channel);
    }
}

function updatePlayPauseButton() {
    const icon = elements.playPauseBtn.querySelector('i');
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        elements.videoContainer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

async function search(query) {
    if (!query.trim()) return;

    elements.loadingSpinner.classList.add('visible');
    elements.resultsGrid.innerHTML = '';

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`);
        const data = await response.json();

        elements.loadingSpinner.classList.remove('visible');

        if (data.error) {
            showError(data.error);
            return;
        }

        if (data.results && data.results.length > 0) {
            elements.resultsCount.textContent = `${data.results.length} results`;
            elements.resultsGrid.innerHTML = '';
            data.results.forEach((item) => {
                if (searchType === 'video') {
                    elements.resultsGrid.appendChild(createVideoCard(item));
                } else {
                    elements.resultsGrid.appendChild(createPlaylistCard(item));
                }
            });
        } else {
            elements.resultsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                </div>
            `;
        }
    } catch (error) {
        elements.loadingSpinner.classList.remove('visible');
        showError('Search failed: ' + error.message);
    }
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
        <img src="${video.thumbnail}" alt="${video.title}">
        <div class="video-card-info">
            <div class="video-card-title">${video.title}</div>
            <div class="video-card-channel">${video.channel}</div>
        </div>
    `;
    card.onclick = function() {
        console.log('Clicking video:', video.video_id);
        addToQueue(video);
        loadVideo(video.video_id, video.title, video.channel);
    };
    return card;
}

function createPlaylistCard(playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.innerHTML = `
        <img src="${playlist.thumbnail}" alt="${playlist.title}">
        <div class="playlist-card-info">
            <div class="playlist-card-title">${playlist.title}</div>
            <div class="playlist-card-count">${playlist.channel}</div>
        </div>
    `;
    card.onclick = function() {
        loadPlaylistData(playlist.playlist_id);
    };
    return card;
}

async function loadPlaylistData(playlistId) {
    elements.loadingSpinner.classList.add('visible');
    elements.resultsGrid.innerHTML = '';

    try {
        const response = await fetch(`/api/playlist/${playlistId}`);
        const data = await response.json();

        elements.loadingSpinner.classList.remove('visible');

        if (data.error) {
            showError(data.error);
            return;
        }

        if (data.videos && data.videos.length > 0) {
            playlist = data.videos;
            currentIndex = 0;
            updateQueueUI();

            const firstVideo = playlist[0];
            loadVideo(firstVideo.video_id, firstVideo.title, firstVideo.channel);

            elements.playlistQueue.classList.add('active');
        }
    } catch (error) {
        elements.loadingSpinner.classList.remove('visible');
        showError('Failed to load playlist');
    }
}

function addToQueue(video) {
    const exists = playlist.find(v => v.video_id === video.video_id);
    if (!exists) {
        playlist.push(video);
        currentIndex = playlist.length - 1;
        updateQueueUI();
    } else {
        currentIndex = playlist.findIndex(v => v.video_id === video.video_id);
        updateActiveQueueItem();
    }
}

function updateQueueUI() {
    if (playlist.length === 0) {
        elements.queueList.innerHTML = '<p class="queue-empty">No videos in queue</p>';
        return;
    }

    elements.queueList.innerHTML = playlist.map((video, index) => `
        <div class="queue-item ${index === currentIndex ? 'active' : ''}" data-index="${index}">
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="queue-item-info">
                <div class="queue-item-title">${video.title}</div>
                <div class="queue-item-channel">${video.channel}</div>
            </div>
        </div>
    `).join('');

    elements.queueList.querySelectorAll('.queue-item').forEach(item => {
        item.onclick = function() {
            currentIndex = parseInt(this.dataset.index);
            const video = playlist[currentIndex];
            loadVideo(video.video_id, video.title, video.channel);
        };
    });
}

function updateActiveQueueItem() {
    elements.queueList.querySelectorAll('.queue-item').forEach((item, index) => {
        item.classList.toggle('active', index === currentIndex);
    });
}

function clearQueue() {
    playlist = [];
    currentIndex = 0;
    updateQueueUI();
    elements.playlistQueue.classList.remove('active');
    elements.playerIframe.src = '';
    currentVideoId = null;
    elements.videoTitle.textContent = 'Select a video to play';
    elements.videoChannel.textContent = '';
    elements.nowPlaying.textContent = '';
    isPlaying = false;
    updatePlayPauseButton();
}

function showError(message) {
    elements.resultsGrid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

function setupEventListeners() {
    let searchTimeout;
    elements.searchInput.oninput = function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            search(e.target.value);
        }, 500);
    };

    elements.searchBtn.onclick = function() {
        search(elements.searchInput.value);
    };

    elements.searchInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
            search(elements.searchInput.value);
        }
    };

    elements.typeBtns.forEach(btn => {
        btn.onclick = function() {
            elements.typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            searchType = btn.dataset.type;
            elements.searchInput.placeholder = searchType === 'video' ? 'Search videos...' : 'Search playlists...';
            if (elements.searchInput.value) {
                search(elements.searchInput.value);
            }
        };
    });

    elements.playPauseBtn.onclick = togglePlay;
    elements.prevBtn.onclick = playPrevious;
    elements.nextBtn.onclick = playNext;

    elements.fullscreenBtn.onclick = toggleFullscreen;
    elements.clearQueueBtn.onclick = clearQueue;

    elements.videoContainer.onclick = function(e) {
        togglePlay();
    };

    elements.videoContainer.ondblclick = function(e) {
        const rect = elements.videoContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const halfWidth = rect.width / 2;

        if (clickX < halfWidth) {
            seekTo(-5);
        } else {
            seekTo(5);
        }
    };

    document.onkeydown = function(e) {
        if (e.target.tagName === 'INPUT') return;

        switch(e.key) {
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                seekTo(-5);
                break;
            case 'ArrowRight':
                seekTo(5);
                break;
        }
    };
}
class MoodMusicApp {
    constructor() {
        this.currentAudio = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Mood button event listeners
        const moodButtons = document.querySelectorAll('.mood-btn');
        moodButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mood = button.getAttribute('data-mood');
                this.getMoodRecommendations(mood);
            });
        });

        // Custom mood input
        const customMoodBtn = document.getElementById('customMoodBtn');
        const customMoodInput = document.getElementById('customMood');
        
        customMoodBtn.addEventListener('click', () => {
            const mood = customMoodInput.value.trim();
            if (mood) {
                this.getMoodRecommendations(mood);
            }
        });

        // Enter key for custom mood input
        customMoodInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const mood = customMoodInput.value.trim();
                if (mood) {
                    this.getMoodRecommendations(mood);
                }
            }
        });
    }

    async getMoodRecommendations(mood) {
        this.showLoading();
        this.hideError();
        this.hideResults();

        try {
            const response = await fetch('/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mood: mood })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.displayResults(data);
        } catch (error) {
            console.error('Error:', error);
            this.showError();
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError() {
        document.getElementById('error').classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error').classList.add('hidden');
    }

    showResults() {
        document.getElementById('results').classList.remove('hidden');
    }

    hideResults() {
        document.getElementById('results').classList.add('hidden');
    }

    displayResults(data) {
        const currentMoodSpan = document.getElementById('currentMood');
        const songList = document.getElementById('songList');
        
        currentMoodSpan.textContent = data.mood;
        songList.innerHTML = '';

        if (data.songs && data.songs.length > 0) {
            data.songs.forEach(song => {
                const songCard = this.createSongCard(song);
                songList.appendChild(songCard);
            });
            this.showResults();
        } else {
            this.showError();
        }
    }

    createSongCard(song) {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';

        const imageUrl = song.image_url || '/static/default-album.jpg';
        
        songCard.innerHTML = `
            <img src="${imageUrl}" alt="${song.album}" class="song-image" onerror="this.src='/static/default-album.jpg'">
            <div class="song-info">
                <div class="song-title">${this.escapeHtml(song.name)}</div>
                <div class="song-artist">${this.escapeHtml(song.artist)}</div>
                <div class="song-album">${this.escapeHtml(song.album)}</div>
            </div>
            <div class="song-actions">
                <a href="${song.spotify_url}" target="_blank" class="spotify-link">
                    Open in Spotify
                </a>
                ${song.preview_url ? 
                    `<button class="preview-btn" onclick="app.togglePreview('${song.preview_url}', this)">
                        ▶️ Preview
                    </button>` : 
                    `<button class="preview-btn" disabled>
                        No Preview
                    </button>`
                }
            </div>
        `;

        return songCard;
    }

    togglePreview(previewUrl, button) {
        if (this.currentAudio && !this.currentAudio.paused) {
            // Stop current audio
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.updateAllPreviewButtons('▶️ Preview', false);
            
            // If clicking the same button, just stop
            if (this.currentAudio.src === previewUrl) {
                this.currentAudio = null;
                return;
            }
        }

        // Start new audio
        this.currentAudio = new Audio(previewUrl);
        this.currentAudio.volume = 0.5;
        
        button.textContent = '⏸️ Stop';
        button.disabled = false;

        this.currentAudio.play().catch(error => {
            console.error('Error playing audio:', error);
            button.textContent = '❌ Error';
        });

        this.currentAudio.addEventListener('ended', () => {
            this.updateAllPreviewButtons('▶️ Preview', false);
            this.currentAudio = null;
        });

        this.currentAudio.addEventListener('error', () => {
            button.textContent = '❌ Error';
            this.currentAudio = null;
        });
    }

    updateAllPreviewButtons(text, disabled) {
        const previewButtons = document.querySelectorAll('.preview-btn:not([disabled])');
        previewButtons.forEach(btn => {
            if (btn.textContent.includes('Stop') || btn.textContent.includes('Preview')) {
                btn.textContent = text;
                btn.disabled = disabled;
            }
        });
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MoodMusicApp();
});

// Clean up audio when page unloads
window.addEventListener('beforeunload', () => {
    if (window.app && window.app.currentAudio) {
        window.app.currentAudio.pause();
    }
});

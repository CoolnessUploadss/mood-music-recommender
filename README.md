# Mood Music Recommender

A Flask web application that recommends songs based on your current mood using the Spotify Web API.

## Features

- 🎯 Mood-based song recommendations
- 🎵 Preview songs directly in the browser
- 🎨 Beautiful, responsive UI
- 🔗 Direct links to Spotify
- 📱 Mobile-friendly design

## Setup Instructions

### 1. Prerequisites

- Python 3.7 or higher
- A Spotify Developer Account

### 2. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app name and description
5. Copy your **Client ID** and **Client Secret**

### 3. Project Setup

1. Clone or download the project files
2. Create a virtual environment:
   ```bash
   python -m venv mood_music_env
   source mood_music_env/bin/activate  # On Windows: mood_music_env\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` and add your Spotify credentials:
   ```
   SPOTIFY_CLIENT_ID=your_actual_client_id
   SPOTIFY_CLIENT_SECRET=your_actual_client_secret
   ```

### 4. Project Structure

Create the following folder structure:

```
mood-music-app/
├── app.py
├── requirements.txt
├── .env
├── .env.example
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

### 5. Run the Application

1. Activate your virtual environment (if not already active)
2. Run the Flask app:
   ```bash
   python app.py
   ```

3. Open your browser and go to `http://localhost:5000`

## How to Use

1. **Choose Your Mood**: Click on one of the mood buttons (Happy, Sad, Energetic, etc.) or type a custom mood
2. **Get Recommendations**: The app will fetch songs that match your mood from Spotify
3. **Preview Songs**: Click the preview button to listen to 30-second previews
4. **Open in Spotify**: Click "Open in Spotify" to play the full song

## How It Works

The application maps different moods to Spotify's audio features:

- **Happy**: High valence, moderate energy, danceable
- **Sad**: Low valence, low energy, slower tempo
- **Energetic**: High energy, fast tempo, very danceable
- **Chill**: Moderate valence, low energy, relaxed
- **Romantic**: Moderate valence, acoustic elements
- **Angry**: Low valence, high energy, fast tempo

## Customization

You can easily customize the mood mappings by editing the `get_mood_features()` function in `app.py`. Spotify's audio features include:

- **Valence**: Musical positivity (0.0 to 1.0)
- **Energy**: Intensity and power (0.0 to 1.0)
- **Danceability**: How suitable for dancing (0.0 to 1.0)
- **Acousticness**: Whether the track is acoustic (0.0 to 1.0)
- **Tempo**: BPM (beats per minute)

## Troubleshooting

### Common Issues

1. **"Failed to authenticate with Spotify"**
   - Check that your Client ID and Client Secret are correct in the `.env` file
   - Make sure the `.env` file is in the same directory as `app.py`

2. **"No songs found for this mood"**
   - Try a different mood or check your internet connection
   - The Spotify API might be temporarily unavailable

3. **Songs not playing**
   - Some songs don't have preview URLs available
   - Check your browser's audio settings

### API Rate Limits

The Spotify Web API has rate limits. If you encounter rate limiting:
- Wait a few minutes before making more requests
- Consider implementing caching for production use

## Contributing

Feel free to fork this project and submit pull requests for improvements!

## License

This project is for educational purposes. Make sure to comply with Spotify's Terms of Service when using their API.

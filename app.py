from flask import Flask, render_template, request, jsonify
import requests
import base64
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Spotify API credentials - you'll need to set these in a .env file
CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

def get_spotify_token():
    """Get access token from Spotify using client credentials flow"""
    auth_string = f"{CLIENT_ID}:{CLIENT_SECRET}"
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = str(base64.b64encode(auth_bytes), "utf-8")
    
    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": f"Basic {auth_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}
    
    try:
        result = requests.post(url, headers=headers, data=data)
        json_result = result.json()
        return json_result["access_token"]
    except Exception as e:
        print(f"Error getting token: {e}")
        return None

def get_auth_header(token):
    """Create authorization header for Spotify API requests"""
    return {"Authorization": f"Bearer {token}"}

def get_mood_features(mood):
    """Map moods to Spotify audio features"""
    mood_mappings = {
        'happy': {
            'valence': 0.8,
            'energy': 0.7,
            'danceability': 0.7,
            'tempo': 120
        },
        'sad': {
            'valence': 0.2,
            'energy': 0.3,
            'danceability': 0.3,
            'tempo': 80
        },
        'energetic': {
            'valence': 0.7,
            'energy': 0.9,
            'danceability': 0.8,
            'tempo': 140
        },
        'chill': {
            'valence': 0.5,
            'energy': 0.3,
            'danceability': 0.4,
            'tempo': 90
        },
        'romantic': {
            'valence': 0.6,
            'energy': 0.4,
            'danceability': 0.5,
            'acousticness': 0.7,
            'tempo': 100
        },
        'angry': {
            'valence': 0.2,
            'energy': 0.9,
            'danceability': 0.6,
            'tempo': 150
        }
    }
    return mood_mappings.get(mood.lower(), mood_mappings['happy'])

def search_songs_by_mood(token, mood, limit=10):
    """Search for songs based on mood using Spotify's recommendations endpoint"""
    features = get_mood_features(mood)
    
    # Get some seed genres based on mood
    mood_genres = {
        'happy': ['pop', 'dance', 'funk'],
        'sad': ['indie', 'alternative', 'folk'],
        'energetic': ['electronic', 'rock', 'hip-hop'],
        'chill': ['ambient', 'jazz', 'indie'],
        'romantic': ['r-n-b', 'soul', 'indie'],
        'angry': ['metal', 'rock', 'punk']
    }
    
    seed_genres = ','.join(mood_genres.get(mood.lower(), ['pop']))
    
    url = "https://api.spotify.com/v1/recommendations"
    headers = get_auth_header(token)
    
    params = {
        'seed_genres': seed_genres,
        'limit': limit,
        'target_valence': features.get('valence', 0.5),
        'target_energy': features.get('energy', 0.5),
        'target_danceability': features.get('danceability', 0.5)
    }
    
    if 'acousticness' in features:
        params['target_acousticness'] = features['acousticness']
    
    try:
        result = requests.get(url, headers=headers, params=params)
        json_result = result.json()
        
        songs = []
        for track in json_result.get('tracks', []):
            song_info = {
                'name': track['name'],
                'artist': ', '.join([artist['name'] for artist in track['artists']]),
                'album': track['album']['name'],
                'spotify_url': track['external_urls']['spotify'],
                'preview_url': track.get('preview_url'),
                'image_url': track['album']['images'][0]['url'] if track['album']['images'] else None
            }
            songs.append(song_info)
        
        return songs
    except Exception as e:
        print(f"Error searching songs: {e}")
        return []

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/recommend', methods=['POST'])
def recommend():
    """API endpoint to get song recommendations based on mood"""
    try:
        data = request.get_json()
        mood = data.get('mood', '').strip()
        
        if not mood:
            return jsonify({'error': 'Mood is required'}), 400
        
        # Get Spotify token
        token = get_spotify_token()
        if not token:
            return jsonify({'error': 'Failed to authenticate with Spotify'}), 500
        
        # Get song recommendations
        songs = search_songs_by_mood(token, mood)
        
        if not songs:
            return jsonify({'error': 'No songs found for this mood'}), 404
        
        return jsonify({
            'mood': mood,
            'songs': songs
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

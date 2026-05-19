from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY', '')
YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

def search_youtube(query, search_type='video', max_results=20):
    if not YOUTUBE_API_KEY:
        return {'error': 'YouTube API key not configured. Set YOUTUBE_API_KEY environment variable.'}

    if search_type == 'video':
        url = f'{YOUTUBE_API_BASE}/search'
        params = {
            'part': 'snippet',
            'q': query,
            'type': 'video',
            'maxResults': max_results,
            'key': YOUTUBE_API_KEY
        }
    else:
        url = f'{YOUTUBE_API_BASE}/search'
        params = {
            'part': 'snippet',
            'q': query,
            'type': 'playlist',
            'maxResults': max_results,
            'key': YOUTUBE_API_KEY
        }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if 'error' in data:
            return {'error': data['error'].get('message', 'API error')}

        results = []
        if search_type == 'video':
            for item in data.get('items', []):
                video_id = item['id']['videoId']
                snippet = item['snippet']
                thumbs = snippet.get('thumbnails', {})
                results.append({
                    'video_id': video_id,
                    'title': snippet['title'],
                    'thumbnail': thumbs.get('high', {}).get('url') or thumbs.get('medium', {}).get('url', ''),
                    'thumbnail_default': thumbs.get('default', {}).get('url', ''),
                    'thumbnail_medium': thumbs.get('medium', {}).get('url', ''),
                    'thumbnail_high': thumbs.get('high', {}).get('url', ''),
                    'thumbnail_maxres': thumbs.get('maxres', {}).get('url', ''),
                    'channel': snippet['channelTitle'],
                    'channel_id': snippet['channelId'],
                    'description': snippet.get('description', '')
                })
        else:
            for item in data.get('items', []):
                playlist_id = item['id']['playlistId']
                snippet = item['snippet']
                thumbs = snippet.get('thumbnails', {})
                results.append({
                    'playlist_id': playlist_id,
                    'title': snippet['title'],
                    'thumbnail': thumbs.get('high', {}).get('url') or thumbs.get('medium', {}).get('url', ''),
                    'thumbnail_default': thumbs.get('default', {}).get('url', ''),
                    'thumbnail_medium': thumbs.get('medium', {}).get('url', ''),
                    'thumbnail_high': thumbs.get('high', {}).get('url', ''),
                    'thumbnail_maxres': thumbs.get('maxres', {}).get('url', ''),
                    'channel': snippet['channelTitle'],
                    'channel_id': snippet['channelId'],
                    'description': snippet.get('description', '')
                })

        return {'results': results}
    except Exception as e:
        return {'error': str(e)}

def get_playlist_items(playlist_id, max_results=50):
    if not YOUTUBE_API_KEY:
        return {'error': 'YouTube API key not configured'}

    url = f'{YOUTUBE_API_BASE}/playlistItems'
    params = {
        'part': 'snippet',
        'playlistId': playlist_id,
        'maxResults': max_results,
        'key': YOUTUBE_API_KEY
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if 'error' in data:
            return {'error': data['error'].get('message', 'API error')}

        videos = []
        for item in data.get('items', []):
            snippet = item['snippet']
            video_id = snippet['resourceId'].get('videoId', '')
            if video_id:
                thumbs = snippet.get('thumbnails', {})
                videos.append({
                    'video_id': video_id,
                    'title': snippet['title'],
                    'thumbnail': thumbs.get('high', {}).get('url') or thumbs.get('medium', {}).get('url', ''),
                    'thumbnail_default': thumbs.get('default', {}).get('url', ''),
                    'thumbnail_medium': thumbs.get('medium', {}).get('url', ''),
                    'thumbnail_high': thumbs.get('high', {}).get('url', ''),
                    'thumbnail_maxres': thumbs.get('maxres', {}).get('url', ''),
                    'position': snippet.get('position', 0),
                    'channel': snippet['channelTitle']
                })

        return {'videos': videos}
    except Exception as e:
        return {'error': str(e)}

def get_video_details(video_id):
    if not YOUTUBE_API_KEY:
        return {'error': 'YouTube API key not configured'}

    url = f'{YOUTUBE_API_BASE}/videos'
    params = {
        'part': 'contentDetails,statistics,snippet',
        'id': video_id,
        'key': YOUTUBE_API_KEY
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if 'error' in data:
            return {'error': data['error'].get('message', 'API error')}

        if data.get('items'):
            item = data['items'][0]
            snippet = item.get('snippet', {})
            thumbnails = snippet.get('thumbnails', {})
            return {
                'video_id': video_id,
                'duration': item['contentDetails'].get('duration', ''),
                'views': item['statistics'].get('viewCount', '0'),
                'likes': item['statistics'].get('likeCount', '0'),
                'thumbnails': {
                    'default': thumbnails.get('default', {}).get('url', ''),
                    'medium': thumbnails.get('medium', {}).get('url', ''),
                    'high': thumbnails.get('high', {}).get('url', ''),
                    'maxres': thumbnails.get('maxres', {}).get('url', '')
                }
            }
        return {'error': 'Video not found'}
    except Exception as e:
        return {'error': str(e)}

def get_thumbnails(video_id):
    if not YOUTUBE_API_KEY:
        return {'error': 'YouTube API key not configured'}

    url = f'{YOUTUBE_API_BASE}/videos'
    params = {
        'part': 'snippet',
        'id': video_id,
        'key': YOUTUBE_API_KEY
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if 'error' in data:
            return {'error': data['error'].get('message', 'API error')}

        if data.get('items'):
            snippet = data['items'][0].get('snippet', {})
            thumbnails = snippet.get('thumbnails', {})
            return {
                'video_id': video_id,
                'default': thumbnails.get('default', {}).get('url', ''),
                'medium': thumbnails.get('medium', {}).get('url', ''),
                'high': thumbnails.get('high', {}).get('url', ''),
                'maxres': thumbnails.get('maxres', {}).get('url', ''),
                'title': snippet.get('title', '')
            }
        return {'error': 'Video not found'}
    except Exception as e:
        return {'error': str(e)}

@app.route('/')
def index():
    api_key = YOUTUBE_API_KEY if YOUTUBE_API_KEY else None
    return render_template('index.html', api_key=api_key)

@app.route('/api/search')
def api_search():
    query = request.args.get('q', '')
    search_type = request.args.get('type', 'video')
    if not query:
        return jsonify({'error': 'Query parameter required'})
    return jsonify(search_youtube(query, search_type))

@app.route('/api/playlist/<playlist_id>')
def api_playlist(playlist_id):
    return jsonify(get_playlist_items(playlist_id))

@app.route('/api/video/<video_id>')
def api_video(video_id):
    return jsonify(get_video_details(video_id))

@app.route('/api/thumbnails/<video_id>')
def api_thumbnails(video_id):
    return jsonify(get_thumbnails(video_id))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
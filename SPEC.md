# YouTube Video Player - Specification

## 1. Project Overview
- **Project Name**: YouTube Playlist Player
- **Type**: Web Application (Flask)
- **Core Functionality**: Search YouTube videos/playlists, watch videos with custom controls, playlist playback with auto-advance
- **Target Users**: Anyone wanting to watch YouTube videos with a clean, custom player interface

## 2. UI/UX Specification

### Layout Structure
- **Header**: Fixed top bar with logo, search bar, and search type toggle (Videos/Playlists)
- **Main Content**:
  - Left sidebar: Playlist queue (when playing from playlist)
  - Center: Video player area
  - Right/Bottom: Search results
- **Responsive Breakpoints**:
  - Mobile: < 768px (stacked layout)
  - Tablet: 768px - 1024px
  - Desktop: > 1024px (three-column layout)

### Visual Design

#### Color Palette
- **Background**: `#0f0f0f` (YouTube dark)
- **Surface**: `#1a1a1a`
- **Surface Hover**: `#2a2a2a`
- **Primary Accent**: `#ff0000` (YouTube red)
- **Secondary**: `#3ea6ff` (blue for links/highlights)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#aaaaaa`
- **Border**: `#333333`

#### Typography
- **Font Family**: `'Roboto', sans-serif`
- **Headings**: 18px bold
- **Body**: 14px regular
- **Small**: 12px

#### Spacing
- **Base unit**: 8px
- **Padding small**: 8px
- **Padding medium**: 16px
- **Padding large**: 24px

### Components

#### Search Bar
- Rounded input with icon
- Toggle for Video/Playlist search
- Debounced search (500ms)

#### Video Player
- Custom HTML5 video player (embedded YouTube via iframe API)
- Thumbnail preview when paused
- Double-click left: rewind 5 seconds
- Double-click right: forward 5 seconds

#### Player Controls
- Play/Pause button (centered large icon)
- Progress bar (clickable to seek)
- Time display (current / duration)
- Volume slider
- Fullscreen toggle
- Skip buttons for playlist (previous/next)

#### Video Card
- Thumbnail (16:9)
- Title (max 2 lines, ellipsis)
- Channel name
- View count
- Duration badge

#### Playlist Queue Panel
- List of videos in playlist
- Currently playing indicator
- Click to switch video

#### Loading States
- Skeleton loaders for search results
- Spinner for video loading
- Progress bar for buffering

### Animations
- Smooth transitions on hover (0.2s ease)
- Fade in for search results
- Pulse animation for loading

## 3. Functionality Specification

### Core Features

#### Video Search
- Search YouTube videos using Data API v3
- Display results in grid (3 columns desktop, 2 tablet, 1 mobile)
- Show: thumbnail, title, channel, views, duration

#### Playlist Search
- Search YouTube playlists
- Display: thumbnail, title, video count, channel

#### Video Playback
- Embed YouTube videos via iframe embed
- Custom controls overlay
- Double-click gesture detection (left/right halves)

#### Playlist Playback
- Load all videos from playlist
- Auto-advance to next video
- Queue sidebar showing all videos
- Shuffle option (optional)

#### Player Controls
- Play/Pause toggle
- Seek via progress bar
- Volume control (mute/unmute)
- Skip to next/previous in playlist
- Keyboard shortcuts:
  - Space: play/pause
  - Arrow Left: -5 seconds
  - Arrow Right: +5 seconds
  - Arrow Up/Down: volume

### API Endpoints (Flask)
- `GET /` - Main page
- `GET /api/search?q=<query>&type=video|playlist` - Search YouTube
- `GET /api/playlist/<playlist_id>` - Get playlist videos
- `GET /api/video/<video_id>` - Get video details

### Edge Cases
- No search results: Show "No results found" message
- API error: Show error message with retry option
- Invalid video ID: Show error and return to search
- Network failure: Show offline message
- Empty playlist: Show "No videos in playlist"

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme with red accents matches YouTube aesthetic
- [ ] Search bar is prominent and functional
- [ ] Video cards display all required information
- [ ] Player controls are visible and responsive
- [ ] Loading states show appropriate animations
- [ ] Mobile layout is usable

### Functional Checkpoints
- [ ] Can search for videos and see results
- [ ] Can search for playlists and see results
- [ ] Can click video to start playback
- [ ] Double-click left side rewinds 5 seconds
- [ ] Double-click right side forwards 5 seconds
- [ ] Play/Pause button works
- [ ] Progress bar shows current position and is seekable
- [ ] Can load playlist and see all videos
- [ ] Playlist auto-advances to next video
- [ ] Previous/Next buttons work in playlist mode

## 5. Technical Notes

### YouTube API
- Use Google API Client Library for Python or direct HTTP requests
- API Key required (user must provide)
- Endpoint: `https://www.googleapis.com/youtube/v3/`

### Dependencies
- Flask
- Requests (for API calls)
- Google API Client (optional, can use direct HTTP)

### File Structure
```
/youtube_player
  app.py
  /static
    style.css
    script.js
  /templates
    index.html
  /templates
```
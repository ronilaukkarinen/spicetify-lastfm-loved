# ❤️ Last.fm loved tracks column for Spotify

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Spotify](https://img.shields.io/badge/Spicetify-1ED760?style=for-the-badge&logo=spotify&logoColor=white)](https://spicetify.app/)
[![Last.fm](https://img.shields.io/badge/Last.fm-D51007?style=for-the-badge&logo=last.fm&logoColor=white)](https://last.fm/)

[A Spicetify](https://github.com/spicetify) extension that adds a Last.fm loved tracks column to Spotify playlists and artist views with clickable heart icons.

## Features

- **Heart Icon Column**: Adds a clickable heart column to playlist and artist views
- **Real-time Status**: Shows current loved status from your Last.fm account
- **One-click Love/Unlove**: Toggle track love status directly from Spotify
- **Visual Feedback**: Green hearts for loved tracks, gray for unloved
- **Seamless Integration**: Matches Spotify's native design language
- **Auto-refresh**: Automatically updates when navigating between views

## Requirements

- [Spicetify](https://spicetify.app/) installed and running
- [Last.fm account](https://last.fm/) with API access
- Last.fm API key and session key

## Setup

### 1. Get Last.fm API Credentials

#### Step 1: Get your API Key

1. Go to [Last.fm API account creation](https://www.last.fm/api/account/create)
2. Fill in the form:
   - **Application name**: `Spicetify LastFM Loved` (or any name you prefer)
   - **Application description**: `Spicetify extension for Last.fm loved tracks`
   - **Application homepage URL**: `https://github.com/ronilaukkarinen/spicetify-lastfm-loved`
   - **Callback URL**: Leave empty or use `http://localhost`
3. Submit the form and note your **API Key** and **Shared Secret**

#### Step 2: Get your Session Key (Authentication)

1. Replace `YOUR_API_KEY` in this URL with your actual API key:
   ```
   https://www.last.fm/api/auth/?api_key=YOUR_API_KEY&cb=http://localhost
   ```
2. Open this URL in your browser and authorize the application
3. After authorization, you'll be redirected to a page with a token in the URL like:
   ```
   http://localhost/?token=SOME_TOKEN_HERE
   ```
4. Copy the token from the URL
5. Create an API signature using this command (replace the values):
   ```bash
   echo -n "api_keyYOUR_API_KEYmethodauth.getSessiontokenYOUR_TOKENYOUR_SHARED_SECRET" | md5sum | cut -d' ' -f1
   ```
6. Make a GET request to:
   ```
   https://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=YOUR_API_KEY&token=YOUR_TOKEN&api_sig=YOUR_MD5_HASH&format=json
   ```
7. The response will contain your session key in the `key` field

#### What you'll need for configuration:

- **API Key**: From step 1
- **Username**: Your Last.fm username  
- **Session Key**: From authentication process above

### 2. Install the extension

#### Via Spicetify Marketplace

```bash
spicetify config inject_css 1 inject_theme_js 1
spicetify apply
spicetify marketplace
```
Search for "LastFM Loved Tracks" and install.

#### Manual installation

```bash
cd ~/.config/spicetify/Extensions
git clone https://github.com/ronilaukkarinen/spicetify-lastfm-loved.git
spicetify config extensions lastfmLoved.js
spicetify apply
```

### 3. Configure the Extension

1. Open Spotify with Spicetify
2. Right-click anywhere → **"Last.fm Loved Config"**
3. Enter your credentials (from Step 1):
   - **API Key**: Your Last.fm API key (from the API account creation)
   - **Username**: Your Last.fm username (your profile name)
   - **Session Key**: Your authenticated session key (from the authentication process)
4. Click **Save**

**Note**: All three fields are required. The extension won't work without a valid session key.

## Usage

Once configured, you'll see a heart column (♥) in your playlists and artist views:

- **Gray heart**: Track is not loved on Last.fm
- **Green heart**: Track is loved on Last.fm
- **Click heart**: Toggle love/unlove status

The extension automatically syncs with your Last.fm account and updates the display in real-time.

## Troubleshooting

### Hearts not appearing

- Ensure you have the latest version of Spicetify installed
- Check that the extension is properly loaded in Spicetify settings
- Verify your Last.fm credentials in the configuration

### API errors

- Double-check your API key and session key
- Ensure your Last.fm account has proper API access
- Try refreshing the Spotify page

### Column not showing

- The extension works with playlist and artist views
- Try navigating to a different playlist and back
- Restart Spotify if the column doesn't appear

## Privacy

This extension:

- **Does**: Connect to Last.fm API to fetch and update loved track status
- **Does**: Store your API credentials locally in browser storage
- **Does Not**: Send your data to any third parties
- **Does Not**: Track your listening habits beyond Last.fm integration

Your Last.fm credentials are stored locally and only used for API communication with Last.fm servers.

## Development

### Setup

```bash
git clone https://github.com/ronilaukkarinen/spicetify-lastfm-loved.git
cd spicetify-lastfm-loved
```

### Local development

```bash
# Link to Spicetify extensions directory
ln -s $(pwd)/lastfmLoved.js ~/.config/spicetify/Extensions/
spicetify config extensions lastfmLoved.js
spicetify apply
```

### Debugging

- Open Spotify Developer Tools (Ctrl+Shift+I) (you need to `spicetify enable-devtools` first)
- Check console for any Last.fm API errors
- Verify network requests to Last.fm API endpoints

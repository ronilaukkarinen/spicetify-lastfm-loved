(function lastfmLoved() {
    if (!Spicetify.Platform || !Spicetify.React || !Spicetify.ReactDOM) {
        setTimeout(lastfmLoved, 100);
        return;
    }

    const { React, ReactDOM } = Spicetify;
    const { useState, useEffect } = React;

    let lastfmApiKey = '';
    let lastfmUsername = '';
    let lastfmSessionKey = '';
    let lastfmSharedSecret = '';

    const CONFIG_KEY = 'lastfm-loved-config';

    // Global state management for heart synchronization
    const heartComponents = new Set();

    function registerHeartComponent(component) {
        heartComponents.add(component);
    }

    function unregisterHeartComponent(component) {
        heartComponents.delete(component);
    }

    function syncAllHearts(artist, track, newLovedStatus) {
        const normalizedArtist = artist.toLowerCase().trim();
        const normalizedTrack = track.toLowerCase().trim();

        heartComponents.forEach(component => {
            if (component.artist.toLowerCase().trim() === normalizedArtist &&
                component.track.toLowerCase().trim() === normalizedTrack) {
                component.updateLoved(newLovedStatus);
            }
        });
    }

    function loadConfig() {
        const config = localStorage.getItem(CONFIG_KEY);
        if (config) {
            const parsed = JSON.parse(config);
            lastfmApiKey = parsed.apiKey || '';
            lastfmUsername = parsed.username || '';
            lastfmSessionKey = parsed.sessionKey || '';
            lastfmSharedSecret = parsed.sharedSecret || '';
        }
    }

    function saveConfig() {
        const config = {
            apiKey: lastfmApiKey,
            username: lastfmUsername,
            sessionKey: lastfmSessionKey,
            sharedSecret: lastfmSharedSecret
        };
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    }

    async function getLastfmLovedStatus(artist, track) {
        if (!lastfmApiKey || !lastfmUsername) return null;

        // Normalize names for consistency
        const normalizedArtist = artist.toLowerCase().trim();
        const normalizedTrack = track.toLowerCase().trim();

        console.log(`Last.fm API Request - Artist: "${normalizedArtist}", Track: "${normalizedTrack}"`);

        try {
            const response = await fetch(
                `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${lastfmApiKey}&artist=${encodeURIComponent(normalizedArtist)}&track=${encodeURIComponent(normalizedTrack)}&username=${lastfmUsername}&format=json`
            );
            const data = await response.json();

            if (data.track && data.track.userloved) {
                const loved = data.track.userloved === '1';
                console.log(`Last.fm API Result - "${normalizedArtist} - ${normalizedTrack}" is ${loved ? 'LOVED' : 'NOT LOVED'}`);
                return loved;
            }
        } catch (error) {
            console.error('Error fetching Last.fm loved status:', error);
        }
        return null;
    }

    async function md5(str) {
        // JavaScript MD5 implementation since Web Crypto API doesn't support MD5
        function md5cycle(x, k) {
            var a = x[0], b = x[1], c = x[2], d = x[3];

            a = ff(a, b, c, d, k[0], 7, -680876936);
            d = ff(d, a, b, c, k[1], 12, -389564586);
            c = ff(c, d, a, b, k[2], 17, 606105819);
            b = ff(b, c, d, a, k[3], 22, -1044525330);
            a = ff(a, b, c, d, k[4], 7, -176418897);
            d = ff(d, a, b, c, k[5], 12, 1200080426);
            c = ff(c, d, a, b, k[6], 17, -1473231341);
            b = ff(b, c, d, a, k[7], 22, -45705983);
            a = ff(a, b, c, d, k[8], 7, 1770035416);
            d = ff(d, a, b, c, k[9], 12, -1958414417);
            c = ff(c, d, a, b, k[10], 17, -42063);
            b = ff(b, c, d, a, k[11], 22, -1990404162);
            a = ff(a, b, c, d, k[12], 7, 1804603682);
            d = ff(d, a, b, c, k[13], 12, -40341101);
            c = ff(c, d, a, b, k[14], 17, -1502002290);
            b = ff(b, c, d, a, k[15], 22, 1236535329);

            a = gg(a, b, c, d, k[1], 5, -165796510);
            d = gg(d, a, b, c, k[6], 9, -1069501632);
            c = gg(c, d, a, b, k[11], 14, 643717713);
            b = gg(b, c, d, a, k[0], 20, -373897302);
            a = gg(a, b, c, d, k[5], 5, -701558691);
            d = gg(d, a, b, c, k[10], 9, 38016083);
            c = gg(c, d, a, b, k[15], 14, -660478335);
            b = gg(b, c, d, a, k[4], 20, -405537848);
            a = gg(a, b, c, d, k[9], 5, 568446438);
            d = gg(d, a, b, c, k[14], 9, -1019803690);
            c = gg(c, d, a, b, k[3], 14, -187363961);
            b = gg(b, c, d, a, k[8], 20, 1163531501);
            a = gg(a, b, c, d, k[13], 5, -1444681467);
            d = gg(d, a, b, c, k[2], 9, -51403784);
            c = gg(c, d, a, b, k[7], 14, 1735328473);
            b = gg(b, c, d, a, k[12], 20, -1926607734);

            a = hh(a, b, c, d, k[5], 4, -378558);
            d = hh(d, a, b, c, k[8], 11, -2022574463);
            c = hh(c, d, a, b, k[11], 16, 1839030562);
            b = hh(b, c, d, a, k[14], 23, -35309556);
            a = hh(a, b, c, d, k[1], 4, -1530992060);
            d = hh(d, a, b, c, k[4], 11, 1272893353);
            c = hh(c, d, a, b, k[7], 16, -155497632);
            b = hh(b, c, d, a, k[10], 23, -1094730640);
            a = hh(a, b, c, d, k[13], 4, 681279174);
            d = hh(d, a, b, c, k[0], 11, -358537222);
            c = hh(c, d, a, b, k[3], 16, -722521979);
            b = hh(b, c, d, a, k[6], 23, 76029189);
            a = hh(a, b, c, d, k[9], 4, -640364487);
            d = hh(d, a, b, c, k[12], 11, -421815835);
            c = hh(c, d, a, b, k[15], 16, 530742520);
            b = hh(b, c, d, a, k[2], 23, -995338651);

            a = ii(a, b, c, d, k[0], 6, -198630844);
            d = ii(d, a, b, c, k[7], 10, 1126891415);
            c = ii(c, d, a, b, k[14], 15, -1416354905);
            b = ii(b, c, d, a, k[5], 21, -57434055);
            a = ii(a, b, c, d, k[12], 6, 1700485571);
            d = ii(d, a, b, c, k[3], 10, -1894986606);
            c = ii(c, d, a, b, k[10], 15, -1051523);
            b = ii(b, c, d, a, k[1], 21, -2054922799);
            a = ii(a, b, c, d, k[8], 6, 1873313359);
            d = ii(d, a, b, c, k[15], 10, -30611744);
            c = ii(c, d, a, b, k[6], 15, -1560198380);
            b = ii(b, c, d, a, k[13], 21, 1309151649);
            a = ii(a, b, c, d, k[4], 6, -145523070);
            d = ii(d, a, b, c, k[11], 10, -1120210379);
            c = ii(c, d, a, b, k[2], 15, 718787259);
            b = ii(b, c, d, a, k[9], 21, -343485551);

            x[0] = add32(a, x[0]);
            x[1] = add32(b, x[1]);
            x[2] = add32(c, x[2]);
            x[3] = add32(d, x[3]);
        }

        function cmn(q, a, b, x, s, t) {
            a = add32(add32(a, q), add32(x, t));
            return add32((a << s) | (a >>> (32 - s)), b);
        }

        function ff(a, b, c, d, x, s, t) {
            return cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }

        function gg(a, b, c, d, x, s, t) {
            return cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }

        function hh(a, b, c, d, x, s, t) {
            return cmn(b ^ c ^ d, a, b, x, s, t);
        }

        function ii(a, b, c, d, x, s, t) {
            return cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        function md51(s) {
            var n = s.length,
                state = [1732584193, -271733879, -1732584194, 271733878],
                i;
            for (i = 64; i <= s.length; i += 64) {
                md5cycle(state, md5blk(s.substring(i - 64, i)));
            }
            s = s.substring(i - 64);
            var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (i = 0; i < s.length; i++)
                tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
            tail[i >> 2] |= 0x80 << ((i % 4) << 3);
            if (i > 55) {
                md5cycle(state, tail);
                for (i = 0; i < 16; i++) tail[i] = 0;
            }
            tail[14] = n * 8;
            md5cycle(state, tail);
            return state;
        }

        function md5blk(s) {
            var md5blks = [],
                i;
            for (i = 0; i < 64; i += 4) {
                md5blks[i >> 2] = s.charCodeAt(i) +
                    (s.charCodeAt(i + 1) << 8) +
                    (s.charCodeAt(i + 2) << 16) +
                    (s.charCodeAt(i + 3) << 24);
            }
            return md5blks;
        }

        function rhex(n) {
            var hex_chr = '0123456789abcdef'.split('');
            var s = '',
                j = 0;
            for (; j < 4; j++)
                s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] +
                hex_chr[(n >> (j * 8)) & 0x0F];
            return s;
        }

        function hex(x) {
            for (var i = 0; i < x.length; i++)
                x[i] = rhex(x[i]);
            return x.join('');
        }

        function add32(a, b) {
            return (a + b) & 0xFFFFFFFF;
        }

        return hex(md51(str));
    }

    async function toggleLastfmLoved(artist, track, isLoved) {
        if (!lastfmApiKey || !lastfmSessionKey || !lastfmSharedSecret) {
            console.error('Missing Last.fm credentials for API call');
            return false;
        }

        // Normalize names for consistency
        const normalizedArtist = artist.toLowerCase().trim();
        const normalizedTrack = track.toLowerCase().trim();

        const method = isLoved ? 'track.unlove' : 'track.love';

        try {
            // Create parameters for API signature
            const params = {
                api_key: lastfmApiKey,
                artist: normalizedArtist,
                method: method,
                sk: lastfmSessionKey,
                track: normalizedTrack
            };

            // Sort parameters alphabetically and create signature string
            const sortedKeys = Object.keys(params).sort();
            let sigString = '';
            sortedKeys.forEach(key => {
                sigString += key + params[key];
            });
            sigString += lastfmSharedSecret;

            // Generate MD5 signature
            const apiSig = await md5(sigString);
            params.api_sig = apiSig;
            params.format = 'json';

            const response = await fetch(`https://ws.audioscrobbler.com/2.0/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(params)
            });

            if (!response.ok) {
                console.error('Last.fm API HTTP error:', response.status, response.statusText);
                return false;
            }

            const data = await response.json();
            if (data.error) {
                console.error('Last.fm API error:', data.message);
                return false;
            }

            const newStatus = !isLoved;
            syncAllHearts(normalizedArtist, normalizedTrack, newStatus);
            return true;
        } catch (error) {
            console.error('Error toggling Last.fm loved status:', error);
            return false;
        }
    }

    function HeartIcon({ isLoved, onClick, loading, disabled }) {
        const heartStyle = {
            width: '16px',
            height: '16px',
            cursor: (loading || disabled) ? 'default' : 'pointer',
            opacity: loading ? 0.5 : (disabled ? 0.3 : 1),
            color: isLoved ? '#1ed760' : '#b3b3b3',
            fill: isLoved ? 'currentColor' : 'none',
            stroke: 'currentColor',
            strokeWidth: '2',
            transition: 'opacity 0.3s ease, color 0.3s ease',
            pointerEvents: (loading || disabled) ? 'none' : 'auto'
        };

        const handleClick = (e) => {
            console.log('HeartIcon clicked, loading:', loading, 'disabled:', disabled);
            if (loading || disabled) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            if (onClick) {
                onClick(e);
            }
        };

        return React.createElement(
            'svg',
            {
                style: heartStyle,
                onClick: handleClick,
                viewBox: '0 0 24 24',
                xmlns: 'http://www.w3.org/2000/svg'
            },
            React.createElement('path', {
                d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
            })
        );
    }

    function LastfmLovedCell({ artist, track }) {
        const [isLoved, setIsLoved] = useState(null);
        const [loading, setLoading] = useState(false);
        const [hasData, setHasData] = useState(false);

        // Create component reference for global sync
        const componentRef = React.useRef({
            artist: artist,
            track: track,
            updateLoved: (newStatus) => {
                console.log(`Syncing heart for "${artist} - ${track}" to ${newStatus ? 'LOVED' : 'UNLOVED'}`);
                setIsLoved(newStatus);
            }
        });

        useEffect(() => {
            // Register this component for global sync
            componentRef.current.artist = artist;
            componentRef.current.track = track;
            registerHeartComponent(componentRef.current);

            console.log(`LastfmLovedCell useEffect - Artist: "${artist}", Track: "${track}"`);
            if (artist && track) {
                setLoading(true);
                setIsLoved(null); // Reset state to prevent stale data
                setHasData(false);
                getLastfmLovedStatus(artist, track).then(loved => {
                    console.log(`LastfmLovedCell result for "${artist} - ${track}": ${loved}`);
                    setIsLoved(loved);
                    setHasData(loved !== null);
                    setLoading(false);
                }).catch(error => {
                    console.error(`Error getting loved status for "${artist} - ${track}":`, error);
                    setIsLoved(null);
                    setHasData(false);
                    setLoading(false);
                });
            }

            // Cleanup function to unregister component
            return () => {
                unregisterHeartComponent(componentRef.current);
            };
        }, [artist, track]); // Re-run when artist or track changes

        const handleClick = async () => {
            console.log(`Heart clicked for "${artist} - ${track}", current status: ${isLoved}, hasData: ${hasData}, loading: ${loading}`);

            if (loading || isLoved === null || !hasData) {
                console.log(`Click ignored for "${artist} - ${track}" - not ready`);
                return;
            }

            console.log(`Toggling loved status for "${artist} - ${track}" from ${isLoved} to ${!isLoved}`);
            setLoading(true);
            const success = await toggleLastfmLoved(artist, track, isLoved);
            if (success) {
                console.log(`Successfully toggled "${artist} - ${track}" - sync will handle state update`);
                // Don't update local state - let global sync handle it
            } else {
                console.log(`Failed to toggle loved status for "${artist} - ${track}"`);
            }
            setLoading(false);
        };

        const containerStyle = {
            boxSizing: 'border-box',
            WebkitTapHighlightColor: 'transparent',
            backgroundColor: 'transparent',
            border: '0px',
            borderRadius: 'var(--encore-button-corner-radius, 9999px)',
            cursor: 'pointer',
            textAlign: 'center',
            textDecoration: 'none',
            touchAction: 'manipulation',
            transitionDuration: 'var(--shortest-3)',
            transitionTimingFunction: 'var(--productive)',
            userSelect: 'none',
            verticalAlign: 'middle',
            willChange: 'transform',
            color: 'var(--text-bright-accent, #107434)',
            minInlineSize: '0px',
            minBlockSize: 'var(--encore-control-size-smaller, 32px)',
            paddingBlock: 'var(--encore-spacing-tighter-2, 8px)',
            paddingInline: '0px',
            display: 'inline-flex',
            gap: 'var(--encore-spacing-tighter-2)',
            WebkitBoxAlign: 'center',
            alignItems: 'center',
            WebkitBoxPack: 'center',
            transitionProperty: 'color, transform',
            opacity: hasData ? 1 : 0.3,
            transition: 'opacity 0.3s ease',
            position: 'relative',
            top: '1px'
        };

        if (loading) {
            return React.createElement(
                'div',
                { style: containerStyle },
                React.createElement('div', {
                    style: {
                        width: '16px',
                        height: '16px',
                        border: '2px solid #b3b3b3',
                        borderTop: '2px solid #1ed760',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }
                })
            );
        }

        return React.createElement(
            'div',
            { style: containerStyle },
            React.createElement(HeartIcon, {
                isLoved: isLoved || false,
                onClick: hasData ? handleClick : undefined,
                loading: loading,
                disabled: !hasData
            })
        );
    }

    function addSideNavHeart() {
        const sideNavNowPlaying = document.querySelector('.main-nowPlayingView-contextItemInfo');
        if (!sideNavNowPlaying) {
            return; // No side nav now playing
        }

        const existingHeart = sideNavNowPlaying.parentNode.querySelector('.lastfm-loved-sidenav');

        // Extract track and artist info from side nav now playing
        const trackLink = sideNavNowPlaying.querySelector('.main-trackInfo-name a');
        const artistLinks = sideNavNowPlaying.querySelectorAll('.main-trackInfo-artists a');

        if (!trackLink || !artistLinks.length) {
            console.log('Last.fm Loved Extension: Could not find track/artist in side nav now playing');
            return;
        }

        const trackName = trackLink.textContent.trim();
        // Get the first artist (main artist)
        const artistName = artistLinks[0].textContent.trim();

        console.log(`SIDE_NAV - Track: "${trackName}", Artist: "${artistName}"`);

        // If we already have a heart, check if it's for the same track
        if (existingHeart) {
            const currentTrack = existingHeart.getAttribute('data-track');
            const currentArtist = existingHeart.getAttribute('data-artist');

            if (currentTrack === trackName && currentArtist === artistName) {
                console.log('SIDE_NAV: Heart already exists for current track');
                return; // Same track, keep existing heart
            } else {
                console.log('SIDE_NAV: Track changed, updating heart');
                // Track changed, update the component with new props
                ReactDOM.render(
                    React.createElement(LastfmLovedCell, {
                        artist: artistName,
                        track: trackName,
                        key: `${artistName}-${trackName}`
                    }),
                    existingHeart
                );
                existingHeart.setAttribute('data-track', trackName);
                existingHeart.setAttribute('data-artist', artistName);
                return;
            }
        }

        console.log(`Last.fm Loved Extension: Adding heart for side nav now playing: ${artistName} - ${trackName}`);

        // Find the button area to insert our heart
        const buttonArea = sideNavNowPlaying.querySelector('.O5NOY8Xw4NH0IhBZu8tm');

        if (buttonArea) {
            // Create heart container as a button to match other buttons
            const heartButton = document.createElement('button');
            heartButton.className = 'lastfm-loved-sidenav Button-buttonTertiary-medium-iconOnly-useBrowserDefaultFocusStyle-condensed';
            heartButton.setAttribute('aria-label', 'Toggle Last.fm loved');
            heartButton.setAttribute('data-encore-id', 'buttonTertiary');
            heartButton.setAttribute('data-track', trackName);
            heartButton.setAttribute('data-artist', artistName);
            heartButton.style.cssText = `
                background: none;
                border: 0;
                margin-right: 0;
                margin-left: 12px;
                padding: 0;
            `;

            // Render React component directly in the button
            ReactDOM.render(
                React.createElement(LastfmLovedCell, {
                    artist: artistName,
                    track: trackName,
                    key: `${artistName}-${trackName}`
                }),
                heartButton
            );

            // Insert before the existing button area
            buttonArea.parentNode.insertBefore(heartButton, buttonArea);
            console.log('Last.fm Loved Extension: Heart added to side nav');
        }
    }

    function addNowPlayingHeart() {
        console.log('addNowPlayingHeart called');
        const nowPlayingWidget = document.querySelector('[data-testid="now-playing-widget"]');
        if (!nowPlayingWidget) {
            console.log('addNowPlayingHeart: No widget found');
            return; // No now playing widget
        }

        const existingHeart = nowPlayingWidget.querySelector('.lastfm-loved-nowplaying');

        // Extract track and artist info from now playing
        const trackLink = nowPlayingWidget.querySelector('.main-trackInfo-name a');
        const artistLink = nowPlayingWidget.querySelector('.main-trackInfo-artists a');

        if (!trackLink || !artistLink) {
            console.log('Last.fm Loved Extension: Could not find track/artist in now playing');
            return;
        }

        const trackName = trackLink.textContent.trim();
        const artistName = artistLink.textContent.trim();

        console.log(`NOW_PLAYING - Track: "${trackName}", Artist: "${artistName}"`);

        // If we already have a heart, check if it's for the same track
        if (existingHeart) {
            const currentTrack = existingHeart.getAttribute('data-track');
            const currentArtist = existingHeart.getAttribute('data-artist');

            if (currentTrack === trackName && currentArtist === artistName) {
                console.log('NOW_PLAYING: Heart already exists for current track');
                return; // Same track, keep existing heart
            } else {
                console.log('NOW_PLAYING: Track changed, updating heart');
                // Track changed, update the component with new props
                ReactDOM.render(
                    React.createElement(LastfmLovedCell, {
                        artist: artistName,
                        track: trackName,
                        key: `${artistName}-${trackName}`
                    }),
                    existingHeart
                );
                existingHeart.setAttribute('data-track', trackName);
                existingHeart.setAttribute('data-artist', artistName);
                return;
            }
        }

        console.log(`Last.fm Loved Extension: Adding heart for now playing: ${artistName} - ${trackName}`);

        // Find the button area to insert our heart
        const buttonArea = nowPlayingWidget.querySelector('.ZbFkATBbLkWh2SHMXDt6');

        if (buttonArea) {
            // Create heart container
            const heartContainer = document.createElement('div');
            heartContainer.className = 'lastfm-loved-nowplaying';
            heartContainer.setAttribute('data-track', trackName);
            heartContainer.setAttribute('data-artist', artistName);

            // Render React component
            ReactDOM.render(
                React.createElement(LastfmLovedCell, {
                    artist: artistName,
                    track: trackName,
                    key: `${artistName}-${trackName}`
                }),
                heartContainer
            );

            // Insert before the existing buttons
            buttonArea.insertBefore(heartContainer, buttonArea.firstChild);
            console.log('Last.fm Loved Extension: Heart added to now playing');
        }
    }

    function addLovedColumn() {
        console.log('Last.fm Loved Extension: Searching for track rows...');

        // Find all tracklist views
        const tracklists = document.querySelectorAll('.main-trackList-trackList.main-trackList-indexable');
        console.log('Last.fm Loved Extension: Found', tracklists.length, 'tracklist views');

        tracklists.forEach(tracklist => {
            // Add header if not already present
            const headerRow = tracklist.querySelector('.main-trackList-trackListHeaderRow');
            if (headerRow && !headerRow.querySelector('.lastfm-loved-header')) {
                // Modify the grid template to add space for our column after Date added
                const currentGridTemplate = headerRow.style.gridTemplateColumns;
                if (currentGridTemplate && !currentGridTemplate.includes('lastfm')) {
                    // Insert our column between [var2] (Date added) and [var3] (My Scrobbles)
                    const newGridTemplate = currentGridTemplate.replace(
                        '[var2] 2fr [var3] 2fr',
                        '[var2] 2fr [lastfm] 120px [var3] 2fr'
                    );
                    headerRow.style.gridTemplateColumns = newGridTemplate;
                    console.log('Grid template updated:', newGridTemplate);
                } else if (!currentGridTemplate) {
                    // Fallback: set the full grid template if none exists
                    headerRow.style.gridTemplateColumns = '[index] 16px [first] 5fr [var1] 3fr [var2] 2fr [lastfm] 120px [var3] 2fr [last] minmax(120px, 1fr) !important';
                    console.log('Grid template set from scratch');
                }

                // Find the My Scrobbles column to insert before it
                const myScrobblesColumn = headerRow.querySelector('.sort-play-column');

                if (myScrobblesColumn) {
                    const headerCell = document.createElement('div');
                    headerCell.className = 'lastfm-loved-header main-trackList-rowSectionVariable';
                    headerCell.setAttribute('role', 'columnheader');
                    headerCell.setAttribute('aria-colindex', '5');
                    headerCell.setAttribute('aria-sort', 'none');
                    headerCell.setAttribute('tabindex', '-1');
                    headerCell.style.cssText = `
                        grid-area: auto / lastfm;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    `;

                    // Match the structure of other headers exactly
                    const headerWrapper = document.createElement('div');
                    const headerButton = document.createElement('button');
                    headerButton.className = 'main-trackList-column main-trackList-sortable';
                    headerButton.setAttribute('tabindex', '-1');
                    headerButton.style.cssText = `
                        background: none;
                        border: none;
                        color: inherit;
                        cursor: default;
                        padding: 0;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    `;

                    const headerSpan = document.createElement('span');
                    headerSpan.className = 'e-9890-text encore-text-body-small standalone-ellipsis-one-line';
                    headerSpan.setAttribute('data-encore-id', 'text');
                    headerSpan.textContent = 'Last.fm loved';

                    headerButton.appendChild(headerSpan);
                    headerWrapper.appendChild(headerButton);
                    headerCell.appendChild(headerWrapper);

                    // Add the divider element like other headers
                    const divider = document.createElement('div');
                    divider.className = 'I7SbihsVaE4CAUqLMa45';
                    headerCell.appendChild(divider);

                    // Insert before the My Scrobbles column and update aria-colindex values
                    headerRow.insertBefore(headerCell, myScrobblesColumn);
                    myScrobblesColumn.setAttribute('aria-colindex', '6');

                    // Update Duration column aria-colindex
                    const durationColumn = headerRow.querySelector('.main-trackList-rowSectionEnd');
                    if (durationColumn) {
                        durationColumn.setAttribute('aria-colindex', '7');
                    }

                    console.log('Last.fm Loved Extension: Header added');
                }
            }

            // Find all track rows in this tracklist
            const trackRows = tracklist.querySelectorAll('[role="row"] .main-trackList-trackListRow');
            console.log('Last.fm Loved Extension: Found', trackRows.length, 'track rows in tracklist');

            trackRows.forEach((row, index) => {
                if (row.querySelector('.lastfm-loved-cell')) {
                    return; // Already has our heart
                }

                // Modify the grid template for this row to match header
                const currentGridTemplate = row.style.gridTemplateColumns;
                if (currentGridTemplate && !currentGridTemplate.includes('lastfm')) {
                    const newGridTemplate = currentGridTemplate.replace(
                        '[var2] 2fr [var3] 2fr',
                        '[var2] 2fr [lastfm] 120px [var3] 2fr'
                    );
                    row.style.gridTemplateColumns = newGridTemplate;
                } else if (!currentGridTemplate) {
                    // Fallback: set the full grid template if none exists
                    row.style.gridTemplateColumns = '[index] 16px [first] 5fr [var1] 3fr [var2] 2fr [lastfm] 120px [var3] 2fr [last] minmax(120px, 1fr) !important';
                }

                // Skip rows that don't have proper track structure
                const trackLink = row.querySelector('.main-trackList-rowTitle');
                const artistLink = row.querySelector('a[href*="/artist/"]');

                if (!trackLink || !artistLink) {
                    console.log(`Last.fm Loved Extension: Row ${index} missing track/artist info, skipping`);
                    return;
                }

                const trackName = trackLink.textContent;
                const artistName = artistLink.textContent;

                console.log(`TRACKLIST - Track: "${trackName}", Artist: "${artistName}"`);
                console.log(`Last.fm Loved Extension: Adding heart for ${artistName} - ${trackName}`);

                // Find the My Scrobbles column to insert before it
                const myScrobblesCell = row.querySelector('.sort-play-column');

                if (myScrobblesCell) {
                    // Create heart container as a proper column cell
                    const heartContainer = document.createElement('div');
                    heartContainer.className = 'lastfm-loved-cell main-trackList-rowSectionVariable';
                    heartContainer.setAttribute('role', 'gridcell');
                    heartContainer.setAttribute('aria-colindex', '5');
                    heartContainer.style.cssText = `
                        grid-area: auto / lastfm;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0 8px;
                    `;

                    // Render React component
                    ReactDOM.render(
                        React.createElement(LastfmLovedCell, {
                            artist: artistName,
                            track: trackName
                        }),
                        heartContainer
                    );

                    // Insert before the My Scrobbles column and update aria-colindex values
                    row.insertBefore(heartContainer, myScrobblesCell);
                    myScrobblesCell.setAttribute('aria-colindex', '6');

                    // Update Duration column aria-colindex
                    const durationCell = row.querySelector('.main-trackList-rowSectionEnd');
                    if (durationCell) {
                        durationCell.setAttribute('aria-colindex', '7');
                    }

                    console.log(`Last.fm Loved Extension: Heart added for row ${index}`);
                }
            });
        });
    }

    function addLovedColumnOld() {
        const playlistViews = document.querySelectorAll('.main-trackList-indexable');
        console.log('Last.fm Loved Extension: Found', playlistViews.length, 'tracklist views');

        playlistViews.forEach(view => {
            if (view.querySelector('.lastfm-loved-header')) return;

            const headerRow = view.querySelector('[role="columnheader"]')?.parentElement;
            if (!headerRow) return;

            const lovedHeader = document.createElement('div');
            lovedHeader.className = 'lastfm-loved-header';
            lovedHeader.setAttribute('role', 'columnheader');
            lovedHeader.style.cssText = `
                display: flex;
                justify-content: center;
                align-items: center;
                width: 48px;
                height: 40px;
                color: #b3b3b3;
                font-size: 12px;
                font-weight: 400;
                text-transform: uppercase;
                letter-spacing: 1px;
            `;
            lovedHeader.textContent = '♥';
            headerRow.appendChild(lovedHeader);

            const trackRows = view.querySelectorAll('[data-testid="tracklist-row"]');
            trackRows.forEach(row => {
                if (row.querySelector('.lastfm-loved-cell')) return;

                const trackNameElement = row.querySelector('[data-testid="internal-track-link"]');
                const artistElement = row.querySelector('[data-testid="internal-track-link"]')?.closest('[role="gridcell"]')?.nextElementSibling?.querySelector('a');

                if (trackNameElement && artistElement) {
                    const trackName = trackNameElement.textContent;
                    const artistName = artistElement.textContent;

                    const lovedCell = document.createElement('div');
                    lovedCell.className = 'lastfm-loved-cell';
                    lovedCell.setAttribute('role', 'gridcell');
                    lovedCell.style.cssText = `
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 48px;
                        height: 56px;
                    `;

                    ReactDOM.render(
                        React.createElement(LastfmLovedCell, {
                            artist: artistName,
                            track: trackName
                        }),
                        lovedCell
                    );

                    row.appendChild(lovedCell);
                }
            });
        });
    }

    function openConfigModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #282828;
            padding: 24px;
            border-radius: 8px;
            width: 400px;
            max-width: 90vw;
        `;

        modalContent.innerHTML = `
            <h2 style="color: white; margin-bottom: 20px;">Last.fm Configuration</h2>
            <div style="margin-bottom: 16px;">
                <label style="color: #b3b3b3; display: block; margin-bottom: 8px;">API Key:</label>
                <input type="text" id="apiKey" value="${lastfmApiKey}" style="width: 100%; padding: 8px; background: #404040; border: 1px solid #535353; color: white; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="color: #b3b3b3; display: block; margin-bottom: 8px;">Username:</label>
                <input type="text" id="username" value="${lastfmUsername}" style="width: 100%; padding: 8px; background: #404040; border: 1px solid #535353; color: white; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="color: #b3b3b3; display: block; margin-bottom: 8px;">Session Key:</label>
                <input type="text" id="sessionKey" value="${lastfmSessionKey}" style="width: 100%; padding: 8px; background: #404040; border: 1px solid #535353; color: white; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="color: #b3b3b3; display: block; margin-bottom: 8px;">Shared Secret:</label>
                <input type="text" id="sharedSecret" value="${lastfmSharedSecret}" style="width: 100%; padding: 8px; background: #404040; border: 1px solid #535353; color: white; border-radius: 4px;">
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="cancelBtn" style="padding: 8px 16px; background: #404040; color: white; border: 1px solid #535353; border-radius: 4px; cursor: pointer;">Cancel</button>
                <button id="saveBtn" style="padding: 8px 16px; background: #1ed760; color: black; border: none; border-radius: 4px; cursor: pointer;">Save</button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        document.getElementById('cancelBtn').onclick = () => {
            document.body.removeChild(modal);
        };

        document.getElementById('saveBtn').onclick = () => {
            lastfmApiKey = document.getElementById('apiKey').value;
            lastfmUsername = document.getElementById('username').value;
            lastfmSessionKey = document.getElementById('sessionKey').value;
            lastfmSharedSecret = document.getElementById('sharedSecret').value;
            saveConfig();
            document.body.removeChild(modal);
            Spicetify.showNotification('Last.fm configuration saved!');
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    new Spicetify.Menu.Item('Last.fm Loved Config', false, openConfigModal).register();

    loadConfig();
    console.log('Last.fm Loved Extension: Configuration loaded');

    const observer = new MutationObserver((mutations) => {
        // Only trigger if it's not our own changes
        let shouldRun = false;
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE &&
                    !node.classList?.contains('lastfm-loved-cell') &&
                    !node.classList?.contains('lastfm-loved-nowplaying') &&
                    !node.classList?.contains('lastfm-loved-sidenav')) {
                    shouldRun = true;
                }
            });
        });

        if (shouldRun) {
            addLovedColumn();
            addNowPlayingHeart();
            addSideNavHeart();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    addSideNavHeart();
    addNowPlayingHeart();
    addLovedColumn();
})();

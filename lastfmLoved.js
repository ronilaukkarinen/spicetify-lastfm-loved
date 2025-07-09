(function lastfmLoved() {
    // Security note: This extension handles sensitive Last.fm API credentials.
    // Console logs are minimized and never expose API keys, session keys, or secrets.
    // Only boolean flags (hasApiKey, hasSessionKey) and track/artist names are logged for debugging.

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

        // Use original casing for API calls, normalize only for logging/comparison
        const apiArtist = artist.trim();
        const apiTrack = track.trim();
        const normalizedArtist = artist.toLowerCase().trim();
        const normalizedTrack = track.toLowerCase().trim();

        // console.log(`Last.fm API Request - Artist: "${normalizedArtist}", Track: "${normalizedTrack}"`);

        try {
            const response = await fetch(
                `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${lastfmApiKey}&artist=${encodeURIComponent(apiArtist)}&track=${encodeURIComponent(apiTrack)}&username=${lastfmUsername}&format=json`
            );
            const data = await response.json();

            if (data.track && data.track.userloved) {
                const loved = data.track.userloved === '1';
                // Only log API results when there might be issues, not for every single request
                // console.log(`Last.fm API Result - "${normalizedArtist} - ${normalizedTrack}" is ${loved ? 'LOVED' : 'NOT LOVED'}`);
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

        // Use original casing for API calls (Last.fm signature is case-sensitive)
        // But normalize for internal comparison and sync
        const apiArtist = artist.trim();
        const apiTrack = track.trim();
        const normalizedArtist = artist.toLowerCase().trim();
        const normalizedTrack = track.toLowerCase().trim();

        const method = isLoved ? 'track.unlove' : 'track.love';

        try {
            // Create parameters for API signature - MUST use original casing
            const params = {
                api_key: lastfmApiKey,
                artist: apiArtist,
                method: method,
                sk: lastfmSessionKey,
                track: apiTrack
            };

            // Sort parameters alphabetically and create signature string
            const sortedKeys = Object.keys(params).sort();
            let sigString = '';
            sortedKeys.forEach(key => {
                // Don't URL encode in signature string - Last.fm expects raw values
                sigString += key + params[key];
            });
            sigString += lastfmSharedSecret;

            // Add debugging for signature generation
            // console.log('Last.fm Signature Debug:', {
            //     artist: apiArtist,
            //     track: apiTrack,
            //     method: method,
            //     sortedKeys: sortedKeys,
            //     sigStringLength: sigString.length,
            //     // Show first 50 chars of signature string for debugging (before adding secret)
            //     sigStringPreview: sigString.substring(0, sigString.length - lastfmSharedSecret.length).substring(0, 50) + '...',
            //     artistByteLength: new TextEncoder().encode(apiArtist).length,
            //     trackByteLength: new TextEncoder().encode(apiTrack).length,
            //     // Don't log the actual signature string as it contains secrets
            // });

            // Generate MD5 signature with proper UTF-8 encoding
            const utf8SigString = unescape(encodeURIComponent(sigString));
            // console.log('UTF-8 Encoding Debug:', {
            //     originalLength: sigString.length,
            //     utf8Length: utf8SigString.length,
            //     lengthDifference: utf8SigString.length - sigString.length
            // });
            const apiSig = await md5(utf8SigString);
            params.api_sig = apiSig;
            params.format = 'json';

            // Log request details (without sensitive data)
            // console.log('Last.fm API Request:', {
            //     method: method,
            //     artist: apiArtist,
            //     track: apiTrack,
            //     hasApiKey: !!params.api_key,
            //     hasSessionKey: !!params.sk,
            //     hasSignature: !!params.api_sig
            // });

            const response = await fetch(`https://ws.audioscrobbler.com/2.0/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(params)
            });

            if (!response.ok) {
                console.error('Last.fm API HTTP error:', response.status, response.statusText);

                // Try to get more details about the error
                try {
                    const errorData = await response.json();
                    console.error('Last.fm API error details:', errorData);
                    if (errorData.error && errorData.message) {
                        console.error(`Last.fm Error ${errorData.error}: ${errorData.message}`);
                    }
                } catch (parseError) {
                    console.error('Could not parse error response');
                }
                return false;
            }

            const data = await response.json();
            if (data.error) {
                console.error('Last.fm API error:', data.error, data.message);
                return false;
            }

            // console.log('Last.fm API success:', data);
            const newStatus = !isLoved;
            // Use normalized names for internal sync (case-insensitive matching)
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
            // console.log('HeartIcon clicked, loading:', loading, 'disabled:', disabled);
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
                // console.log(`Syncing heart for "${artist} - ${track}" to ${newStatus ? 'LOVED' : 'UNLOVED'}`);
                setIsLoved(newStatus);
            }
        });

        useEffect(() => {
            // Register this component for global sync
            componentRef.current.artist = artist;
            componentRef.current.track = track;
            registerHeartComponent(componentRef.current);

            // console.log(`LastfmLovedCell useEffect - Artist: "${artist}", Track: "${track}"`);
            if (artist && track) {
                setLoading(true);
                setIsLoved(null); // Reset state to prevent stale data
                setHasData(false);
                getLastfmLovedStatus(artist, track).then(loved => {
                    // console.log(`LastfmLovedCell result for "${artist} - ${track}": ${loved}`);
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
            // console.log(`Heart clicked for "${artist} - ${track}", current status: ${isLoved}, hasData: ${hasData}, loading: ${loading}`);

            if (loading || isLoved === null || !hasData) {
                // console.log(`Click ignored for "${artist} - ${track}" - not ready`);
                return;
            }

            // console.log(`Toggling loved status for "${artist} - ${track}" from ${isLoved} to ${!isLoved}`);
            setLoading(true);
            const success = await toggleLastfmLoved(artist, track, isLoved);
            if (success) {
                // console.log(`Successfully toggled "${artist} - ${track}" - sync will handle state update`);
                // Don't update local state - let global sync handle it
            } else {
                // console.log(`Failed to toggle loved status for "${artist} - ${track}"`);
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
            transition: 'opacity 0.3s ease'
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
            // console.log('Last.fm Loved Extension: Could not find track/artist in side nav now playing');
            return;
        }

        const trackName = trackLink.textContent.trim();
        // Get the first artist (main artist)
        const artistName = artistLinks[0].textContent.trim();

        // console.log(`SIDE_NAV - Track: "${trackName}", Artist: "${artistName}"`);

        // If we already have a heart, check if it's for the same track
        if (existingHeart) {
            const currentTrack = existingHeart.getAttribute('data-track');
            const currentArtist = existingHeart.getAttribute('data-artist');

            if (currentTrack === trackName && currentArtist === artistName) {
                // console.log('SIDE_NAV: Heart already exists for current track');
                return; // Same track, keep existing heart
            } else {
                // console.log('SIDE_NAV: Track changed, updating heart');
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

        // console.log(`Last.fm Loved Extension: Adding heart for side nav now playing: ${artistName} - ${trackName}`);

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
            // console.log('Last.fm Loved Extension: Heart added to side nav');
        }
    }

    function addNowPlayingHeart() {
        // console.log('addNowPlayingHeart called');
        const nowPlayingWidget = document.querySelector('[data-testid="now-playing-widget"]');
        if (!nowPlayingWidget) {
            // console.log('addNowPlayingHeart: No widget found');
            return; // No now playing widget
        }

        const existingHeart = nowPlayingWidget.querySelector('.lastfm-loved-nowplaying');

        // Extract track and artist info from now playing
        const trackLink = nowPlayingWidget.querySelector('.main-trackInfo-name a');
        const artistLink = nowPlayingWidget.querySelector('.main-trackInfo-artists a');

        if (!trackLink || !artistLink) {
            // console.log('Last.fm Loved Extension: Could not find track/artist in now playing');
            return;
        }

        const trackName = trackLink.textContent.trim();
        const artistName = artistLink.textContent.trim();

        // console.log(`NOW_PLAYING - Track: "${trackName}", Artist: "${artistName}"`);

        // If we already have a heart, check if it's for the same track
        if (existingHeart) {
            const currentTrack = existingHeart.getAttribute('data-track');
            const currentArtist = existingHeart.getAttribute('data-artist');

            if (currentTrack === trackName && currentArtist === artistName) {
                // console.log('NOW_PLAYING: Heart already exists for current track');
                return; // Same track, keep existing heart
            } else {
                // console.log('NOW_PLAYING: Track changed, updating heart');
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

        // console.log(`Last.fm Loved Extension: Adding heart for now playing: ${artistName} - ${trackName}`);

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
            // console.log('Last.fm Loved Extension: Heart added to now playing');
        }
    }

    function addLovedColumn() {
        // Find all tracklist views
        const tracklists = document.querySelectorAll('.main-trackList-trackList.main-trackList-indexable');

        // Also check for tracklists without the indexable class (Popular section might not have it)
        const allTracklists = document.querySelectorAll('.main-trackList-trackList');
        // console.log('Last.fm Loved Extension: Found', allTracklists.length, 'total tracklists (including non-indexable)');

        // Process all tracklists (both indexable and non-indexable)
        allTracklists.forEach(tracklist => {
            // Add header if not already present
            const headerRow = tracklist.querySelector('.main-trackList-trackListHeaderRow');
            
            if (headerRow) {
                // Detection for views that should NOT have headers added
                // Look for "Date added" column text - only playlist views have this
                const hasDateAddedColumn = Array.from(headerRow.querySelectorAll('[role="columnheader"]')).some(header => 
                    header.textContent?.toLowerCase().includes('date added'));
                
                const isViewWithoutHeaders = !hasDateAddedColumn;
                
                // Remove existing headers from views that shouldn't have them
                if (isViewWithoutHeaders) {
                    const existingHeader = headerRow.querySelector('.lastfm-loved-header');
                    if (existingHeader) {
                        existingHeader.remove();
                    }
                    // Don't return here - continue processing rows for heart functionality
                }
            }
            
            if (headerRow && !headerRow.querySelector('.lastfm-loved-header')) {
                // Detect if sort-play extension is present
                const hasSortPlayExtension = headerRow.querySelector('.sort-play-column') !== null;
                
                // Update aria-colcount based on presence of sort-play extension
                const tracklistContainer = tracklist.closest('.main-trackList-trackList');
                if (tracklistContainer) {
                    const newColCount = hasSortPlayExtension ? '7' : '6';
                    tracklistContainer.setAttribute('aria-colcount', newColCount);
                }
                // Modify the grid template to add space for our column
                const currentGridTemplate = headerRow.style.gridTemplateColumns;
                // Detection for views that should NOT have headers added
                // Look for "Date added" column text - only playlist views have this
                const hasDateAddedColumn = Array.from(headerRow.querySelectorAll('[role="columnheader"]')).some(header => 
                    header.textContent?.toLowerCase().includes('date added'));
                
                const isViewWithoutHeaders = !hasDateAddedColumn;

                // Detection for views that should use playlist-style column layout
                const isPlaylistView = hasDateAddedColumn;


                // Only modify grid templates for playlist views that will get headers
                if (isPlaylistView && (!currentGridTemplate || !currentGridTemplate.includes('120px') || currentGridTemplate.split(' ').length < 14)) {
                    // Always set the complete grid template for playlist views
                    if (hasSortPlayExtension) {
                        // 7-column layout with sort-play - simple equal columns approach
                        headerRow.style.gridTemplateColumns = '16px 5fr 3fr 2fr 120px 2fr minmax(120px, 1fr) !important';
                    } else {
                        // 6-column layout without sort-play
                        headerRow.style.gridTemplateColumns = '16px 5fr 3fr 2fr 120px minmax(120px, 1fr) !important';
                    }
                }

                // Find where to insert the header - only for playlist views

                if (isPlaylistView) {
                    // Playlist view only: Choose insertion method based on sort-play presence
                    if (hasSortPlayExtension) {
                        // Use the original method: insert before sort-play column
                        const insertTarget = headerRow.querySelector('.sort-play-column');
                        if (insertTarget) {
                    const headerCell = document.createElement('div');
                    headerCell.className = 'lastfm-loved-header main-trackList-rowSectionVariable';
                    headerCell.setAttribute('role', 'columnheader');
                    headerCell.setAttribute('aria-colindex', '5');
                    headerCell.setAttribute('aria-sort', 'none');
                    headerCell.setAttribute('tabindex', '-1');
                    headerCell.style.cssText = `
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

                            // Insert before sort-play column
                            headerRow.insertBefore(headerCell, insertTarget);

                            // Update aria-colindex for sort-play and duration columns
                            insertTarget.setAttribute('aria-colindex', '6');
                            const durationColumn = headerRow.querySelector('.main-trackList-rowSectionEnd');
                            if (durationColumn) {
                                durationColumn.setAttribute('aria-colindex', '7');
                            }
                        }
                    } else {
                        // Use the new method: insert after Date added column
                        let dateAddedColumn = null;
                        const columns = headerRow.querySelectorAll('[role="columnheader"]');
                        
                        // Find Date added column
                        for (const column of columns) {
                            if (column.getAttribute('aria-colindex') === '4') {
                                dateAddedColumn = column;
                                break;
                            }
                        }

                        if (dateAddedColumn) {
                            // Create header cell for this method too
                            const headerCell = document.createElement('div');
                            headerCell.className = 'lastfm-loved-header main-trackList-rowSectionVariable';
                            headerCell.setAttribute('role', 'columnheader');
                            headerCell.setAttribute('aria-colindex', '5');
                            headerCell.setAttribute('aria-sort', 'none');
                            headerCell.setAttribute('tabindex', '-1');
                            headerCell.style.cssText = `
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

                            // Insert directly after Date added column
                            dateAddedColumn.insertAdjacentElement('afterend', headerCell);

                            // Update aria-colindex for Duration column (now becomes column 6)
                            const durationColumn = headerRow.querySelector('.main-trackList-rowSectionEnd');
                            if (durationColumn) {
                                durationColumn.setAttribute('aria-colindex', '6');
                            }
                        }
                    }

                    // console.log('Last.fm Loved Extension: Header added');
                }
            }

            // Find all track rows in this tracklist
            const trackRows = tracklist.querySelectorAll('[role="row"] .main-trackList-trackListRow');
            // console.log('Last.fm Loved Extension: Found', trackRows.length, 'track rows in tracklist');

            // Also try alternative selector for Popular section
            const alternativeRows = tracklist.querySelectorAll('.main-trackList-trackListRow');
            // console.log('Last.fm Loved Extension: Found', alternativeRows.length, 'alternative track rows');

            // Use whichever selector found more rows
            const rowsToProcess = trackRows.length > 0 ? trackRows : alternativeRows;

            rowsToProcess.forEach((row, index) => {
                if (row.querySelector('.lastfm-loved-cell') || row.getAttribute('data-lastfm-heart-added') === 'true') {
                    // console.log(`Last.fm Loved Extension: Row ${index} already has heart, skipping`);
                    return; // Already has our heart
                }

                // Modify the grid template for this row to match header (playlist views only)
                const currentGridTemplate = row.style.gridTemplateColumns;
                const headerRow = tracklist.querySelector('.main-trackList-trackListHeaderRow');
                // Detection for views that should NOT have headers added
                // Look for "Date added" column text - only playlist views have this
                const hasDateAddedColumn = headerRow ? Array.from(headerRow.querySelectorAll('[role="columnheader"]')).some(header => 
                    header.textContent?.toLowerCase().includes('date added')) : false;
                
                const isViewWithoutHeaders = !hasDateAddedColumn;

                // Detection for views that should use playlist-style column layout
                const isPlaylistView = hasDateAddedColumn;
                const hasSortPlayExtension = headerRow && headerRow.querySelector('.sort-play-column') !== null;
                
                // Only modify grid templates for playlist views that will get headers
                if (isPlaylistView && (!currentGridTemplate || !currentGridTemplate.includes('120px') || currentGridTemplate.split(' ').length < 14)) {
                    // Always set the complete grid template for playlist views
                    if (hasSortPlayExtension) {
                        // 7-column layout with sort-play - simple equal columns approach
                        row.style.gridTemplateColumns = '16px 5fr 3fr 2fr 120px 2fr minmax(120px, 1fr) !important';
                    } else {
                        // 6-column layout without sort-play
                        row.style.gridTemplateColumns = '16px 5fr 3fr 2fr 120px minmax(120px, 1fr) !important';
                    }
                }

                // Skip rows that don't have proper track structure
                const trackLink = row.querySelector('.main-trackList-rowTitle');

                if (!trackLink) {
                    // console.log(`Last.fm Loved Extension: Row ${index} missing track info, skipping`);
                    return;
                }

                const trackName = trackLink.textContent;
                let artistName;

                // Check if this is a regular track list with artist links
                const artistLink = row.querySelector('a[href*="/artist/"]');

                if (artistLink) {
                    // Regular track list with artist link
                    artistName = artistLink.textContent;
                } else {
                    // Popular section - extract artist name from play button aria-label
                    const playButton = row.querySelector('.main-trackList-rowImagePlayButton');
                    if (playButton && playButton.getAttribute('aria-label')) {
                        const ariaLabel = playButton.getAttribute('aria-label');
                        // Parse "Play [Track] by [Artist]" format
                        const byMatch = ariaLabel.match(/^Play .+ by (.+)$/);
                        if (byMatch) {
                            artistName = byMatch[1];
                        }
                    }

                    // Fallback: get from page header if aria-label parsing fails
                    if (!artistName) {
                        const artistHeader = document.querySelector('.main-entityHeader-titleText');
                        const artistTitle = document.querySelector('[data-testid="entityTitle"]');
                        const pageTitle = document.querySelector('h1[data-encore-id="text"]');

                        if (artistHeader) {
                            artistName = artistHeader.textContent;
                        } else if (artistTitle) {
                            artistName = artistTitle.textContent;
                        } else if (pageTitle && pageTitle.textContent !== 'Your Library') {
                            artistName = pageTitle.textContent;
                        }
                    }
                }

                if (!artistName) {
                    // console.log(`Last.fm Loved Extension: Row ${index} missing artist info, skipping`);
                    return;
                }

                // console.log(`Last.fm Loved Extension: Row ${index} - Track: "${trackName}", Artist: "${artistName}"`);

                // console.log(`TRACKLIST - Track: "${trackName}", Artist: "${artistName}"`);
                // console.log(`Last.fm Loved Extension: Adding heart for ${artistName} - ${trackName}`);

                // Handle Popular section (no headers, different structure)
                const isPopularSection = !tracklist.querySelector('.main-trackList-trackListHeaderRow');

                // console.log(`Last.fm Loved Extension: Row ${index} - isPopularSection: ${isPopularSection}`);
                // console.log(`Last.fm Loved Extension: Row ${index} - row classes:`, row.className);
                // console.log(`Last.fm Loved Extension: Row ${index} - row HTML:`, row.outerHTML.substring(0, 200) + '...');

                if (isPopularSection) {
                    // For Popular section, add heart between play count and add to playlist button
                    const endSection = row.querySelector('.main-trackList-rowSectionEnd');
                    const addToPlaylistButton = endSection?.querySelector('.main-trackList-curationButton');

                    // console.log(`Last.fm Loved Extension: endSection found: ${!!endSection}, addToPlaylistButton found: ${!!addToPlaylistButton}`);

                    if (endSection && addToPlaylistButton) {
                        // Create heart container for Popular section
                        const heartContainer = document.createElement('div');
                        heartContainer.className = 'lastfm-loved-cell';
                        heartContainer.style.cssText = `
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-right: 20px;
                            margin-left: 0;
                        `;

                        // Render React component
                        ReactDOM.render(
                            React.createElement(LastfmLovedCell, {
                                artist: artistName,
                                track: trackName
                            }),
                            heartContainer
                        );

                        // Insert before the add to playlist button
                        endSection.insertBefore(heartContainer, addToPlaylistButton);

                        // Mark the row as processed to prevent future processing
                        row.setAttribute('data-lastfm-heart-added', 'true');

                        // console.log(`Last.fm Loved Extension: Heart added to Popular section for row ${index}`);
                    } else {
                        // Try alternative approach - look for play count column and add after it
                        const playCountElement = row.querySelector('.main-trackList-rowPlayCount');
                        const variableSection = row.querySelector('.main-trackList-rowSectionVariable');

                        // console.log(`Last.fm Loved Extension: Fallback - playCountElement: ${!!playCountElement}, variableSection: ${!!variableSection}`);

                        if (playCountElement && variableSection) {
                            // Create heart container for Popular section
                            const heartContainer = document.createElement('div');
                            heartContainer.className = 'lastfm-loved-cell';
                            heartContainer.style.cssText = `
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin-left: 0;
                                margin-right: 20px;
                            `;

                            // Render React component
                            ReactDOM.render(
                                React.createElement(LastfmLovedCell, {
                                    artist: artistName,
                                    track: trackName
                                }),
                                heartContainer
                            );

                            // Add heart after the play count in the variable section
                            variableSection.appendChild(heartContainer);

                            // Mark the row as processed to prevent future processing
                            row.setAttribute('data-lastfm-heart-added', 'true');

                            // console.log(`Last.fm Loved Extension: Heart added to Popular section (fallback) for row ${index}`);
                        }
                    }
                } else {
                    // Original logic for regular track lists with headers

                    // Check if this is an album view or playlist view
                    const headerRow = tracklist.querySelector('.main-trackList-trackListHeaderRow');
                    // Detection for views that should NOT have headers added
                    // Look for "Date added" column text - only playlist views have this
                    const hasDateAddedColumn = headerRow ? Array.from(headerRow.querySelectorAll('[role="columnheader"]')).some(header => 
                        header.textContent?.toLowerCase().includes('date added')) : false;
                    
                    const isViewWithoutHeaders = !hasDateAddedColumn;

                    // Detection for views that should use playlist-style column layout
                    const isPlaylistView = hasDateAddedColumn;

                    if (isPlaylistView) {
                        // Playlist view only: Choose insertion method based on sort-play presence
                        const hasSortPlayExtension = row.querySelector('.sort-play-column') !== null;
                        
                        if (hasSortPlayExtension) {
                            // Use the original method: insert before sort-play column
                            const insertTarget = row.querySelector('.sort-play-column');
                            if (insertTarget) {
                        // Create heart container as a proper column cell
                        const heartContainer = document.createElement('div');
                        heartContainer.className = 'lastfm-loved-cell main-trackList-rowSectionVariable';
                        heartContainer.setAttribute('role', 'gridcell');
                        heartContainer.setAttribute('aria-colindex', '5');
                        heartContainer.style.cssText = `
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

                                // Insert before sort-play column
                                row.insertBefore(heartContainer, insertTarget);

                                // Update aria-colindex for sort-play and duration cells
                                insertTarget.setAttribute('aria-colindex', '6');
                                const durationCell = row.querySelector('.main-trackList-rowSectionEnd');
                                if (durationCell) {
                                    durationCell.setAttribute('aria-colindex', '7');
                                }
                            }
                        } else {
                            // Use the new method: insert after Date added cell
                            let dateAddedCell = null;
                            const cells = row.querySelectorAll('[role="gridcell"]');
                            
                            // Find Date added cell
                            for (const cell of cells) {
                                if (cell.getAttribute('aria-colindex') === '4') {
                                    dateAddedCell = cell;
                                    break;
                                }
                            }

                            if (dateAddedCell) {
                                // Create heart container as a proper column cell
                                const heartContainer = document.createElement('div');
                                heartContainer.className = 'lastfm-loved-cell main-trackList-rowSectionVariable';
                                heartContainer.setAttribute('role', 'gridcell');
                                heartContainer.setAttribute('aria-colindex', '5');
                                heartContainer.style.cssText = `
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

                                // Insert directly after Date added cell
                                dateAddedCell.insertAdjacentElement('afterend', heartContainer);

                                // Update aria-colindex for Duration cell (now becomes column 6)
                                const durationCell = row.querySelector('.main-trackList-rowSectionEnd');
                                if (durationCell) {
                                    durationCell.setAttribute('aria-colindex', '6');
                                }
                            }
                        }

                        // Mark the row as processed to prevent future processing
                        row.setAttribute('data-lastfm-heart-added', 'true');

                        // console.log(`Last.fm Loved Extension: Heart added for row ${index}`);
                    } else {
                        // Non-playlist views (album, artist, daylist): Add heart like Popular section (no grid modification)
                        const endSection = row.querySelector('.main-trackList-rowSectionEnd');
                        const addToLikedButton = endSection?.querySelector('.main-trackList-curationButton');

                        if (endSection && addToLikedButton) {
                            // Create heart container for non-playlist views
                            const heartContainer = document.createElement('div');
                            heartContainer.className = 'lastfm-loved-cell';
                            heartContainer.style.cssText = `
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin-right: 20px;
                                margin-left: 0;
                            `;

                            // Render React component
                            ReactDOM.render(
                                React.createElement(LastfmLovedCell, {
                                    artist: artistName,
                                    track: trackName
                                }),
                                heartContainer
                            );

                            // Insert before the add to liked songs button
                            endSection.insertBefore(heartContainer, addToLikedButton);

                            // Mark the row as processed to prevent future processing
                            row.setAttribute('data-lastfm-heart-added', 'true');

                            // console.log(`Last.fm Loved Extension: Heart added to non-playlist view for row ${index}`);
                        }
                    }
                }
            });
        });
    }

    function addLovedColumnOld() {
        const playlistViews = document.querySelectorAll('.main-trackList-indexable');
        // console.log('Last.fm Loved Extension: Found', playlistViews.length, 'tracklist views');

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
    // console.log('Last.fm Loved Extension: Configuration loaded');

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

import sample from "https://esm.sh/lodash.sample";
import random from "https://esm.sh/lodash.random";

(async function () {
  while (!Spicetify.React || !Spicetify.ReactDOM) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const icon = (name) =>
    `<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons[name]}</svg>`;
  
  const getLogo = () => `
    <svg role="img" height="16" width="16" viewBox="0 0 32 32" 
        xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path d="M15.676 17.312h0.048c-0.114-0.273-0.263-0.539-0.436-0.78
              l-11.114-6.346c-0.37 0.13-0.607 0.519-0.607 1.109v9.84
              c0 1.034 0.726 2.291 1.621 2.808l9.168 5.294
              c0.544 0.314 1.026 0.282 1.32-0.023v-11.902h-0z
              M10.049 24.234l-1.83-1.057v-1.918l1.83 1.057v1.918z
              M11.605 19.993c-0.132 0.2-0.357 0.369-0.674 0.505
              l-0.324 0.12c-0.23 0.09-0.38 0.183-0.451 0.278
              c-0.071 0.092-0.106 0.219-0.106 0.38v0.242l-1.83-1.056
              v-0.264c0-0.294 0.056-0.523 0.167-0.685c0.111-0.165
              0.346-0.321 0.705-0.466l0.324-0.125c0.193-0.076
              0.333-0.171 0.421-0.285c0.091-0.113 0.137-0.251
              0.137-0.417c0-0.251-0.081-0.494-0.243-0.728
              c-0.162-0.237-0.389-0.44-0.679-0.608c-0.274-0.158
              -0.569-0.268-0.887-0.329c-0.318-0.065-0.649-0.078
              -0.994-0.04v-1.691c0.409 0.085 0.782 0.19 1.12 0.313
              s0.664 0.276 0.978 0.457c0.825 0.476 1.453 1.019
              1.886 1.627c0.433 0.605 0.649 1.251 0.649 1.937
              c0 0.352-0.066 0.63-0.198 0.834z
              M27.111 8.247l-9.531-5.514c-0.895-0.518-2.346-0.518
              -3.241 0l-9.531 5.514c-0.763 0.442-0.875 1.117
              -0.336 1.628l10.578 6.04c0.583 0.146 1.25 0.145
              1.832-0.003l10.589-6.06c0.512-0.508 0.392-1.17-0.36-1.605z
              M16.305 10.417l-0.23-0.129c-0.257-0.144-0.421-0.307
              -0.492-0.488c-0.074-0.183-0.062-0.474 0.037-0.874
              l0.095-0.359c0.055-0.214 0.061-0.389 0.016-0.525
              c-0.041-0.139-0.133-0.248-0.277-0.329c-0.219-0.123
              -0.482-0.167-0.788-0.133c-0.309 0.033-0.628 0.141
              -0.958 0.326c-0.31 0.174-0.592 0.391-0.846 0.653
              c-0.257 0.26-0.477 0.557-0.661 0.892l-1.476-0.827
              c0.332-0.333 0.658-0.625 0.978-0.875s0.659-0.474
              1.015-0.674c0.934-0.524 1.803-0.835 2.607-0.934
              c0.8-0.101 1.5 0.016 2.098 0.352c0.307 0.172
              0.508 0.368 0.603 0.589c0.092 0.219 0.097 0.507
              0.016 0.865l-0.1 0.356c-0.066 0.255-0.08 0.438
              -0.041 0.55c0.035 0.11 0.124 0.205 0.265 0.284
              l0.212 0.118-2.074 1.162z
              M18.674 11.744l-1.673-0.937l2.074-1.162l1.673 0.937
              -2.074 1.162z
              M27.747 10.174l-11.06 6.329c-0.183 0.25-0.34 0.527
              -0.459 0.813v11.84c0.287 0.358 0.793 0.414 1.37 0.081
              l9.168-5.294c0.895-0.517 1.621-1.774 1.621-2.808v-9.84
              c0-0.608-0.251-1.003-0.641-1.121z
              M23.147 23.68l-1.83 1.056v-1.918l1.83-1.057v1.918z
              M24.703 17.643c-0.132 0.353-0.357 0.78-0.674 1.284
              l-0.324 0.494c-0.23 0.355-0.38 0.622-0.451 0.799
              c-0.071 0.174-0.106 0.342-0.106 0.503v0.242l-1.83 1.056
              v-0.264c0-0.294 0.056-0.587 0.167-0.878c0.111-0.294
              0.346-0.721 0.705-1.279l0.324-0.5c0.193-0.298 0.333-0.555
              0.421-0.771c0.091-0.218 0.137-0.409 0.137-0.575
              c0-0.251-0.081-0.4-0.243-0.447c-0.162-0.05-0.389 0.009
              -0.679 0.177c-0.274 0.158-0.569 0.39-0.887 0.695
              c-0.318 0.302-0.649 0.671-0.994 1.107v-1.692
              c0.409-0.387 0.782-0.714 1.12-0.981s0.664-0.491
              0.978-0.673c0.825-0.476 1.453-0.659 1.886-0.55
              c0.433 0.106 0.649 0.502 0.649 1.188c0 0.352-0.066
              0.706-0.198 1.062z">
      </path>
    </svg>
  `.trim();
  
  var playRandom = (() => {
    // src/app.tsx
    var _PlayRandom = class {
      static async fetchPlaylistsFromUser(userUri) {
        try {
          const userId = userUri.split(":")[2];
          const initialResponse =
            await Spicetify.Platform.RequestBuilder.build()
              .withHost("https://spclient.wg.spotify.com/user-profile-view/v3")
              .withPath(`/profile/${userId}/playlists`)
              .withQueryParameters({ limit: 1, offset: 0 })
              .send();

          const totalPlaylists =
            initialResponse.body?.total_public_playlists_count || 0;

          if (totalPlaylists === 0) {
            return { error: "[Play Random] this mf dont have no playlists." };
          }
          const randomOffset = random(totalPlaylists - 1);
          if (randomOffset === 0) {
            return { playlists: initialResponse.body };
          }
          const offsetResponse = await Spicetify.Platform.RequestBuilder.build()
            .withHost("https://spclient.wg.spotify.com/user-profile-view/v3")
            .withPath(`/profile/${userId}/playlists`)
            .withQueryParameters({ limit: 1, offset: randomOffset })
            .send();
          return { playlists: offsetResponse.body };
        } catch (error) {
          return {
            error:
              "[Play Random] Sad Bruh - Error fetching data : " + error.message,
          };
        }
      }

      static async fetchPlaylist(response, silent = false) {
        if (response.error) {
          console.log(response.error);
          return null;
        }
        try {
          const items = response.playlists?.public_playlists || [];
          if (items.length === 0) {
            console.error("[Play Random] No playlist items found in response");
            if (!silent)
              Spicetify.showNotification(
                "[Play Random] Playlist came back empty... weird flex but ok",
                true,
              );
            return null;
          }
          const playlist = items[0];
          const playlistUri = playlist?.uri;
          const playlistName = playlist?.name || "Unknown Playlist";
          if (!playlistUri) {
            console.error("[Play Random] Playlist had no URI");
            if (!silent)
              Spicetify.showNotification(
                "[Play Random] Found a playlist but it has no URI. Cursed.",
                true,
              );
            return null;
          }
          console.log(
            `[Play Random] Playlist: "${playlistName}" (${playlistUri})`,
          );
          return { uri: playlistUri, name: playlistName };
        } catch (error) {
          console.error("[Play Random] Error picking a playlist:", error);
          if (!silent)
            Spicetify.showNotification(
              "[Play Random] Couldn't grab a playlist. The vibes are off rn",
              true,
            );
          return null;
        }
      }

      static async fetchTracksFromPlaylist(uri, silent = false) {
        try {
          const res = await Spicetify.Platform.PlaylistAPI.getContents(uri);
          return res.items
            .filter((track) => track.isPlayable)
            .map((track) => track.uri);
        } catch (error) {
          console.error(
            "[Play Random] Failed to fetch tracks from playlist:",
            error,
          );
          if (!silent)
            Spicetify.showNotification(
              "[Play Random] " +
                sample([
                  "Couldn't fetch tracks from that playlist. It ghosted us.",
                  "Playlist said 'access denied' basically. Rude.",
                  "Tracks? What tracks? The playlist won't share.",
                ]),
              true,
            );
          return null;
        }
      }

      // Silent background fetch — no toasts, returns track info or null
      // Retries up to 3 different playlists if a playlist yields no playable tracks
      static async fetchRandomTrack(userUri, excludeUri = null) {
        const maxPlaylistAttempts = 3;

        for (
          let playlistAttempt = 1;
          playlistAttempt <= maxPlaylistAttempts;
          playlistAttempt++
        ) {
          try {
            const playlists = await _PlayRandom.fetchPlaylistsFromUser(userUri);
            if (playlists.error) {
              console.log(
                "[Play Random][PRE] Playlist fetch error:",
                playlists.error,
              );
              return null; // User has 0 playlists or API error — no point retrying
            }

            const playlistResult = await _PlayRandom.fetchPlaylist(
              playlists,
              true,
            );
            if (!playlistResult) {
              console.log(
                `[Play Random][PRE] Playlist attempt ${playlistAttempt}/${maxPlaylistAttempts}: No playlist found, trying another`,
              );
              continue;
            }

            const { uri: playlistUri, name: playlistName } = playlistResult;
            const trackUris = await _PlayRandom.fetchTracksFromPlaylist(
              playlistUri,
              true,
            );
            if (!trackUris || trackUris.length === 0) {
              console.log(
                `[Play Random][PRE] Playlist attempt ${playlistAttempt}/${maxPlaylistAttempts}: No tracks in "${playlistName}", trying another`,
              );
              continue;
            }

            const maxAttempts = 10;
            const maxSameTrackRetries = 5;
            let sameTrackCount = 0;
            let foundTrack = false;

            for (let attempts = 1; attempts <= maxAttempts; attempts++) {
              const candidateUri = sample(trackUris);

              // Avoid same track as currently playing (up to 5 retries)
              if (
                excludeUri &&
                candidateUri === excludeUri &&
                sameTrackCount < maxSameTrackRetries
              ) {
                sameTrackCount++;
                console.log(
                  `[Play Random][PRE] Same track as current (${sameTrackCount}/${maxSameTrackRetries}), retrying...`,
                );
                continue;
              }

              try {
                const { getTrack } = Spicetify.GraphQL.Definitions;
                const trackData = await Spicetify.GraphQL.Request(getTrack, {
                  uri: candidateUri,
                });
                const trackUnion = trackData?.data?.trackUnion;
                const trackName = trackUnion?.name || "Unknown Track";
                const artistName =
                  trackUnion?.firstArtist?.items?.[0]?.profile?.name ||
                  "Unknown Artist";

                if (trackUnion?.playability?.playable) {
                  console.log(
                    `[Play Random][PRE] Found: "${trackName}" by ${artistName} from "${playlistName}" (${candidateUri})`,
                  );
                  return {
                    uri: candidateUri,
                    trackName,
                    artistName,
                    playlistName,
                  };
                }
                console.log(
                  `[Play Random][PRE] Attempt ${attempts}/${maxAttempts}: "${trackName}" not playable`,
                );
                await delay(500);
              } catch (error) {
                console.error(
                  `[Play Random][PRE] Attempt ${attempts}/${maxAttempts}: Error:`,
                  error,
                );
                await delay(500);
              }
            }

            console.log(
              `[Play Random][PRE] Playlist attempt ${playlistAttempt}/${maxPlaylistAttempts}: All ${maxAttempts} track attempts failed in "${playlistName}", trying another playlist`,
            );
          } catch (error) {
            console.error(
              `[Play Random][PRE] Playlist attempt ${playlistAttempt}/${maxPlaylistAttempts} failed:`,
              error,
            );
          }
        }

        console.log(
          "[Play Random][PRE] All playlist attempts exhausted, no track found",
        );
        return null;
      }

      static async doTheThing(userUri) {
        try {
          Spicetify.showNotification(
            "[Play Random] " +
              sample([
                "Sit tight, my friend. The wheels of randomness are turning; your tune is in the making.",
                "Chill, mate! Randomness is doing its thing, and your jam is on the way.",
                "Hold on, buddy. The dice of randomness are rolling, and your song is in the works.",
                "Hey, hang in there! The randomness wheel is spinning, searching up a track for you.",
                "Hold on, pal! The chaos engine is at play; your jam is currently in the making.",
              ]),
          );

          const currentUri = Spicetify.Player.data?.item?.uri;
          const track = await _PlayRandom.fetchRandomTrack(userUri, currentUri);

          if (!track) {
            Spicetify.showNotification(
              "[Play Random] " +
                sample([
                  "Couldn't find anything playable. The universe said no.",
                  "Struck out on finding a track. Try again?",
                  "Came up empty. Maybe change the profile?",
                ]),
              true,
            );
            return null;
          }

          console.log(
            `[Play Random] Playing: "${track.trackName}" by ${track.artistName} from "${track.playlistName}" (${track.uri})`,
          );

          try {
            await Spicetify.Player.playUri(track.uri);
          } catch (playError) {
            console.error("[Play Random] Failed to play track:", playError);
            Spicetify.showNotification(
              "[Play Random] " +
                sample([
                  "Had the song but Spotify said nah. Try again?",
                  "Found a banger but the player choked. Rip.",
                  "Track was right there and playback just died on us.",
                ]),
              true,
            );
            return null;
          }

          Spicetify.showNotification(
            "[Play Random] " +
              sample([
                "There you have it!",
                "Here it is!",
                "Presenting...",
                "And here you have it!",
              ]),
          );
          return track;
        } catch (error) {
          console.error("[Play Random] doTheThing exploded:", error);
          Spicetify.showNotification(
            "[Play Random] " +
              sample([
                "Welp, something went totally sideways. Try again?",
                "The randomness machine broke. Give it another shot.",
                "Bruh moment - the whole thing just crashed. My bad.",
              ]),
            true,
          );
          return null;
        }
      }

      static async addButton() {
        const { LocalStorage } = Spicetify;

        while (
          !Spicetify.Topbar?.Button ||
          !Spicetify.PopupModal?.display ||
          !Spicetify.Playbar ||
          !LocalStorage
        ) {
          await delay(100);
        }

        const DEFAULT_URI = "spotify:user:thesoundsofspotify";

        // Load persisted settings
        let targetUserUri =
          LocalStorage.get("play-random:user-uri") || DEFAULT_URI;
        let autoplayEnabled =
          LocalStorage.get("play-random:autoplay") === "true";

        // Autoplay state — prefetch + immediate queue injection
        let queuedTrack = null;
        let isPrefetching = false;

        async function prefetchAndQueue(userUri, excludeUri = null) {
          if (isPrefetching) return;
          isPrefetching = true;
          try {
            // Remove previously queued track if we're replacing it
            if (queuedTrack) {
              try {
                await Spicetify.removeFromQueue([{ uri: queuedTrack.uri }]);
                console.log(
                  `[Play Random][AUTO] Removed old queued track: "${queuedTrack.trackName}"`,
                );
              } catch (e) {
                // Ignore — track may have already played or been removed
              }
              queuedTrack = null;
            }

            const track = await _PlayRandom.fetchRandomTrack(
              userUri,
              excludeUri,
            );
            if (track) {
              try {
                await Spicetify.addToQueue([{ uri: track.uri }]);
                queuedTrack = track;
                console.log(
                  `[Play Random][AUTO] Queued: "${track.trackName}" by ${track.artistName}`,
                );
              } catch (e) {
                console.error("[Play Random][AUTO] Failed to add to queue:", e);
              }
            } else {
              console.log("[Play Random][AUTO] Pre-fetch came back empty");
            }
          } finally {
            isPrefetching = false;
          }
        }

        // Single topbar button — right click opens settings
        const button = new Spicetify.Topbar.Button(
          "Play a Random Song",
          getLogo(),
          async () => {
            const result = await _PlayRandom.doTheThing(targetUserUri);
            if (autoplayEnabled && result) {
              prefetchAndQueue(targetUserUri, result.uri);
            }
          },
          false,
        );
        button.element.oncontextmenu = (e) => {
          e.preventDefault();
          openSettings();
        };

        // Songchange listener — detect when our track plays, then queue the next one
        Spicetify.Player.addEventListener("songchange", async () => {
          if (!autoplayEnabled) return;

          const currentUri = Spicetify.Player.data?.item?.uri;

          if (queuedTrack && currentUri === queuedTrack.uri) {
            // Our queued track is now playing
            console.log(
              `[Play Random][AUTO] Now playing: "${queuedTrack.trackName}" by ${queuedTrack.artistName}`,
            );
            Spicetify.showNotification(
              "[Play Random] " +
                sample([
                  "There you have it!",
                  "Here it is!",
                  "Presenting...",
                  "And here you have it!",
                ]),
            );
            const playingUri = queuedTrack.uri;
            queuedTrack = null;
            prefetchAndQueue(targetUserUri, playingUri);
          } else if (queuedTrack) {
            // User skipped to something else, but our track is still in the queue - leave it
            console.log(
              "[Play Random][AUTO] User skipped, queued track still in queue",
            );
          } else {
            // No track queued (prefetch failed or first load) — queue one now
            console.log(
              "[Play Random][AUTO] No queued track, fetching one now",
            );
            prefetchAndQueue(targetUserUri, currentUri);
          }
        });

        // If autoplay was already enabled on load, queue a track
        if (autoplayEnabled) {
          const currentUri = Spicetify.Player.data?.item?.uri;
          prefetchAndQueue(targetUserUri, currentUri);
        }

        // Hotkeys with Alt
        document.addEventListener("keydown", async (e) => {
          if (e.altKey && e.key === "a") {
            autoplayEnabled = !autoplayEnabled;
            LocalStorage.set("play-random:autoplay", String(autoplayEnabled));
            Spicetify.showNotification(
              `[Play Random] Autoplay turned ${autoplayEnabled ? "ON" : "OFF"}`,
            );
            if (autoplayEnabled) {
              const currentUri = Spicetify.Player.data?.item?.uri;
              prefetchAndQueue(targetUserUri, currentUri);
            } else {
              if (queuedTrack) {
                try {
                  await Spicetify.removeFromQueue([{ uri: queuedTrack.uri }]);
                } catch (e) {
                  // Ignore
                }
                queuedTrack = null;
              }
            }
          }

          if (e.altKey && e.key === "r") {
            const result = await _PlayRandom.doTheThing(targetUserUri);
            if (autoplayEnabled && result) {
              prefetchAndQueue(targetUserUri, result.uri);
            }
          }

          if (e.altKey && e.key === "e") {
            openSettings();
          }
        });

        // Settings modal (right-click menu)
        let configContainer = null;

        function openSettings() {
          configContainer = document.createElement("div");
          configContainer.id = "play-random-config";

          const style = document.createElement("style");
          style.textContent = `
#play-random-config {
  max-height: none;
  overflow: visible;
}
#play-random-config .setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}
#play-random-config .setting-row .col.description {
  cursor: default;
  width: 50%;
}
#play-random-config .setting-row .col.action {
  display: flex;
  justify-content: flex-end;
  width: 50%;
}
#play-random-config button.switch {
  align-items: center;
  border: 0;
  border-radius: 50%;
  background-color: rgba(var(--spice-rgb-shadow), .7);
  color: var(--spice-text);
  cursor: pointer;
  display: flex;
  padding: 8px;
}
#play-random-config button.switch.disabled {
  color: rgba(var(--spice-rgb-text), .3);
}
#play-random-config input {
  width: 100%;
  padding: 0 8px;
  height: 32px;
  border: 0;
  border-radius: 4px;
  background: rgba(var(--spice-rgb-shadow), .7);
  color: var(--spice-text);
  font-size: 0.875rem;
}
#play-random-config button.btn {
  font-weight: 700;
  border-radius: 500px;
  transition-duration: 33ms;
  transition-property: background-color, border-color, color, box-shadow, filter, transform;
  padding-inline: 15px;
  border: 1px solid #727272;
  min-block-size: 32px;
  cursor: pointer;
}
#play-random-config button.btn:hover {
  transform: scale(1.04);
  border-color: var(--spice-text);
}
#play-random-config button.btn.save-btn {
  background-color: var(--spice-button);
  color: var(--spice-button-text, #000);
  border-color: var(--spice-button);
}
#play-random-config button.btn.reset-btn {
  background-color: rgba(var(--spice-rgb-shadow), .7);
  color: var(--spice-text);
}
#play-random-config details {
  margin-top: 16px;
  border: 1px solid rgba(var(--spice-rgb-text), .15);
  border-radius: 6px;
  padding: 8px 12px;
}
#play-random-config details summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  opacity: 0.8;
  user-select: none;
}
#play-random-config details[open] summary {
  margin-bottom: 8px;
}
#play-random-config .keybinding {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 0.825rem;
}
#play-random-config .keybinding kbd {
  background: rgba(var(--spice-rgb-shadow), .7);
  border: 1px solid rgba(var(--spice-rgb-text), .2);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.8rem;
  font-family: monospace;
}
#play-random-config .disclaimer {
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(var(--spice-rgb-shadow), .4);
  border-radius: 6px;
  font-size: 0.775rem;
  opacity: 0.7;
  line-height: 1.4;
}
`;

          // --- Autoplay toggle ---
          const autoplayRow = document.createElement("div");
          autoplayRow.classList.add("setting-row");
          autoplayRow.innerHTML = `
<label class="col description">Autoplay (continuous random)</label>
<div class="col action">
  <button class="switch ${autoplayEnabled ? "" : "disabled"}">
    <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons.check}</svg>
  </button>
</div>`;
          const autoplaySwitch = autoplayRow.querySelector("button.switch");
          autoplaySwitch.onclick = () => {
            autoplayEnabled = !autoplayEnabled;
            autoplaySwitch.classList.toggle("disabled", !autoplayEnabled);
            LocalStorage.set("play-random:autoplay", String(autoplayEnabled));
            Spicetify.showNotification(
              `[Play Random] Autoplay turned ${autoplayEnabled ? "ON" : "OFF"}`,
            );
            if (autoplayEnabled) {
              const currentUri = Spicetify.Player.data?.item?.uri;
              prefetchAndQueue(targetUserUri, currentUri);
            } else {
              if (queuedTrack) {
                try {
                  Spicetify.removeFromQueue([{ uri: queuedTrack.uri }]);
                } catch (e) {
                  // Ignore
                }
                queuedTrack = null;
              }
            }
          };

          // --- Profile URI section ---
          const profileHeader = document.createElement("h3");
          profileHeader.textContent = "Playlist Profile URI";
          profileHeader.style.marginTop = "16px";

          const uriInput = document.createElement("input");
          uriInput.type = "text";
          uriInput.placeholder = "spotify:user:<id>";
          uriInput.value = targetUserUri;

          const hintText = document.createElement("span");
          hintText.textContent =
            "Tip: You can also paste a Spotify profile share link!";
          Object.assign(hintText.style, {
            fontSize: "0.75rem",
            opacity: "0.6",
            marginTop: "4px",
          });

          const buttonRow = document.createElement("div");
          Object.assign(buttonRow.style, {
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
          });

          const resetBtn = document.createElement("button");
          resetBtn.className = "btn reset-btn";
          resetBtn.textContent = "Reset to Default";
          resetBtn.onclick = () => {
            uriInput.value = DEFAULT_URI;
            targetUserUri = DEFAULT_URI;
            LocalStorage.set("play-random:user-uri", DEFAULT_URI);
            Spicetify.showNotification(
              "[Play Random] Reset to default profile.",
            );
          };

          const saveBtn = document.createElement("button");
          saveBtn.className = "btn save-btn";
          saveBtn.textContent = "Save";
          saveBtn.onclick = () => {
            let val = uriInput.value.trim();
            // Parse Spotify profile link to URI
            const linkMatch = val.match(
              /^https?:\/\/open\.spotify\.com\/user\/([\w.-]+)/,
            );
            if (linkMatch) {
              val = `spotify:user:${linkMatch[1]}`;
            }
            if (/^spotify:user:[\w.-]+$/.test(val)) {
              targetUserUri = val;
              uriInput.value = val;
              LocalStorage.set("play-random:user-uri", val);
              Spicetify.showNotification("[Play Random] User URI saved!");
              Spicetify.PopupModal.hide();
            } else {
              Spicetify.showNotification(
                "[Play Random] Invalid input. Use spotify:user:<id> or a Spotify profile link.",
                true,
              );
            }
          };

          buttonRow.appendChild(resetBtn);
          buttonRow.appendChild(saveBtn);

          // --- Keybindings ---
          const keybindingsSection = document.createElement("details");
          keybindingsSection.innerHTML = `
<summary>Keyboard Shortcuts</summary>
<div class="keybinding"><span>Play random song</span><kbd>Alt + R</kbd></div>
<div class="keybinding"><span>Toggle autoplay</span><kbd>Alt + A</kbd></div>
<div class="keybinding"><span>Open settings</span><kbd>Alt + E</kbd></div>
`;

          // --- Disclaimer ---
          const disclaimer = document.createElement("div");
          disclaimer.className = "disclaimer";
          disclaimer.textContent =
            "Heads up: For the smoothest autoplay experience, avoid rapidly skipping songs or manually adding tracks to your queue while autoplay is on. One random track is always queued up for you - skipping too fast may briefly play a non-random song before the next one loads.";

          configContainer.append(
            style,
            autoplayRow,
            profileHeader,
            uriInput,
            hintText,
            buttonRow,
            keybindingsSection,
            disclaimer,
          );

          Spicetify.PopupModal.display({
            title: "Play Random - Settings",
            content: configContainer,
          });
        }

        // Context menu on user profiles
        const ctxPlayRandom = new Spicetify.ContextMenu.Item(
          "Play a random track",
          async (uris) => {
            const userUri = uris[0];
            await _PlayRandom.doTheThing(userUri);
          },
          undefined,
          "play",
        );

        const ctxQueueRandom = new Spicetify.ContextMenu.Item(
          "Queue a random track",
          async (uris) => {
            const userUri = uris[0];
            Spicetify.showNotification(
              "[Play Random] Fetching a random track to queue...",
            );
            const track = await _PlayRandom.fetchRandomTrack(
              userUri,
              Spicetify.Player.data?.item?.uri,
            );
            if (track) {
              try {
                await Spicetify.addToQueue([{ uri: track.uri }]);
                Spicetify.showNotification(
                  `[Play Random] Queued: "${track.trackName}" by ${track.artistName}`,
                );
              } catch (e) {
                Spicetify.showNotification(
                  "[Play Random] Failed to add to queue",
                  true,
                );
              }
            } else {
              Spicetify.showNotification(
                "[Play Random] Couldn't find a playable track from this user",
                true,
              );
            }
          },
          undefined,
          "queue",
        );

        const ctxSetProfile = new Spicetify.ContextMenu.Item(
          "Set as randomiser profile",
          (uris) => {
            const userUri = uris[0];
            targetUserUri = userUri;
            LocalStorage.set("play-random:user-uri", userUri);
            Spicetify.showNotification(
              `[Play Random] Profile set to ${userUri.split(":")[2]}`,
            );
            if (autoplayEnabled) {
              prefetchAndQueue(targetUserUri, Spicetify.Player.data?.item?.uri);
            }
          },
          undefined,
          "artist",
        );

        new Spicetify.ContextMenu.SubMenu(
          "Play Random",
          [ctxPlayRandom, ctxQueueRandom, ctxSetProfile],
          (uris) => Spicetify.URI.isProfile(uris[0]),
          false,
          getLogo(),
        ).register();
      }
    };

    var PlayRandom = _PlayRandom;

    async function main() {
      PlayRandom.addButton();
    }

    var app_default = main;

    (async () => {
      await app_default();
    })();
  })();
})();

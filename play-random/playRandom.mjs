import sample from "https://esm.sh/lodash.sample";
import random from "https://esm.sh/lodash.random";

(async function () {
  while (!Spicetify.React || !Spicetify.ReactDOM) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const icon = (name) =>
    `<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons[name]}</svg>`;

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
          icon("shuffle"),
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
            // User skipped to something else — remove old queued track, queue a new one
            console.log(
              "[Play Random][AUTO] User skipped, re-queuing a new track",
            );
            prefetchAndQueue(targetUserUri, currentUri);
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

import sample from "https://esm.sh/lodash.sample";
import random from "https://esm.sh/lodash.random";

(async function () {
  while (!Spicetify.React || !Spicetify.ReactDOM) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const icon = (name) =>
    `<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons[name]}</svg>`;

  function styleBtn(btn, bgColor, hoverColor) {
    Object.assign(btn.style, {
      backgroundColor: bgColor,
      color: "#fff",
      border: "none",
      padding: "0.375rem 0.75rem",
      borderRadius: "0.25rem",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "background-color 0.15s ease-in-out",
    });
    btn.className = "main-button-button";
    btn.onmouseenter = () => (btn.style.backgroundColor = hoverColor);
    btn.onmouseleave = () => (btn.style.backgroundColor = bgColor);
  }

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

      static async fetchPlaylist(response) {
        if (response.error) {
          console.log(response.error);
          return null;
        }
        try {
          const items = response.playlists?.public_playlists || [];
          if (items.length === 0) {
            console.error("[Play Random] No playlist items found in response");
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
          Spicetify.showNotification(
            "[Play Random] Couldn't grab a playlist. The vibes are off rn",
            true,
          );
          return null;
        }
      }

      static async fetchTracksFromPlaylist(uri) {
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
          const playlists = await _PlayRandom.fetchPlaylistsFromUser(userUri);
          console.log("[Play Random] Playlists response:", playlists);
          const playlistResult = await _PlayRandom.fetchPlaylist(playlists);
          if (playlistResult) {
            const { uri: randomPlaylistUri, name: playlistName } =
              playlistResult;
            const trackUris =
              await _PlayRandom.fetchTracksFromPlaylist(randomPlaylistUri);
            console.log(
              `[Play Random] Tracks from "${playlistName}":`,
              trackUris,
            );
            if (trackUris && trackUris.length > 0) {
              let randomTrackUri;
              let trackName = "Unknown Track";
              let artistName = "Unknown Artist";
              const maxAttempts = 10;
              let attempts = 0;
              let foundPlayable = false;
              while (attempts < maxAttempts) {
                attempts++;
                randomTrackUri = sample(trackUris);
                try {
                  const { getTrack } = Spicetify.GraphQL.Definitions;
                  const trackData = await Spicetify.GraphQL.Request(getTrack, {
                    uri: randomTrackUri,
                  });
                  const trackUnion = trackData?.data?.trackUnion;
                  trackName = trackUnion?.name || "Unknown Track";
                  artistName =
                    trackUnion?.firstArtist?.items?.[0]?.profile?.name ||
                    "Unknown Artist";
                  if (trackUnion?.playability?.playable) {
                    console.log(
                      `[Play Random] Track playable: "${trackName}" by ${artistName} (${randomTrackUri})`,
                    );
                    foundPlayable = true;
                    break;
                  } else {
                    console.error(
                      `[Play Random] Attempt ${attempts}/${maxAttempts}: "${trackName}" by ${artistName} not playable`,
                    );
                    await delay(1000);
                  }
                } catch (error) {
                  console.error(
                    `[Play Random] Attempt ${attempts}/${maxAttempts}: Error Fetching Track:`,
                    error,
                  );
                  Spicetify.showNotification(
                    `[Play Random] Track check failed (${attempts}/${maxAttempts})... still looking`,
                    true,
                  );
                  await delay(1000);
                }
              }
              if (!foundPlayable) {
                console.error(
                  "[Play Random] Max attempts reached, no playable track found",
                );
                Spicetify.showNotification(
                  "[Play Random] " +
                    sample([
                      "Tried 10 songs and none of em work. Massive L.",
                      "Bruh, 10 attempts and still nothing. The playlist is cooked.",
                      "Gave it 10 shots, all duds. This playlist is cursed fr.",
                    ]),
                  true,
                );
                return;
              }
              console.log(
                `[Play Random] Playing: "${trackName}" by ${artistName} from "${playlistName}" (${randomTrackUri})`,
              );
              try {
                await Spicetify.Player.playUri(randomTrackUri);
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
                return;
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
            } else {
              console.log("[Play Random] No tracks :((((");
              Spicetify.showNotification(
                "[Play Random] No tracks in the chosen playlist. Ghost town vibes.",
                true,
              );
            }
          } else if (playlists?.error) {
            console.log("[Play Random]", playlists.error);
            Spicetify.showNotification(
              "[Play Random] " +
                (playlists.error.startsWith("[Play Random] Sad Bruh")
                  ? "Server threw a fit. Try again in a sec."
                  : "No playlists in selected account. They're playlist-less."),
              true,
            );
          } else {
            Spicetify.showNotification(
              "[Play Random] Something didn't click. Try again maybe?",
              true,
            );
          }
        } catch (error) {
          console.error("[Play Random] doTheThing exploded:", error);
          Spicetify.showNotification(
            "[Play Random] " +
              sample([
                "Welp, something went totally sideways. Try again?",
                "The randomness machine broke. Give it another shot.",
                "Bruh moment — the whole thing just crashed. My bad.",
              ]),
            true,
          );
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
        let lastTrackUri = null;

        // Single topbar button — right click opens settings
        const button = new Spicetify.Topbar.Button(
          "Play a Random Song",
          icon("shuffle"),
          async () => {
            await _PlayRandom.doTheThing(targetUserUri);
          },
          false,
        );
        button.element.oncontextmenu = (e) => {
          e.preventDefault();
          openSettings();
        };

        // Track end detection for autoplay
        setInterval(async () => {
          if (
            !autoplayEnabled ||
            !Spicetify?.Player?.getProgress ||
            !Spicetify?.Player?.getDuration
          )
            return;

          const progress = Spicetify.Player.getProgress();
          const duration = Spicetify.Player.getDuration();
          const currentUri = Spicetify.Player.data?.item.uri;

          console.log("[Play Random][AUTO] progress:", progress);
          console.log("[Play Random][AUTO] duration:", duration);
          console.log("[Play Random][AUTO] uri:", currentUri);
          console.log("[Play Random][AUTO] lastTrackUri:", lastTrackUri);

          if (!progress || !duration || !currentUri) return;

          if (progress >= duration - 1000 && currentUri !== lastTrackUri) {
            console.log(
              "[Play Random][AUTO] Track finished. Triggering new random...",
            );
            Spicetify.Player.pause();
            lastTrackUri = currentUri;
            await _PlayRandom.doTheThing(targetUserUri);
          }
        }, 2000);

        // Hotkeys with Alt
        document.addEventListener("keydown", async (e) => {
          if (e.altKey && e.key === "a") {
            autoplayEnabled = !autoplayEnabled;
            LocalStorage.set("play-random:autoplay", String(autoplayEnabled));
            Spicetify.showNotification(
              `[Play Random] Autoplay turned ${autoplayEnabled ? "ON" : "OFF"}`,
            );
          }

          if (e.altKey && e.key === "r") {
            await _PlayRandom.doTheThing(targetUserUri);
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
  background-color: rgba(var(--spice-rgb-shadow), .7);
  border-radius: 500px;
  transition-duration: 33ms;
  transition-property: background-color, border-color, color, box-shadow, filter, transform;
  padding-inline: 15px;
  border: 1px solid #727272;
  color: var(--spice-text);
  min-block-size: 32px;
  cursor: pointer;
}
#play-random-config button.btn:hover {
  transform: scale(1.04);
  border-color: var(--spice-text);
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
            gap: "8px",
            marginTop: "8px",
          });

          const saveBtn = document.createElement("button");
          saveBtn.className = "btn";
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

          const resetBtn = document.createElement("button");
          resetBtn.className = "btn";
          resetBtn.textContent = "Reset to Default";
          resetBtn.onclick = () => {
            uriInput.value = DEFAULT_URI;
            targetUserUri = DEFAULT_URI;
            LocalStorage.set("play-random:user-uri", DEFAULT_URI);
            Spicetify.showNotification(
              "[Play Random] Reset to default profile.",
            );
          };

          buttonRow.appendChild(saveBtn);
          buttonRow.appendChild(resetBtn);

          configContainer.append(
            style,
            autoplayRow,
            profileHeader,
            uriInput,
            hintText,
            buttonRow,
          );

          Spicetify.PopupModal.display({
            title: "Play Random — Settings",
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

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
        while (
          !Spicetify.Topbar?.Button ||
          !Spicetify.PopupModal?.display ||
          !Spicetify.CosmosAsync ||
          !Spicetify.Playbar
        ) {
          await delay(100);
        }

        let targetUserUri = "spotify:user:thesoundsofspotify";
        let autoplayEnabled = false;
        let lastTrackUri = null;

        // Play Random button
        new Spicetify.Topbar.Button(
          "Play a Random Song",
          icon("shuffle"),
          async () => {
            await _PlayRandom.doTheThing(targetUserUri);
          },
          false,
        );

        // Toggle Autoplay button
        new Spicetify.Topbar.Button(
          "Toggle Autoplay",
          icon("play"),
          () => {
            autoplayEnabled = !autoplayEnabled;
            Spicetify.showNotification(
              autoplayEnabled
                ? "[Play Random] Autoplay: ON"
                : "[Play Random] Autoplay: OFF",
            );
          },
          false,
        );

        // Set Profile button
        new Spicetify.Topbar.Button(
          "Set Playlist Profile",
          icon("edit"),
          () => openPlaylistProfileModal(),
          false,
        );

        // Track end detection
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
            // Alt + A: Toggle autoplay
            autoplayEnabled = !autoplayEnabled;
            Spicetify.showNotification(
              `[Play Random] Autoplay turned ${autoplayEnabled ? "ON" : "OFF"}`,
            );
          }

          if (e.altKey && e.key === "r") {
            // Alt + R: Play random now
            await _PlayRandom.doTheThing(targetUserUri);
          }

          if (e.altKey && e.key === "e") {
            // Alt + E: Open playlist URI modal
            openPlaylistProfileModal();
          }
        });

        // Modal function for setting playlist profile URI
        function openPlaylistProfileModal() {
          const modalContent = document.createElement("div");
          Object.assign(modalContent.style, {
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          });

          const input = document.createElement("input");
          input.type = "text";
          input.placeholder = "spotify:user:your_username";
          input.value = targetUserUri;
          Object.assign(input.style, {
            padding: "0.375rem 0.75rem",
            borderRadius: "0.25rem",
            border: "1px solid #ced4da",
            backgroundColor: "#fff",
            color: "#212529",
            width: "100%",
            boxSizing: "border-box",
            fontSize: "1rem",
            transition:
              "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
          });
          input.onfocus = () => {
            input.style.borderColor = "#80bdff";
            input.style.outline = "0";
            input.style.boxShadow = "0 0 0 0.2rem rgba(0,123,255,.25)";
          };
          input.onblur = () => {
            input.style.borderColor = "#ced4da";
            input.style.boxShadow = "none";
          };

          const saveBtn = document.createElement("button");
          saveBtn.textContent = "Save";
          styleBtn(saveBtn, "#1DB954", "#1e9548ff");
          saveBtn.onclick = () => {
            const val = input.value.trim();
            if (/^spotify:user:[\w-]+$/.test(val)) {
              targetUserUri = val;
              Spicetify.showNotification("[Play Random] User URI updated!");
              Spicetify.PopupModal.hide();
            } else {
              Spicetify.showNotification(
                "[Play Random] Invalid URI. Format: spotify:user:<id>",
                true,
              );
            }
          };

          const resetBtn = document.createElement("button");
          resetBtn.textContent = "Reset to Default";
          styleBtn(resetBtn, "#6c757d", "#5c636a");
          resetBtn.onclick = () => {
            input.value = "spotify:user:thesoundsofspotify";
            targetUserUri = "spotify:user:thesoundsofspotify";
            Spicetify.showNotification(
              "[Play Random] Reset to default profile.",
            );
          };

          modalContent.appendChild(input);
          modalContent.appendChild(saveBtn);
          modalContent.appendChild(resetBtn);

          Spicetify.PopupModal.display({
            title: "Set Playlist Profile URI",
            content: modalContent,
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

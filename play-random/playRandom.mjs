import sample from "https://esm.sh/lodash.sample";
import random from "https://esm.sh/lodash.random";

(async function () {
  while (!Spicetify.React || !Spicetify.ReactDOM) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const icon = (name) => `<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons[name]}</svg>`;

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

  const _PlayRandom = class {
    static async fetchPlaylistsFromUser(userUri) {
      try {
        const userId = userUri.split(":")[2];
        const initialResponse = await Spicetify.CosmosAsync.get(
          `https://api.spotify.com/v1/users/${userId}/playlists?limit=1`
        );
        const totalPlaylists = initialResponse.total;

        if (totalPlaylists === 0) {
          return { error: "this mf dont have no playlists." };
        }
        if (totalPlaylists <= 50) {
          return { playlists: initialResponse };
        } else {
          const randomOffset = random(totalPlaylists - 1);
          const url = `https://api.spotify.com/v1/users/${userId}/playlists?limit=1&offset=${randomOffset}`;
          const response = await Spicetify.CosmosAsync.get(url);
          return { playlists: response };
        }
      } catch (error) {
        return { error: "Sad Bruh - Error fetching data : " + error.message };
      }
    }

    static async fetchPlaylist(response) {
      if (response.error) {
        console.log(response.error);
        return null;
      }
      try {
        const items = response.playlists?.items;
        if (!items || items.length === 0) {
          console.error("No playlist items found in response");
          Spicetify.showNotification("Playlist came back empty... weird flex but ok", true);
          return null;
        }
        const playlistUri = sample(items).uri;
        console.log("Random ahh Playlist URI:", playlistUri);
        return playlistUri;
      } catch (error) {
        console.error("Error picking a playlist:", error);
        Spicetify.showNotification("Couldn't grab a playlist. The vibes are off rn", true);
        return null;
      }
    }

    static async fetchTracksFromPlaylist(uri) {
      try {
        const res = await Spicetify.CosmosAsync.get(
          `sp://core-playlist/v1/playlist/${uri}/rows`,
          { policy: { link: true } }
        );
        return res.rows.map((item) => item.link);
      } catch (error) {
        console.error("Failed to fetch tracks from playlist:", error);
        Spicetify.showNotification(
          sample([
            "Couldn't fetch tracks from that playlist. It ghosted us.",
            "Playlist said 'access denied' basically. Rude.",
            "Tracks? What tracks? The playlist won't share.",
          ]),
          true
        );
        return null;
      }
    }

    static async doTheThing(userUri) {
      try {
        Spicetify.showNotification(
          sample([
            "Sit tight, my friend. The wheels of randomness are turning; your tune is in the making.",
            "Chill, mate! Randomness is doing its thing, and your jam is on the way.",
            "Hold on, buddy. The dice of randomness are rolling, and your song is in the works.",
            "Hey, hang in there! The randomness wheel is spinning, searching up a track for you.",
            "Hold on, pal! The chaos engine is at play; your jam is currently in the making.",
          ])
        );
        const playlists = await _PlayRandom.fetchPlaylistsFromUser(userUri);
        console.log(playlists);
        const randomPlaylistUri = await _PlayRandom.fetchPlaylist(playlists);
        if (randomPlaylistUri) {
          const trackUris = await _PlayRandom.fetchTracksFromPlaylist(randomPlaylistUri);
          console.log(trackUris);
          if (trackUris && trackUris.length > 0) {
            let randomTrackUri;
            const maxAttempts = 10;
            let attempts = 0;
            let foundPlayable = false;
            while (attempts < maxAttempts) {
              attempts++;
              randomTrackUri = sample(trackUris);
              try {
                const trackInfo = await Spicetify.CosmosAsync.get(
                  `https://api.spotify.com/v1/tracks/${randomTrackUri.split(":")[2]}`
                );
                if (trackInfo.preview_url) {
                  console.log("preview_url: ", trackInfo.preview_url);
                  foundPlayable = true;
                  break;
                } else {
                  console.error(`Attempt ${attempts}/${maxAttempts}: Chosen song not playable`);
                  await delay(1000);
                }
              } catch (error) {
                console.error(`Attempt ${attempts}/${maxAttempts}: Error Fetching Track:`, error);
                Spicetify.showNotification(`Track check failed (${attempts}/${maxAttempts})... still looking`, true);
                await delay(1000);
              }
            }
            if (!foundPlayable) {
              console.error("Max attempts reached, no playable track found");
              Spicetify.showNotification(
                sample([
                  "Tried 10 songs and none of em work. Massive L.",
                  "Bruh, 10 attempts and still nothing. The playlist is cooked.",
                  "Gave it 10 shots, all duds. This playlist is cursed fr.",
                ]),
                true
              );
              return;
            }
            console.log("Random ahh Track URI:", randomTrackUri);
            try {
              await Spicetify.Player.playUri(randomTrackUri);
            } catch (playError) {
              console.error("Failed to play track:", playError);
              Spicetify.showNotification(
                sample([
                  "Had the song but Spotify said nah. Try again?",
                  "Found a banger but the player choked. Rip.",
                  "Track was right there and playback just died on us.",
                ]),
                true
              );
              return;
            }
            Spicetify.showNotification(
              "Play Random - " +
                sample([
                  "There you have it!",
                  "Here it is!",
                  "Presenting...",
                  "And here you have it!",
                ])
            );
          } else {
            console.log("No tracks :((((");
            Spicetify.showNotification("No tracks in the chosen playlist. Ghost town vibes.", true);
          }
        } else if (playlists?.error) {
          console.log(playlists.error);
          Spicetify.showNotification(
            playlists.error.startsWith("Sad Bruh")
              ? "Server threw a fit. Try again in a sec."
              : "No playlists in selected account. They're playlist-less.",
            true
          );
        } else {
          Spicetify.showNotification("Something didn't click. Try again maybe?", true);
        }
      } catch (error) {
        console.error("doTheThing exploded:", error);
        Spicetify.showNotification(
          sample([
            "Welp, something went totally sideways. Try again?",
            "The randomness machine broke. Give it another shot.",
            "Bruh moment — the whole thing just crashed. My bad.",
          ]),
          true
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
        false
      );

      // Toggle Autoplay button
      new Spicetify.Topbar.Button(
        "Toggle Autoplay",
        icon("play"),
        () => {
          autoplayEnabled = !autoplayEnabled;
          Spicetify.showNotification(
            autoplayEnabled ? "Autoplay: ON" : "Autoplay: OFF"
          );
        },
        false
      );

      // Set Profile button
      new Spicetify.Topbar.Button(
        "Set Playlist Profile",
        icon("edit"),
        () => openPlaylistProfileModal(),
        false
      );

      // Track end detection
      setInterval(async () => {
        if (!autoplayEnabled || !Spicetify?.Player?.getProgress || !Spicetify?.Player?.getDuration) return;

        const progress = Spicetify.Player.getProgress();
        const duration = Spicetify.Player.getDuration();
        const currentUri = Spicetify.Player.data?.item.uri;

        console.log("[AUTO] progress:", progress);
        console.log("[AUTO] duration:", duration);
        console.log("[AUTO] uri:", currentUri);
        console.log("[AUTO] lastTrackUri:", lastTrackUri);

        if (!progress || !duration || !currentUri) return;

        if (progress >= duration - 1000 && currentUri !== lastTrackUri) {
          console.log("[AUTO] Track finished. Triggering new random...");
          Spicetify.Player.pause();
          lastTrackUri = currentUri;
          await _PlayRandom.doTheThing(targetUserUri);
        }
      }, 2000);

      // Hotkeys with Alt
      document.addEventListener("keydown", async (e) => {
        if (e.altKey && e.key === "a") { // Alt + A: Toggle autoplay
          autoplayEnabled = !autoplayEnabled;
          Spicetify.showNotification(
            `Autoplay turned ${autoplayEnabled ? "ON" : "OFF"}`
          );
        }

        if (e.altKey && e.key === "r") { // Alt + R: Play random now
          await _PlayRandom.doTheThing(targetUserUri);
        }

        if (e.altKey && e.key === "e") { // Alt + E: Open playlist URI modal
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
          transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
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
            Spicetify.showNotification("User URI updated!");
            Spicetify.PopupModal.hide();
          } else {
            Spicetify.showNotification("Invalid URI. Format: spotify:user:<id>", true);
          }
        };

        const resetBtn = document.createElement("button");
        resetBtn.textContent = "Reset to Default";
        styleBtn(resetBtn, "#6c757d", "#5c636a");
        resetBtn.onclick = () => {
          input.value = "spotify:user:thesoundsofspotify";
          targetUserUri = "spotify:user:thesoundsofspotify";
          Spicetify.showNotification("Reset to default profile.");
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

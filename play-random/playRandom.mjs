import sample from "https://esm.sh/lodash.sample";
import random from "https://esm.sh/lodash.random";

(async function () {
  while (!Spicetify.React || !Spicetify.ReactDOM) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  var main = (() => {
    // src/app.tsx
    var _PlayRandom = class {
      static async fetchPlaylistsFromUser(userUri) {
        try {
          const userId = userUri.split(":")[2];
          const initialResponse = await Spicetify.CosmosAsync.get(
            `https://api.spotify.com/v1/users/${userId}/playlists?limit=1`
          );
          const totalPlaylists = initialResponse.total;

          if (totalPlaylists == 0) {
            return { error: "this mf dont have no playlists." };
          }
          if (totalPlaylists <= 50) {
            return { playlists: initialResponse, from: "lesser" };
          } else if (totalPlaylists > 50) {
            const randomOffset = random(totalPlaylists - 1);
            const url = `https://api.spotify.com/v1/users/${userId}/playlists?limit=1&offset=${randomOffset}`;
            const response = await Spicetify.CosmosAsync.get(url);
            return { playlists: response, from: "more" };
          }
        } catch (error) {
          return { error: "Sad Bruh - Error fetching data : " + error.message };
        }
      }

      static async fetchPlaylist(response) {
        if (response.error) {
          console.log(response.error);
          return "nope";
        } else {
          const playlistUri = sample(response.playlists.items).uri;
          console.log("Random ahh Playlist URI:", playlistUri);
          return playlistUri;
        }
      }

      static async doTheThing(userUri) {
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
        if (randomPlaylistUri !== "nope") {
          const trackUris = await _PlayRandom.fetchTracksFromPlaylist(
            randomPlaylistUri
          );
          console.log(trackUris);
          if (trackUris && trackUris.length > 0) {
            let randomTrackUri;
            while (true) {
              randomTrackUri = sample(trackUris);
              try {
                const trackInfo = await Spicetify.CosmosAsync.get(
                  `https://api.spotify.com/v1/tracks/${
                    randomTrackUri.split(":")[2]
                  }`
                );
                if (trackInfo.preview_url) {
                  console.log("preview_url: ", trackInfo.preview_url);
                  break;
                } else {
                  console.error("Chosen song not playable");
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                }
              } catch (error) {
                console.error("Error Fetching Track: ", error);
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
            console.log("Random ahh Track URI:", randomTrackUri);
            await Spicetify.Player.playUri(randomTrackUri);
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
            Spicetify.showNotification("No Tracks in the chosen playlist");
          }
        } else if (playlists?.error) {
          console.log(playlists.error);
          Spicetify.showNotification(
            playlists.error.startsWith("Sad Bruh")
              ? "Server Error"
              : "No playlists in selected account"
          );
        }
      }

      // added more buttons
      static async addButton() {
        var _a, _b;
        while (
          !((_a = Spicetify.Topbar) == null ? void 0 : _a.Button) ||
          !((_b = Spicetify.PopupModal) == null ? void 0 : _b.display) ||
          !Spicetify.CosmosAsync ||
          !Spicetify.Playbar
        ) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        let targetUserUri = "spotify:user:thesoundsofspotify"; 
        let autoplayEnabled = false;
        let lastTrackUri = null;

        // Play Random button
        new Spicetify.Topbar.Button(
          "Play a Random Song",
          `<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons.shuffle}</svg>`,
          async () => {
            await _PlayRandom.doTheThing(targetUserUri);
          },
          false
        );

        // Toggle Autoplay button
        new Spicetify.Topbar.Button(
          "Toggle Autoplay",
          `<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons.play}</svg>`,
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
          `<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons.edit}</svg>`,
          async () => {
            openPlaylistProfileModal();
          },
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

        // Hotkeys with Alt instead of Ctrl
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
          modalContent.style.display = "flex";
          modalContent.style.flexDirection = "column";
          modalContent.style.gap = "10px";

          const input = document.createElement("input");
          input.type = "text";
          input.placeholder = "spotify:user:your_username";
          input.value = targetUserUri;
          input.style.padding = "0.375rem 0.75rem";
          input.style.borderRadius = "0.25rem";
          input.style.border = "1px solid #ced4da";
          input.style.backgroundColor = "#fff";
          input.style.color = "#212529";
          input.style.width = "100%";
          input.style.boxSizing = "border-box";
          input.style.fontSize = "1rem";
          input.style.transition = "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out";
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
          saveBtn.className = "main-button-button";
          saveBtn.style.backgroundColor = "#1DB954";
          saveBtn.style.color = "#fff";
          saveBtn.style.border = "none";
          saveBtn.style.padding = "0.375rem 0.75rem";
          saveBtn.style.borderRadius = "0.25rem";
          saveBtn.style.fontSize = "1rem";
          saveBtn.style.cursor = "pointer";
          saveBtn.style.transition = "background-color 0.15s ease-in-out";
          saveBtn.onmouseenter = () => (saveBtn.style.backgroundColor = "#1e9548ff");
          saveBtn.onmouseleave = () => (saveBtn.style.backgroundColor = "#1DB954");
          saveBtn.onclick = () => {
            const val = input.value.trim();
            if (/^spotify:user:[\w-]+$/.test(val)) {
              targetUserUri = val;
              Spicetify.showNotification("User URI updated!");
              Spicetify.PopupModal.hide();
            } else {
              Spicetify.showNotification("Invalid URI. Format: spotify:user:<id>");
            }
          };

          const resetBtn = document.createElement("button");
          resetBtn.textContent = "Reset to Default";
          resetBtn.className = "main-button-button";
          resetBtn.style.backgroundColor = "#6c757d";
          resetBtn.style.color = "#fff";
          resetBtn.style.border = "none";
          resetBtn.style.padding = "0.375rem 0.75rem";
          resetBtn.style.borderRadius = "0.25rem";
          resetBtn.style.fontSize = "1rem";
          resetBtn.style.cursor = "pointer";
          resetBtn.style.transition = "background-color 0.15s ease-in-out";
          resetBtn.onmouseenter = () => (resetBtn.style.backgroundColor = "#5c636a");
          resetBtn.onmouseleave = () => (resetBtn.style.backgroundColor = "#6c757d");
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

    PlayRandom.fetchTracksFromPlaylist = async (uri) => {
      const res = await Spicetify.CosmosAsync.get(
        `sp://core-playlist/v1/playlist/${uri}/rows`,
        {
          policy: { link: true },
        }
      );
      return res.rows.map((item) => item.link);
    };

    async function main() {
      PlayRandom.addButton();
    }

    var app_default = main;

    (async () => {
      await app_default();
    })();
  })();
})();

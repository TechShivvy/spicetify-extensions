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
            `https://api.spotify.com/v1/users/${userId}/playlists?limit=50`
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
          // let randomIndex;
          // if (response.from === "lesser") {
          //   randomIndex = Math.floor(
          //     Math.random() * response.playlists.items.length
          //   );
          // }
          // const playlistUri =
          //   response.playlists.items[
          //     response.from === "lesser" ? randomIndex : 0
          //   ].uri;
          const playlistUri = sample(response.playlists.items).uri;
          console.log("Random ahh Playlist URI:", playlistUri);
          return playlistUri;
        }
      }
      static async doTheThing() {
        Spicetify.showNotification(
          sample([
            "Sit tight, my friend. The wheels of randomness are turning; your tune is in the making.",
            "Chill, mate! Randomness is doing its thing, and your jam is on the way.",
            "Hold on, buddy. The dice of randomness are rolling, and your song is in the works.",
            "Hey, hang in there! The randomness wheel is spinning, searching up a track for you.",
            "Hold on, pal! The chaos engine is at play; your jam is currently in the making.",
          ])
        );
        const playlists = await _PlayRandom.fetchPlaylistsFromUser(
          "spotify:user:thesoundsofspotify" //databaseGuy -> basically this acc is like a reverse bank for playlists and im choosing a random track off of a random playlist ; if this is replcaed by anyones uri, track will be taken off their playlists
        );
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
                  await new Promise((resolve) => setTimeout(resolve, 1e3));
                }
              } catch (error) {
                console.error("Error Fetching Track: ", error);
                await new Promise((resolve) => setTimeout(resolve, 1e3));
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
        } else if (playlists == null ? void 0 : playlists.error) {
          console.log(playlists.error);
          Spicetify.showNotification(
            playlists.error.startsWith("Sad Bruh")
              ? "Server Error"
              : "No playlists in selected account"
          );
        }
      }
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
        new Spicetify.Topbar.Button(
          "Play a Random Song",
          `<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons.shuffle}</svg>`,
          async () => {
            await _PlayRandom.doTheThing();
          },
          false
        );
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

    // node_modules/spicetify-creator/dist/temp/index.jsx
    (async () => {
      await app_default();
    })();
  })();
})();

(async function() {
        while (!Spicetify.React || !Spicetify.ReactDOM) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        var spotispy = (() => {
  // src/app.tsx
  var _Recorder = class {
    static async processEvent(event, friendUri) {
      if (_Recorder.subscribedFriendUris.includes(friendUri)) {
        console.log(event, friendUri);
        await Spicetify.Platform.PlayerAPI.addToQueue([
          { uri: event.track.uri, uid: null }
        ]);
      }
    }
    static async getFriends() {
      var _a;
      while (!((_a = Spicetify.CosmosAsync) == null ? void 0 : _a.get)) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      const { friends } = await Spicetify.CosmosAsync.get(
        "https://spclient.wg.spotify.com/presence-view/v1/buddylist"
      );
      return friends.reverse();
    }
    static getUriType(uris) {
      const uriObj = Spicetify.URI.fromString(uris[0]);
      switch (uriObj.type) {
        case Spicetify.URI.Type.PROFILE:
          return true;
        default:
          return false;
      }
    }
    static async startTracking() {
      var _a, _b;
      while (!((_b = (_a = Spicetify.Platform) == null ? void 0 : _a.BuddyFeedAPI) == null ? void 0 : _b.subscribeToBuddyActivity)) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      const friends = await _Recorder.getFriends();
      const friendUris = friends.map((friend) => friend.user.uri.split(":")[2]);
      friendUris.forEach((friendUri) => {
        Spicetify.Platform.BuddyFeedAPI.subscribeToBuddyActivity(
          friendUri,
          (event) => {
            _Recorder.processEvent(event, friendUri);
          }
        );
      });
    }
    static toggleSubscription(friendUri) {
      console.log(this.subscribedFriendUris);
      if (_Recorder.subscribedFriendUris.includes(friendUri)) {
        const index = _Recorder.subscribedFriendUris.indexOf(friendUri);
        if (index !== -1) {
          _Recorder.subscribedFriendUris.splice(index, 1);
          console.log("removed");
        }
      } else {
        _Recorder.subscribedFriendUris.push(friendUri);
        console.log("pushed");
      }
    }
    static async addSettingsButton() {
      var _a, _b, _c;
      while (!((_a = Spicetify.Topbar) == null ? void 0 : _a.Button) || !((_b = Spicetify.React) == null ? void 0 : _b.createElement) || !((_c = Spicetify.PopupModal) == null ? void 0 : _c.display)) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const { createElement } = Spicetify.React;
      const createSettingsContent = async () => {
        const friends = await _Recorder.getFriends();
        const friendElements = friends.map((friend) => {
          const uri = friend.user.uri.split(":")[2];
          return createElement(
            "li",
            { key: uri },
            createElement("input", {
              type: "checkbox",
              id: uri,
              onChange: () => {
                _Recorder.toggleSubscription(uri);
                updateSelectAllCheckboxState();
              }
            }),
            friend.user.name
          );
        });
        const selectAllCheckbox = createElement("input", {
          type: "checkbox",
          id: "select-all",
          onChange: (event) => {
            const checkboxes = document.querySelectorAll(
              "input[type='checkbox']"
            );
            _Recorder.toggleSubscription(event.target.id);
            checkboxes.forEach((checkbox) => {
              if (event.target.checked) {
                if (!checkbox.checked) {
                  checkbox.checked = true;
                  _Recorder.toggleSubscription(checkbox.id);
                }
              } else {
                if (checkbox.checked) {
                  checkbox.checked = false;
                  _Recorder.toggleSubscription(checkbox.id);
                }
              }
            });
          }
        });
        function updateSelectAllCheckboxState() {
          const checkboxes = document.querySelectorAll(
            "input[type='checkbox']"
          );
          let allChecked = true;
          checkboxes.forEach((checkbox) => {
            if (checkbox.id !== "select-all" && !checkbox.checked) {
              allChecked = false;
              return;
            }
          });
          checkboxes.forEach((checkbox) => {
            if (checkbox.id === "select-all") {
              checkbox.checked = allChecked;
              return;
            }
          });
        }
        return createElement(
          "div",
          null,
          selectAllCheckbox,
          createElement(
            "label",
            {
              htmlFor: "select-all",
              style: { fontStyle: "italic", fontWeight: "bold" }
            },
            "Select All"
          ),
          createElement("ul", null, friendElements)
        );
      };
      new Spicetify.Topbar.Button(
        "Friends Activity Recorder",
        `<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons.edit}</svg>`,
        async () => {
          const content = await createSettingsContent();
          Spicetify.PopupModal.display({
            title: "Spotispy",
            content,
            isLarge: true
          });
          _Recorder.subscribedFriendUris.forEach((friendUri) => {
            const element = document.getElementById(
              friendUri
            );
            if (element) {
              element.checked = true;
            }
          });
        },
        false
      );
    }
  };
  var Recorder = _Recorder;
  Recorder.subscribedFriendUris = [];
  async function main() {
    Recorder.startTracking();
    Recorder.addSettingsButton();
  }
  var app_default = main;

  // node_modules/spicetify-creator/dist/temp/index.jsx
  (async () => {
    await app_default();
  })();
})();

      })();
# Play a Random Song

[Spicetify](https://github.com/khanhas/spicetify-cli) extension to surprise yourself with a random track (plays a random song).

## Motivation

Hey there! Welcome to my second Spicetify gig – a seemingly pointless (again?) yet oddly fascinating extension. The idea struck me on New Year's Eve when I pondered what my first song of the next year would/should be. Not wanting to leave it to playlist shuffles or specific searches, I crafted this extension to play a completely random track. It turns out, exploring new, sometimes obscure, songs is way more fun than I thought. Join me in this musical adventure, and who knows, you might stumble upon some hidden gems too!

## Install

Copy `playRandom.mjs` into your [Spicetify](https://github.com/khanhas/spicetify-cli) extensions directory:

| **Platform** | **Path**                                                                             |
| ------------ | ------------------------------------------------------------------------------------ |
| **Linux**    | `~/.config/spicetify/Extensions` or `$XDG_CONFIG_HOME/.config/spicetify/Extensions/` |
| **MacOS**    | `~/spicetify_data/Extensions` or `$SPICETIFY_CONFIG/Extensions`                      |
| **Windows**  | `%appdata%\spicetify\Extensions\`                                                    |

After putting the extension file into the correct folder, run the following command to install the extension or install through marketplace:

```sh
spicetify config extensions playRandom.mjs
spicetify apply
```

Note: Using the `config` command to add the extension will always append the file name to the existing extensions list. It does not replace the whole key's value.

Or you can manually edit your `config-xpui.ini` file. Add your desired extension filenames in the extensions key, separated them by the | character.
Example:

```ini
[AdditionalOptions]
...
extensions = autoSkipVideo.js|bookmark.js|fullAppDisplay.js|playRandom.mjs
```

Then run:

```sh
spicetify apply
```

## Usage

- Click the **shuffle button** on the top bar to play a random track from the target user's public playlists.
- **Right-click** the shuffle button to open the **Settings** modal where you can:
  - Toggle **Autoplay** (continuous random playback)
  - Set a **target profile URI** (accepts `spotify:user:<id>` or a Spotify profile share link)
  - Save or reset to the default profile (`thesoundsofspotify`)
- **Right-click any user profile** in Spotify to see the **Play Random** context menu:
  - **Play a random track** - immediately plays a random song from that user's playlists
  - **Queue a random track** - silently fetches and adds a random song to your queue
  - **Set as randomiser profile** - saves that user as the target for autoplay and hotkeys

### Keyboard Shortcuts

| Shortcut  | Action                 |
| --------- | ---------------------- |
| `Alt + R` | Play a random song     |
| `Alt + A` | Toggle autoplay on/off |
| `Alt + E` | Open settings modal    |

### Autoplay

When autoplay is enabled, the extension pre-fetches a random track and injects it into your queue. When it plays, a toast notification appears and the next track is automatically queued. Skipping songs or manually queuing tracks won't interfere - the random track simply stays in your queue until it's reached.

> **Tip:** For the smoothest experience, avoid rapidly skipping songs while autoplay is on. One random track is always queued up - skipping too fast may briefly play a non-random song before the next one loads.

[![Preview](preview.gif)](https://raw.githubusercontent.com/TechShivvy/spicetify-extensions/main/play-random/preview.gif)

## Credits

- [Delusoire](https://github.com/Delusoire) for the optimization help!
- [Hitesh1090](https://github.com/Hitesh1090) for intermidiate development and testing of the extension and autoplay feature!
- [veryboringhwl](https://github.com/veryboringhwl) for the API migration help!

## More

🌟 Like it? Gimme some love!

[![Github Stars badge](https://img.shields.io/github/stars/TechShivvy/spicetify-extensions?logo=github&style=social)](https://github.com/TechShivvy/spicetify-extensions/)
If you find any bugs, please [create a new issue](https://github.com/TechShivvy/spicetify-extensions/issues/new/choose) on the GitHub repo.
![https://github.com/TechShivvy/spicetify-extensions/issues](https://img.shields.io/github/issues/TechShivvy/spicetify-extensions?logo=github)

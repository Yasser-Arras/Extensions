# Random Memes Tabs SFX

A tiny Chromium extension that plays a **random sound** whenever you open or close a tab.
Just import the chromium folder as an unpacked extension in your browser's Extensions settings.
## How it works
- Uses **Manifest V3**
- Plays sounds through an **offscreen document**
- Randomly selects a sound from the `shared/open` and `shared/close` folders

## Modifying sounds
1. Go to `shared/open` and `shared/close`
2. Add or replace `.ogg` sound files
3. Run `buildist.py` in the main folder to update sounds.json

## Browser support
- Chrome
- Edge

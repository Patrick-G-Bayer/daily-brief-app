# Silly Story Studio

A touch-first, landscape story playground for a grown-up and a preschooler to play together on a tablet.
Drag cartoon characters and props around a scene, swap backdrops, tap things to make them do silly
animations and sounds, and record your own voices for the characters.

No reading, timers, scores, ads or accounts. Everything stays on the device and works offline.

## How to play

| Do this | What happens |
| --- | --- |
| **Tap a character** (right side) | It hops onto the stage. Tap it again on stage for its silly move and sound. |
| **Tap a toy** (bottom shelf) | It pops onto the stage. Swipe the shelf sideways to see all 20 toys. |
| **Drag** anything | It follows your finger. Drag straight out of the shelf or the character column, too. Two fingers can drag two things at once. |
| **Drop something back on the shelf** or the character column | It's put away with a "whoop". |
| **Tap a big round picture** (left side) | The backdrop changes (Farm, Jungle, Castle). Everyone stays and does a little hop. |
| **Tap or swipe the empty background** | Sparkles and musical twinkles (higher notes at the top). |
| **Red microphone** (appears when a character is tapped) | Tap to record, tap again to stop (it also stops on its own after about 10 seconds). The character then says it back. |
| **▶ / mouse / bear** buttons | Play the voice normally, squeaky or deep. Tapping the character also plays its voice. |

Nothing can be lost off-screen, every touch does something, and there's no wrong way to play.

### Grown-up corner

Press and **hold the small lock (bottom-left) for 2 seconds** to open it. There you can:

- play or delete each character's recorded voice, or delete them all
- clear the stage
- turn sound on/off, go full screen, or install the app
- see the microphone status and how to fix it if it's blocked

### Microphone permission

The first time the red microphone is tapped, a card explains (to the grown-up) what recording does.
The grown-up **presses and holds ✓**, then chooses **Allow** in the browser's prompt. Holding is
required so a toddler can't trigger the browser prompt by accident. After that, recording is one tap.

If the microphone is blocked, the card shows the exact steps to unblock it in Chrome. If recording
isn't possible at all (no HTTPS, an old browser, no mic), everything else keeps working.

Recordings are trimmed of leading/trailing silence and stored **only on this device** (IndexedDB).
A recording that's all silence is ignored, so it never replaces a voice with nothing.

## Develop

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev        # http://localhost:5173 (also on your LAN; use HTTPS or localhost for the mic)
npm run build      # type-checks, then writes the static site to dist/
npm run preview    # serve dist/ locally to try the production build (incl. offline mode)
```

## Deploy to your website

1. `npm run build`
2. Upload **the contents of `dist/`** to any folder on your site, e.g. `https://example.com/silly-story/`.
   All paths are relative, so it works in any folder (or at the root) with no server configuration.
3. Make sure the site is served over **HTTPS**. Browsers only allow the microphone, the offline
   service worker and "Install app" on secure pages.

Tip: if your host lets you set caching, don't cache `sw.js` for long (or at all), so updates reach the tablet quickly.
Everything else in `assets/` has content-hashed names and can be cached forever.

### Put it on the tablet

Open the page in Chrome on the Android tablet, then **⋮ → Add to Home screen / Install app**
(or use *Install app* in the grown-up corner). It then launches full screen, in landscape, and works
without internet. After you deploy an update, the tablet picks it up the next time the app is opened
while online (sometimes on the second launch).

## Privacy

- No accounts, ads, analytics, cookies or network requests after the first load.
- The current story (scene + positions) is saved in `localStorage`. Voices are saved in `IndexedDB`.
- Nothing ever leaves the device. Clearing the browser's site data removes everything.

## Project layout

```
src/
  App.tsx                 game state, drag & drop, taps, recording flow
  art/characters.tsx      6 characters (original SVG artwork)
  art/props.tsx           20 props
  art/scenes.tsx          3 backdrops
  audio/sfx.ts            synthesized sound effects (Web Audio, no audio files)
  audio/voices.ts         mic recording, IndexedDB storage, playback with pitch effects
  state/story.ts          story reducer + local save/load
  anim.ts                 tap animations (Web Animations API)
  components/             rails, stage items, voice controls, cards, grown-up panel
public/                   favicon + PWA icons
scripts/make-icons.mjs    regenerates the PNG icons from public/favicon.svg (needs Playwright)
```

### Adding more stuff

- **A prop:** draw an SVG component in `src/art/props.tsx` and add an entry to `PROPS`
  (`size` is its height as a fraction of the stage; pick an `anim` and a `sound`).
- **A character:** same, in `src/art/characters.tsx`. Its voice is stored under its `id`.
- **A scene:** add a component and an entry to `SCENES` in `src/art/scenes.tsx`, and its id to
  `SceneId` in `src/types.ts` and `SCENE_IDS` in `src/state/story.ts`.

All artwork is original placeholder art drawn as inline SVG, so it scales crisply on any screen.

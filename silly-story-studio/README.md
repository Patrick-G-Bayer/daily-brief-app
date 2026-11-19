# Silly Story Studio

A touch-first, landscape **puppet show maker** for a grown-up and a preschooler to play together on a
tablet. Pick a cast and some backdrops, move the puppets around the stage while you talk, and the app
records the whole performance (moves and voices) so you can watch it back like a little movie.

It's modelled on the classic "digital puppet theatre" style of app: pick actors and backdrops, perform
live, record, replay. All characters, artwork and code here are original.

No reading for the child, and no timers, scores, ads or accounts. Everything stays on the device and
works offline.

## How to play

**Home** has three big buttons: keep playing the current show (when there is one), start a **new show**,
and watch **saved shows**.

**1. Pick actors.** Tap up to **8** pictures: characters, props, or your own photo puppets. They fill the
circles at the top. Tap a circle to take an actor out. Then tap the big green arrow.

**2. Pick backdrops.** Tap up to **5** scenes (Farm, Jungle, Castle or your own photos), then the green arrow.

**3. On stage**

| Do this | What happens |
| --- | --- |
| **Drag** an actor up from the bottom row | It walks onto the stage (or just tap it to pop it on). |
| **Drag** an actor around | It follows your finger. Two people can drag two actors at once. |
| **Two fingers** on an actor | Pinch to make it bigger or smaller, and twist to turn it. A finger on the actor plus a finger anywhere on the stage works too. |
| **Double-tap** an actor | It flips to face the other way. |
| Drag an actor **off the edge** (or back to the bottom row) | It leaves the stage and waits in the wings. |
| Tap a **backdrop** on the left | The scene changes, even in the middle of a recording. |
| **Red button** | Records the show: every move, flip, scene change and your voices. The stage glows red while recording. |
| **Pause** (orange) | Pauses the recording so you can set up the next scene. Tap the red dot to carry on. |
| **Square** | Finishes the show, saves it and plays it straight back. |

**Saved shows** play back with ▶, pause and start-again buttons. Shows can't be edited after they're
saved: just make a new one. A single show stops itself after 5 minutes.

### Photo puppets & photo backdrops

Tap the **camera** tile when picking actors or backdrops, then take a picture or choose one.

- **Puppet:** trace around the person, pet or toy with one finger. A green line shows the cut. Tap ✓ to
  keep it (it gets a sticker-style white edge) or ↺ to trace again.
- **Backdrop:** the photo is cropped to fill the stage.

Photos are stored only on this device. Each saved show keeps its own copy of the photos it used, so it
still plays if you later delete a photo.

### Grown-up corner

Press and **hold the small lock for 2 seconds** (bottom-left on the home screen and on the stage). There
you can delete saved shows and photos, turn show sound on/off, go full screen, install the app, and see the
microphone status. It also has a short how-to.

### Microphone permission

The first time the red record button is pressed, a card explains (to the grown-up) that shows record
voices. The grown-up **presses and holds ✓**, then chooses **Allow** in the browser's prompt. Holding is
required so a toddler can't trigger the browser prompt by accident.

**✕ records the show without sound**, so a little one is never stuck. If the microphone is blocked, missing
or unsupported, the card explains how to fix it, and shows can still be recorded silently.

## Develop

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev        # http://localhost:5173 (use localhost or HTTPS for the mic and camera)
npm run build      # type-checks, then writes the static site to dist/
npm run preview    # serve dist/ locally to try the production build (incl. offline mode)
```

## Deploy to your website

1. `npm run build`
2. Upload **the contents of `dist/`** to any folder on your site, e.g. `https://example.com/silly-story/`.
   All paths are relative, so it works in any folder (or at the root) with no server configuration.
3. Make sure the site is served over **HTTPS**. Browsers only allow the microphone, the offline service
   worker and "Install app" on secure pages.

Tip: if your host lets you set caching, don't cache `sw.js` for long (or at all), so updates reach the
tablet quickly. Everything in `assets/` has content-hashed names and can be cached forever.

### Put it on the tablet

Open the page in Chrome on the Android tablet, then **⋮ → Add to Home screen / Install app** (or use
*Install app* in the grown-up corner). It then launches full screen, in landscape, and works without
internet. After you deploy an update, the tablet picks it up the next time the app is opened while online
(sometimes on the second launch).

## Privacy

- No accounts, ads, analytics, cookies or network requests after the first load.
- The show in progress is saved in `localStorage`. Saved shows (moves + audio) and photos are saved in
  `IndexedDB`.
- Nothing ever leaves the device. Clearing the browser's site data removes everything.

## How recording works

A show is saved as its starting stage plus a timeline of small actions (actor entered, moved to x/y,
resized/turned, flipped, left, backdrop changed), together with one audio track from `MediaRecorder`.
Playback replays the same actions through the same reducer in time with the audio, so a show is a few
kilobytes of moves plus the voice recording, not a video file.

## Project layout

```
src/
  App.tsx                   screens, saved shows/photos, grown-up corner
  screens/Home.tsx          continue / new show / saved shows
  screens/Picker.tsx        pick up to 8 actors or 5 backdrops (with camera tile)
  screens/Cutout.tsx        trace around a photo to make a puppet
  screens/StageScreen.tsx   the stage: wings, gestures, record / pause / stop
  screens/Player.tsx        watch a saved show
  screens/Shows.tsx         saved shows gallery
  components/StageView.tsx  draws a stage (live, playback and thumbnails)
  state/stage.ts            stage reducer + saving the show in progress
  state/db.ts               IndexedDB for saved shows and photos
  audio/recorder.ts         microphone recording with pause/resume
  photo.ts                  photo loading, backdrop crop, sticker cut-out
  art/                      6 characters, 20 props, 3 backdrops (original SVG) + registry
public/                     favicon + PWA icons
scripts/make-icons.mjs      regenerates the PNG icons from public/favicon.svg (needs Playwright)
```

### Adding more stuff

- **An actor:** draw an SVG component in `src/art/characters.tsx` or `src/art/props.tsx` and add it to the
  list (`size` is its starting height as a fraction of the stage).
- **A backdrop:** add a component and an entry to `SCENES` in `src/art/scenes.tsx` (1600×900 artwork).

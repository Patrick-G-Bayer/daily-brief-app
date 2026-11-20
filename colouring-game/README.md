# Snap & Splash

A tablet colouring game prototype for ages 3–5. A grown-up photographs a colouring page, or any picture, and the child taps a crayon and then taps an area to fill it with a splash.

It's a single file, `index.html`. Open it in a tablet browser, or serve the folder (`python3 -m http.server`) and add it to the home screen.

## How it plays

1. **Shelf (child).** Big paper cards: the child's photo pages plus three starter pages (garden, sea, space). Tap one to colour it.
2. **Grown-ups gate.** Press and hold the yellow camera for 1.5 seconds. A short tap only shows a hint.
3. **Line up the page (grown-up).** Drag four corner dots onto the picture. This also straightens a photo taken at an angle.
4. **Check the outlines (grown-up).** Preview of the outlines, with each tap area tinted. A *Fewer lines / More lines* slider fixes leaks or missing lines.
5. **Colour (child).** 12 crayons, a rainbow crayon and an eraser. Each tap fills the whole area with a splash that spreads from the finger, plus droplets and a note. Undo, star (confetti), save to tablet.

Progress saves automatically on the tablet in IndexedDB. Pictures never leave the device.

## How a photo becomes a colouring page

All of this is plain JS on a canvas, about 1 second on a 1200 px picture:

- **Perspective:** a homography from the four corners, with bilinear resampling.
- **Printed lines:** a grey-level "black-hat" (closing minus image) finds thin dark strokes but ignores big dark areas. Very dark blobs, like pupils, are kept as solid ink.
- **Coloured pictures:** Canny-style colour edges (RGB gradient, thinning, hysteresis) turn boundaries between colours into lines.
- **Clean-up:** hysteresis joins faint pieces of a line to strong ones. Small specks are dropped. Lines are grown slightly into a "barrier" so small gaps don't leak.
- **Tap areas:** connected regions of the barrier-free pixels. Tiny regions, such as the inside of printed digits, are merged into their neighbours. Every line pixel belongs to its nearest area, so colour runs under the outlines and a tap on a line still fills something.
- **Crayon look:** fills use a fixed diagonal "grain" that lets a little paper show through.

## Decisions so far

- Web app (works on iPad and Android tablets).
- Photos of blank pages *and* coloured pictures.
- Free colouring only. Printed colour-by-number digits stay visible but don't make holes.
- Ages 3–5, parent takes the photo. No reading needed on the child's screens.

## Known limits / next ideas

- Faint or thin lines (glare, plastic wrap, a page far from the camera) can break up and merge areas. Filling the frame with the page works best, and *More lines* helps.
- No automatic page-corner detection yet; corners start at the photo edges.
- Ideas: pinch-zoom for small areas, sticker stamps, a "magic brush" free-draw mode, voice prompts for colour names.

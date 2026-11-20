# Snap & Splash

A tablet colouring game prototype for ages 3–5. A grown-up photographs a colouring page, or any picture, and the child taps a crayon and then taps an area to fill it with a splash.

It's a single file, `index.html`. Open it in a tablet browser, or serve the folder (`python3 -m http.server`) and add it to the home screen.

## How it plays

1. **Shelf (child).** Big paper cards: the child's photo pages plus three starter pages (garden, sea, space). Tap one to colour it.
2. **Grown-ups gate.** Press and hold the yellow camera for 1.5 seconds. A short tap only shows a hint.
3. **Line up the page (grown-up).** Drag four corner dots onto the picture. This also straightens a photo taken at an angle.
4. **Check the outlines (grown-up).** Preview of the outlines, with each tap area tinted. A *Fewer lines / More lines* slider, plus a Pen (close a gap) and Rubber (remove a line) for touch-ups.
5. **Colour (child).** 12 crayons, a rainbow crayon and an eraser. Each tap fills the whole area with a splash that spreads from the finger, plus droplets and a note. Undo, star (confetti), save to tablet.
6. **Zoom.** Pinch with two fingers to zoom (up to 6×) and drag to move around, or use the + / − buttons and the mouse wheel. A tap still fills; a drag never does.
7. **Big crayon box (grown-ups' option).** Switched on in the grown-ups box. It adds a crayon box to the tray that opens 60 shades (12 hues × 5 depths), earth, skin, grey and metallic colours, and a "mix your own" colour picker. Colours you pick join the tray as crayons (last 5).

Progress saves automatically on the tablet in IndexedDB. Pictures never leave the device.

## How a picture becomes a colouring page

All of this is plain JS on a canvas, at a working size of 1600 px on the long side (about 2 s on a laptop, a few seconds on a tablet):

1. **Perspective:** a homography from the four corners, with bilinear resampling. Transparent parts of saved images become white paper.
2. **Outlines:** a grey-level "black-hat" (closing minus image) finds thin dark strokes but not big dark areas. Hysteresis joins faint stretches of a line to strong ones. A morphological closing with a disc joins line ends up to about 10 px apart without making every line fatter.
3. **Flatten:** two passes of a Kuwahara filter smooth shading, texture and JPEG speckle inside areas while keeping edges sharp.
4. **Colour patches:** the flattened picture is split into patches of near-identical colour (OKLab), with the outlines left out.
5. **Merge (the *Fewer / More lines* slider):** neighbouring patches merge closest-first when their colours are close. Lightness counts for less than hue, so a shadow or a gradient joins its base colour. Then specks, thin slivers along edges, and small enclosed highlights or blushes fold into a neighbour (an island is only folded in if it is tiny next to what surrounds it, so a lollipop's rings stay).
6. **Lines** = outlines + borders between the remaining areas. Solid near-black areas such as pupils stay black.
7. **Touch-ups:** on the *Check the outlines* screen a grown-up can draw with a **Pen** to close a gap or use the **Rubber** to remove a line, with undo. Strokes are kept and re-applied if the slider moves.
8. **Tap areas:** connected regions between the lines. Every line pixel belongs to its nearest area, so colour runs under the outlines and a tap on a line still fills something.

## Decisions so far

- Web app (works on iPad and Android tablets).
- Photos of blank pages *and* coloured pictures; mostly saved images of flat cartoon art and shaded art.
- Accuracy over speed: up to about 5 seconds to get a picture ready is fine.
- Free colouring only. Printed colour-by-number digits stay visible but don't make holes.
- Ages 3–5, parent takes the photo. No reading needed on the child's screens.

## Known limits / next ideas

- Camera photos with glare or faint lines can still break up; saved images work best. The Pen fixes what's left.
- No zoom on the *Check the outlines* screen yet, so touch-ups on very small parts are fiddly.
- No automatic page-corner detection yet; corners start at the photo edges.
- Zoom scales the 1600 px working picture, so lines soften past about 4×.
- Ideas: sticker stamps, a "magic brush" free-draw mode, voice prompts for colour names.

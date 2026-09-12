# Autolith landing page (prototype)

Static, no build step. Serve the folder or open index.html.

## The rule the page is built on

Two tones. Black ink on one off-white substrate (#fffefa) and nothing between
them. No grey text, no grey rules, no grey panels, and no value produced by
rgba, opacity or blur that would render as a third tone. The only intermediate
tone anywhere is 1-bit dither.

Hierarchy therefore comes from size, weight, slope and position, never from
fading something out. Italic is the apparatus voice: captions, notes, asides,
tool responses, links in running text.

No horizontal rule ever separates two sections. Spacing does that. Rules exist
only to bound an object: a window frame, a code block, a table cell, a tab.

Colour is the Lambda Symbolics green, and only on the house lambda in the
footer lockup, plus the reader caret, the shell prompts, and the 9px square
beside the install warning. Everything else is ink or paper. The mark renders
as #3fb68b on the inverted footer. The nav and the hero carry the word alone:
the logotype next to it was one mark too many.

The page is off-white throughout. The footer is the single inversion.

## Motion, and why each piece exists

- Hero canvas: a tower of bricks that edits itself under gravity. Every brick
  has a position and a velocity, and falls to the slot it currently occupies.
  Three things happen to it. A pull: a brick slides out of the middle, goes
  dark on the way, and once it is clear everything above drops into the gap;
  the brick then falls into the grass, cools back to stone, lies there a
  moment and dissolves. A drop: a new brick, never anywhere but the top, falls
  from above and lands with a squash. A recut: one brick is redefined in
  place, which is the only change that moves nothing else. New bricks answer
  to the one below them so the tower stays a tower, the count random-walks
  inside a band either side of nominal, and the bottom course is never pulled.
  Bricks sit flush: an open joint turns the tower into a stack of plates when
  the rotation brings it head on. Grass grows at the foot of it in tufts, with
  a few flowers, all in the ground plane so it turns with the stone and sorts
  in front of or behind it. The scene is drawn at a third of screen resolution
  into ordered-dither tiles (4x4 Bayer, seventeen tones) and thresholded to
  pure ink or pure paper before it is blitted back, so no anti-aliased edge
  can smuggle a grey onto the page. It is positioned clear of the type from a
  measured box rather than hiding behind a scrim.
- Five things happen to the tower, not three. Besides the pull, the drop and
  the recut there is a quarter turn, which swaps a brick's footprint without
  moving anything else, and a split, which takes a piece off one end and
  throws it clear. Anything that leaves the tower now tumbles while it falls,
  lands with a ring of dust, and comes to rest square. Every so often a bar
  runs up the whole stack and each course it crosses goes hot behind it.
- Weather, on wide screens only, where the block has sky. A cloud gathers as
  it crosses and comes apart again at the far end, so it can drift the whole
  width without ever appearing out of nothing over the type. A flock goes past
  every half minute or so. The grass leans with a wind made of three sine
  waves, which is enough to stop it looking like a printed pattern.
- Four plates between sections, from the same one bit: a Mobius band, a window
  over a corpus, two interfering sources, and a block of layers that fans
  apart. Two are solids lit by the hero's lamp and painted back to front, two
  are fields written a pixel at a time against the same Bayer matrix. Each
  one renders only while it is on screen, at sixteen frames a second.
- Pinned desugar: scroll scrubs a per-character morph from a plain sentence to
  the Lisp form it actually is.
- Live reader: type into it. Prose becomes a call to prompt. Open a
  parenthesis and it stays a form, because it already is one.
- Three figures share one builder and one animation: the recursive-inference
  fan-out, the mutation path, and the recovery path. Each draws itself once
  when it enters the viewport.
- Nav scroll-spy, reveal-on-enter, atomic inversion on hover.

Nothing here watches prefers-reduced-motion. A frozen page looks broken, not
considerate, and desktop browsers report the preference for reasons that have
nothing to do with wanting a still page. `?still=1` is the only thing that
stops the motion.

## Files

- `index.html`, `styles.css`, `app.js` (no dependencies)
- `fonts/`, `logo/`, `autolith.png`, `og.png` from `lambda-symbolics/ls-landing`
- `logo/ls-lambda.svg`, `logo/ls-wordmark.svg`, `logo/favicon.svg` from
  `logos-lambda-symbolics.zip`, stripped of the 4 MB clipped-away reference
  raster the exporter left behind. The favicon is the same path in a square
  viewBox, since a favicon that is letterboxed is a favicon nobody can see.
  The lambda now appears only there and in the footer
- `casts/` plus `asciinema-player.*`, three real recorded sessions, loaded on demand

## Debug parameters

- `?still=1` freezes every animation in its finished state, for screenshots
- `?stage=0|1|2` pins the desugar morph to one stage
- `?t=<seconds>` runs the tower forward at a fixed step before the first
  frame, so a still capture can land in the middle of a pull or a drop

Copy follows the Voice section of `docs/system-prompt.org` in the Autolith
repo, plus stop-slop and humanizer.

Deploy with `/usr/bin/vercel deploy --prod --yes`.

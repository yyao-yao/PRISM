# Photography — editorial gallery and lightbox

The gallery is available directly at `/photography/`. Stage 2 adds an immersive
lightbox while preserving the approved Stage 1 gallery. The six-link navigation
now includes Photography on Home and all academic pages, with English/Chinese
labels through the existing language preference. It reuses PRISM's approved
academic canvas, theme provider, navigation and footer.
Gallery CSS is isolated in `src/components/photography/photography.module.css`.

## Review locally

```sh
git switch feature/digital-portal-stage1
npm ci
npm run dev
```

Open `http://localhost:3000/photography/`. `predev` prepares image assets first.
`npm run build` also prepares them automatically, then exports the static site to
`out/`; it does not deploy. No network photo service is used during preparation,
builds or gallery browsing. Source/credit links open only when clicked.

## Add, remove, reorder and describe photographs

1. Put a web-ready JPEG, PNG or WebP in `photography/sources/`. Keep RAW/archive
   masters elsewhere. A long edge around 2400px is sufficient for this design.
2. Add a `[[photos]]` entry in `content/photography.toml`:

```toml
[[photos]]
id = "a-unique-stable-id"
src = "my-photo.jpg"
alt = "A useful description of what is visible in the photograph"
title = "Optional title"
description = "Optional caption"
location = "Optional location"
date = "2025"
camera = "Optional camera information"
collection = "Optional collection"
```

Only `id`, `src`, and nonempty `alt` are required. `src` is relative to
`photography/sources/`; nested directories are supported. IDs must be unique,
using lowercase letters/digits separated by hyphens. Dates are display strings;
no date or location is inferred from an image. Collections are stored as metadata
for future organization; the gallery displays the file's order without filtering or
sorting by collection.

3. Move entire photo entries to reorder them. Remove an entry to remove it from
   the gallery. Portrait and landscape proportions are measured automatically;
   no layout coordinates, aspect-ratio numbers or React changes are needed.
4. Run `npm run photos:prepare` after changes and refresh/restart the dev server.
   A normal `npm run build` always regenerates the current collection.

Optional credits use `credit`, `source_url` (HTTPS), and `license`. A placeholder
must set `sample = true` and include all three attribution fields. The placeholder
notice stays visible while any sample remains; replace/remove those entries when
adding your own work. Do not copy their photographer credits onto your images.

## Image preparation

`scripts/prepare-photography.mjs` validates the data and reads oriented source
sizes. It writes responsive JPEG/WebP variants at widths of 640 and 1280px plus
the largest appropriate size, capped at a 2400px long edge, without upscaling.
Images retain natural proportions; EXIF orientation is normalized.

`public/photography/` and `public/.photography-preparing/` are generated and ignored
by Git. Do not put manually managed files there: a successful preparation replaces
the output, removes stale derivatives, and publishes `manifest.json` with actual
widths/heights, metadata and responsive paths. Validation or conversion failures
leave the previous completed output intact. Run one preparation process at a time.

The route reads that manifest on the server. Native `<picture>`/`srcset` selects
WebP or JPEG; explicit image dimensions reserve space, the opening image loads
eagerly, and later photographs lazy-load. No Next.js runtime image optimizer or
new hosting configuration is required.

## Sample ownership and review

The eight photographs are credited Unsplash placeholders, not photographs by the
site owner. See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for every source and photographer.
Titles/alt text are descriptive pilot labels, not asserted original titles.

Actual browser screenshots and verification notes are in
[previews/photography-stage1](../previews/photography-stage1/README.md).
Stage 2 lightbox screenshots and checks are in
[previews/photography-stage2](../previews/photography-stage2/README.md).
Final navigation/export verification is recorded in
[previews/photography-stage3](../previews/photography-stage3/README.md).

## Lightbox controls

Click a photograph, or focus its button and press Enter/Space. Previous/next
buttons and left/right arrow keys move through the collection, wrapping at the
ends. Horizontal touch swipes also navigate; vertical scrolling gestures, short
movements, canceled gestures, and multitouch do not change photographs.

Escape or the Close button exits. The native modal makes the rest of the page
inert, cycles keyboard focus within its controls, locks background scrolling,
and restores the originally activated photograph and scroll position on close.
Long descriptions can be focused and scrolled within the caption area.

The viewer fits the complete image using `object-fit: contain`. It loads the
largest prepared local variant, waits for image decoding, and uses a short opacity
fade. Loading and failure feedback include Retry; navigation and closing remain
available when an image fails. There is no slideshow, zoom effect, or autoplay.

The dialog inherits PRISM's Light/Dark/System palette and responds to live OS
theme changes in System mode. Reduced motion removes the entry and image fades.
Only available metadata is shown; source credits and the placeholder notice stay
in the gallery. No photo data or sample image was changed for Stage 2.

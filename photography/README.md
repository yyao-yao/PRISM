# Photography — Stage 1 foundation

The gallery is available directly at `/photography/`. This pilot intentionally
adds no navigation link, lightbox, image-click behavior, or gallery animation.
It reuses PRISM's approved academic canvas, theme provider, navigation and footer.
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
for future organization; Stage 1 displays the file's order without filtering or
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
The lightbox and navigation integration await separate approval.

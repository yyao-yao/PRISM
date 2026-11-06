# PRISM Home — fixed-name preview

Download `prism-stage1-preview.html` with GitHub's **Download raw file** and open it in a modern browser. The fixed-name particle scene and stars work offline without a server or dependencies.

**The standalone file contains Home only.** Background/title clicks and academic links now go directly to the real `/about/`, `/publications/`, `/teaching/`, `/cv/`, and `/photography/` routes. Those destinations require the full PRISM application; they are not bundled in a single downloaded HTML file. To test complete navigation, run `npm run dev`, or serve the static `out/` build. The preview can also be served beside the built site under `out/previews/`.

## Current navigation

The preview now includes Home, About, Research, Teaching, CV, and Photography.
The full application uses the existing saved English/Chinese preference for both
Home and shared academic navigation. The standalone file remains an English Home
snapshot; academic/gallery pages and the lightbox require the full application.
At narrow widths only the navigation gap is reduced to accommodate the sixth
link. Particle/title geometry, star engines, theme controls, and scene styling
remain unchanged.

## Final behavior

- `/` is permanent Home. Its only particle text is **YAO YAO**.
- The existing mouse-responsive dispersion, watery disturbance edge and smooth restoration are preserved. The approved fixed-name renderer was restored intact; no additional text cache, particle transform, new force, or fade layer remains.
- A valid background click navigates directly to `/about/` with no text transition, door animation, entry control, or waiting period.
- The particle title is a normal About link. Tab to it and press **Enter** to navigate; native modified clicks and opening in a new tab also work.
- Navigation links, theme controls and other interactive elements retain their own behavior and are excluded from background navigation.
- Dragging more than six CSS pixels, text selection, canceled pointer/scroll gestures, and modified background clicks do not accidentally navigate.
- Light/dark/system themes, typography, spacing, grid, star shapes and animations are unchanged. Reduced motion continues to disable particle movement and star motion while navigation remains available.

About remains at `/about/` with the original academic homepage and content-loading logic. Research uses `/publications/`. Teaching, CV, Awards (`/awards/`), Services (`/services/`), shared academic navigation and localized content are unchanged. No content, dependency, deployment, or other route files are modified by this simplification. There is no audio.

## Source and checks

- `ParticleTitle.tsx`: the approved fixed-name sampling and mouse physics only.
- `DigitalEntrance.tsx`: static Home composition and a semantic title link; no text state.
- `homeInteraction.ts`: guarded background navigation and drag rejection for the native title link.
- `entrance.module.css`: existing scene styles plus a keyboard focus indicator for the title link.
- `sync-home-preview.mjs`: derives the review HTML from the actual markup, renderer, star helper, gesture binding and CSS.
- `check-home.mjs`: deterministic fixed-name physics/restoration and navigation-guard tests.

Run from the repository root:

```sh
npm ci
node previews/check-home.mjs
node previews/sync-home-preview.mjs
npm run build
```

The renderer and mouse physics match the approved pre-transformation fixed-name version byte for byte. The star helper, star markup, academic pages, content, route configuration, Home click behavior and dependency/deployment settings are unchanged by the navigation integration. The generated preview uses the same renderer and guard logic as the React implementation.

## Verification

The production static build, lint/type checks, deterministic physics/input tests, preview syntax and source-preservation checks pass.

Chromium checks passed against both the built PRISM app and standalone preview: fixed-name rendering, mouse dispersion and restoration, direct background/title navigation to the original About page, keyboard Enter and browser Back, native Control-click opening About in a new tab, ordinary primary navigation, theme-control isolation, light/dark/system changes, reduced-motion accessibility, live star animations, other-control exclusion, nav whitespace, drag-out-and-back rejection, text selection and modified-background guards. All direct academic routes succeeded. Touch background/title activation, canceled scroll gestures and orientation/resize behavior also passed, with zero browser script errors.

A desktop, mobile and short-window comparison against the previous preview confirmed unchanged canvas, surrounding text and all ten symbol positions. The shared star helper and approved fixed-name renderer are byte-for-byte preserved. The preview is reproducibly generated from those same sources.

Safari/Firefox, physical mobile devices and a real screen-reader session were not tested. The standalone HTML does not bundle academic pages; About navigation requires the full application. No merge or deployment is included.

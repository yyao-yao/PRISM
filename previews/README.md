# Stage 1.1 digital portal preview

Download `prism-stage1-preview.html` with GitHub's **Download raw file** button, then open the saved file in a modern browser. No dependencies or local server are required. Alternatively, download this branch as a ZIP and open the HTML inside `previews/`.

This is a standalone visual review artifact, separate from the Next.js application. It uses the entrance CSS and extracted particle engine, with plain JavaScript controls replacing the React integration. The academic homepage is not included in this preview.

- Switch between light, dark, and system themes.
- Sweep the mouse through the lettering slowly, then quickly: faster strokes create stronger, controlled directional flow.
- Pause over a letter: the short wake fades and particles restore even while the pointer remains there.
- Try quick passes across the title: the field covers the segment between events, not only the event endpoints.
- Touch devices display the particle title without mouse interaction.
- Reduced-motion preferences disable particle movement and floating decorations.
- `initiate_entry()` opens a review screen; Replay returns to the portal.

In the actual PRISM integration, entry reveals the existing homepage immediately. The two-panel door animation is reserved for Stage 2. Audio has not been implemented.

## Stage 1.1 interaction

The pointer now creates a short-lived stream along each sampled motion segment. Smoothed velocity controls a saturating force; directional advection leads, with a small tangential curl and outward slip. A spatially varied Gaussian falloff softens the field edges. The wake expires within 240 ms and duplicate stationary events add no force, avoiding persistent circular holes. A damped spring gradually restores the letter positions, stiffening gently with displacement to keep the typography recognizable.

Coalesced pointer samples are used when available. Swept-segment evaluation covers gaps during fast motion; history is capped at 12 segments and eight coalesced samples per event. The field is evaluated once on a coarse shared grid and smoothly interpolated for each particle, reducing repeated force calculations. Frame substeps stabilize spring integration at different refresh rates. Animation stops repainting once the letters are calm and resumes on movement. Touch, reduced-motion, visibility changes, resizing, and listener cleanup remain handled.

The preview effect is generated directly from the React effect by stripping TypeScript; it contains the same motion equations. The existing typography sampling, layout, palettes, grid, and decorative styling are preserved.

## Quiet interface markers

Six small, outlined blue SVG symbols sit in the whitespace: a four-point star, diamond, cross, triangle, flower-like mark, and six-point signal. Each has its own negative phase offset, an irregular opacity sequence over 13.7–21.7 seconds, and a separate slow drift clock. Drift stays within a few pixels, scale varies from 0.96 to 1.03, and rotation stays between -4 and 5 degrees. There is no continuous spin or synchronized blinking.

Narrow screens show four symbols; short desktop windows hide the lower pair. The symbols are non-interactive and hidden from assistive technology. Reduced motion makes all six static at a faint opacity. Both the React portal and standalone preview use the same SVGs and scoped styles.

## Source changes

- `src/app/layout.tsx`: adds the entrance boundary inside the existing providers and makes the main element focusable after entry.
- `src/components/entrance/EntranceBoundary.tsx`: homepage eligibility, per-tab session state, background interaction, and focus restoration.
- `src/components/entrance/DigitalEntrance.tsx`: portal composition, theme controls, entry control, keyboard behavior, and six decorative SVG markers.
- `src/components/entrance/ParticleTitle.tsx`: canvas particle sampling, velocity-aware swept flow, restoration, resizing, reduced motion, and cleanup.
- `src/components/entrance/entrance.module.css`: scoped portal styles, both palettes, grid, decorations, responsive layouts, and independent marker twinkling.

Existing content, academic page renderers, navigation, and deployment configuration are unchanged.

## Validation status

Stage 1.1 checks: whitespace/diff and standalone JavaScript syntax; exact preview-engine synchronization; preserved existing preview markup and styles; matching six-symbol decoration markup and styles; fast versus slow strokes; sparse swept-path coverage; directional flow and curl; stationary settling and duplicate-event rejection; coalesced events; bounded sustained movement; 30/60/120 Hz settling; narrow canvas; reduced-motion, touch, visibility and resize handling; listener cleanup; idle repaint suspension. These checks exercise the actual extracted effect using simulated and native canvas contexts, not a browser. Native canvas timing is not a browser performance guarantee.

Not verified: browser rendering and the Next.js build. The supported browser tool was unavailable. Dependency installation was blocked by the execution environment's configured proxy; `npm run build` could not find Next.js. These checks remain pending.

This branch is for review. No deployment or merge is included.

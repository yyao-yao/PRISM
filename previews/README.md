# Stage 1 digital portal preview

Download `prism-stage1-preview.html` with GitHub's **Download raw file** button, then open the saved file in a modern browser. No dependencies or local server are required. Alternatively, download this branch as a ZIP and open the HTML inside `previews/`.

This is a standalone visual review artifact, separate from the Next.js application. It uses the entrance CSS and extracted particle engine, with plain JavaScript controls replacing the React integration. The academic homepage is not included in this preview.

- Switch between light, dark, and system themes.
- Move the mouse near the lettering to disperse particles, then move away to let them settle.
- Touch devices display the particle title without mouse interaction.
- Reduced-motion preferences disable particle movement and floating decorations.
- `initiate_entry()` opens a review screen; Replay returns to the portal.

In the actual PRISM integration, entry reveals the existing homepage immediately. The two-panel door animation is reserved for Stage 2. Audio has not been implemented.

## Source changes

- `src/app/layout.tsx`: adds the entrance boundary inside the existing providers and makes the main element focusable after entry.
- `src/components/entrance/EntranceBoundary.tsx`: homepage eligibility, per-tab session state, background interaction, and focus restoration.
- `src/components/entrance/DigitalEntrance.tsx`: portal composition, theme controls, entry control, and keyboard behavior.
- `src/components/entrance/ParticleTitle.tsx`: canvas particle sampling, pointer repulsion, restoration, resizing, reduced motion, and cleanup.
- `src/components/entrance/entrance.module.css`: scoped portal styles, both palettes, grid, decorations, and responsive layouts.

Existing content, academic page renderers, navigation, and deployment configuration are unchanged.

## Validation status

Passed: whitespace/diff checks, standalone JavaScript syntax check, and simulated-canvas checks exercising particle generation, pointer repulsion, restoration, reduced-motion reset, and listener cleanup.

Not verified: browser rendering and the Next.js build. The supported browser tool was unavailable. Dependency installation was blocked by the execution environment's configured proxy; `npm run build` could not find Next.js. These checks remain pending.

This branch is for review. No deployment or merge is included.

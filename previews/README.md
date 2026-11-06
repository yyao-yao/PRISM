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

## Particle refinement: the earlier scatter with a watery edge

The particle appearance and independent outward response use the original Stage 1 drawing, text sampling, spring stiffness (0.013), and return damping (0.88). The earlier quadratic repulsion remains the main force. Beyond the normal displacement range, the spring strengthens smoothly to protect text readability during long, slow strokes. There is no shared group-advection field.

Only the disturbance edge is refined: its falloff stretches slightly behind movement, a faint tail feathers the perimeter, and a tiny amount of edge-local drag/shear suggests a fingertip brushing water. Slow strokes have a modestly larger radius and force gain, and a longer fade. Fast strokes are controlled rather than amplified. Pausing fades the interaction completely so it cannot hold open a persistent hole.

A brief, bounded swept path covers gaps between pointer events. Coalesced samples are used when available; at most four short segments remain for 100 ms. The pointer's local disturbance fades over 260–580 ms, depending on speed. The original return spring continues settling particles after the force fades. Frame substeps stabilize the response across refresh rates, and painting stops once the title is calm. Touch, reduced motion, visibility changes, resizing, and cleanup remain handled.

The standalone preview's motion engine is extracted directly from the React effect, with TypeScript removed. Typography, color, layout, grid, and the existing portal controls remain unchanged.

## Ten delicate interface markers

Ten small blue outline symbols (8–13 px) include four-point stars, sparkles, diamonds, crosses, triangles, tiny hearts, and a flower-like shape. Their placement is asymmetric around the title and in surrounding whitespace, including narrow layouts.

`animateSignals.ts` drives real Web Animations in both React and the standalone HTML. Every 11–23-second brightness cycle picks new timing offsets, intensity, and duration independently, so the twinkle does not repeat a fixed synchronized pattern. Only two star shapes may briefly glint more brightly, with a soft three-pixel glow. Separate 21–35-second CSS clocks add tiny positional drift, 0.96–1.03 scaling, and gentle -4 to 5 degree rotation. The same blue theme token supplies the light/dark color.

The symbols are non-interactive and hidden from assistive technology. Reduced motion cancels their brightness animations and disables drift, leaving static faint markers. Brightness animations also pause while the document is hidden, restart when visible, and are canceled on entry/replay teardown. Browsers without Web Animations retain static markers.

## Source changes

- `src/app/layout.tsx`: adds the entrance boundary inside the existing providers and makes the main element focusable after entry.
- `src/components/entrance/EntranceBoundary.tsx`: homepage eligibility, per-tab session state, background interaction, and focus restoration.
- `src/components/entrance/DigitalEntrance.tsx`: portal composition, theme controls, entry control, keyboard behavior, and ten decorative SVG markers.
- `src/components/entrance/ParticleTitle.tsx`: canvas particle sampling, original-style independent scattering with a softly trailing edge, restoration, resizing, reduced motion, and cleanup.
- `src/components/entrance/animateSignals.ts`: independently varied brightness cycles, occasional star glints, and motion/visibility lifecycle.
- `src/components/entrance/entrance.module.css`: scoped portal styles, both palettes, grid, decorations, responsive layouts, and slow marker drift.

Existing content, academic page renderers, navigation, and deployment configuration are unchanged.

## Validation status

Checks exercise the actual extracted engine: original draw/sampling/spring preservation; independent outward scattering; slower versus faster strokes; trailing-edge asymmetry; sparse swept-path coverage; stationary settling; coalesced input; bounded history; reduced motion, touch, visibility and resize handling; cleanup; narrow canvases; and settling at 30/60/120 Hz. Tests use simulated and native canvas contexts, not browser rendering.

The brightness-animation tests verify ten live animations with distinct timing, changing subsequent cycles, at most two glinting stars, smooth ordered keyframes, reduced-motion/visibility cancellation, restart, and cleanup. The standalone script passes JavaScript syntax checks; both particle and symbol engines match the React source.

Not verified: browser rendering and the Next.js build. The supported browser tool was unavailable. Dependency installation was blocked by the execution environment's configured proxy; `npm run build` could not find Next.js. These checks remain pending.

This branch is for review. No deployment or merge is included.

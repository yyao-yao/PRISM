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

`animateSignals.ts` drives independent native Web Animations in both React and the standalone HTML. Breathing cycles vary independently over **2.5–4.5 seconds**, with newly sampled duration, phase and scale peaks each cycle. Scale varies approximately **0.93–1.10**, with tiny position changes and subtle opacity modulation. Individual SVG scale/translate compose with the existing CSS drift; breathing opacity is separate from the wrapper's twinkle/glow.

Each symbol schedules its own next twinkle with a fresh **1.5–5-second waiting time**, independently of breathing. Every event randomizes fade-in (**0.2–0.5 s**), peak hold (**0.1–0.3 s**), fade-out (**0.5–1 s**), peak intensity, and glow. There is no synchronized animation loop or repeating twinkle CSS sequence. A small percentage of events get a quieter follow-up after a **1.5–2-second** pause; a follow-up cannot chain into another follow-up.

Only the two existing star-shaped glint candidates can receive the occasional brighter **3.5–5 px** soft halo. Other events use smaller randomized halos. All twinkles start and end at the original **0.3 wrapper opacity**, clear their glow, and leave an idle interval before the next event. Breathing also includes resting plateaus at scale 1 and zero added translation. There is no persistent brightness boost in light mode. The existing shapes, positions, colors, theme behavior, CSS drift, and particle engine are unchanged.

The symbols remain non-interactive and hidden from assistive technology. Reduced motion or a hidden document clears pending timers and cancels native animations; the existing CSS drift is paused too. Returning restores the prior CSS play state and starts fresh independent schedules. Entry/unmount cancels everything, and Replay initializes fresh schedules. Generation guards prevent stale callbacks from restarting animation after teardown. Browsers without Web Animations retain static markers.

## Source changes

- `src/app/layout.tsx`: adds the entrance boundary inside the existing providers and makes the main element focusable after entry.
- `src/components/entrance/EntranceBoundary.tsx`: homepage eligibility, per-tab session state, background interaction, and focus restoration.
- `src/components/entrance/DigitalEntrance.tsx`: portal composition, theme controls, entry control, keyboard behavior, and ten decorative SVG markers.
- `src/components/entrance/ParticleTitle.tsx`: canvas particle sampling, original-style independent scattering with a softly trailing edge, restoration, resizing, reduced motion, and cleanup.
- `src/components/entrance/animateSignals.ts`: independent continuous breathing, timer-scheduled stochastic twinkles, occasional glints, and full timer/animation/drift cleanup.
- `src/components/entrance/entrance.module.css`: scoped portal styles, both palettes, grid, decorations, responsive layouts, and slow marker drift.

Existing content, academic page renderers, navigation, and deployment configuration are unchanged.

## Validation status

Checks exercise the actual extracted engine: original draw/sampling/spring preservation; independent outward scattering; slower versus faster strokes; trailing-edge asymmetry; sparse swept-path coverage; stationary settling; coalesced input; bounded history; reduced motion, touch, visibility and resize handling; cleanup; narrow canvases; and settling at 30/60/120 Hz. Tests use simulated and native canvas contexts, not browser rendering.

The current standalone preview was tested in actual headless Chromium using a temporary loopback-only server (not deployed). Instrumentation confirmed that `animateSignals()` is called, starts ten native breathing animations and ten independent waits, and is not suppressed by CSS. At startup, reduced motion was off, the document was visible, and all ten wrappers had baseline opacity 0.3.

Nine seconds of computed-style sampling in each theme verified perceptible scale excursions, visible twinkle peaks, return to baseline opacity and unscaled resting states, the unchanged light/dark colors, and running CSS drift alongside Web Animations. The first sampled visible twinkle appeared approximately 2.2 seconds after startup. Recorded native events and timers matched the requested wait, fade-in, hold and fade-out ranges, with distinct randomized timings. Theme switching retained the live breathing animations. Entry/Replay, mobile, and real browser reduced-motion emulation also passed, with zero browser script errors.

Visibility cleanup was tested in the real browser with a **simulated hidden getter** (headless tabs do not reliably become hidden): dispatching the visibility event cleared pending waits, canceled breathing/twinkles, paused CSS drift, and subsequently resumed correctly. This tests the visibility handler, not a physical browser-tab background transition.

Deterministic scheduler tests additionally cover parameter boundaries, the brighter-glint branch, the smaller paired event and its non-chaining rule, restoration of existing CSS play-state priority, and stale callback cancellation. JavaScript syntax and preview/source parity checks pass. Only the shared symbol helper, its exact embedded preview copy, and these review notes changed.

The Next.js build remains unverified. Dependency installation was previously blocked by the execution environment's configured proxy; Next.js was not installed. No particle, layout, navigation, academic page, or content code was changed in this symbol-animation revision.

This branch is for review. No deployment or merge is included.

# Interactive PRISM Home — local review

Download `prism-stage1-preview.html` using GitHub's **Download raw file**, then open it in a modern browser. The Home interaction requires no server, dependencies, external fonts, or network access.

The HTML is a standalone Home preview, not a copy of all academic pages. Its academic navigation links target the real PRISM routes and require the running/built application. Its Home link resets the greeting locally. To review all navigation, run the repository with `npm run dev`, or serve the static `out/` build.

## Routes

| Navigation | Route |
| --- | --- |
| Home | `/` |
| About | `/about/` |
| Research | `/publications/` |
| Teaching | `/teaching/` |
| CV | `/cv/` |

The previous academic homepage's content-loading logic and renderer now live at `/about`. Publications, Teaching, CV, Awards (`/awards/`), Services (`/services/`), all content files, and localized example content are preserved. Navigation uses ordinary links. There is no entry gate, session-based eligibility, hidden academic homepage underneath Home, automatic About redirect, modal focus trap, or door animation.

## Home interaction

- Click the background or particle title to alternate between **YAO YAO** and **Nice to meet you.** while staying on Home.
- Each change takes about **1.3 seconds**: a small loosening, individually curved travel, and gradual gathering/settling. Repeated clicks retarget the current cloud without snapping.
- Both phrases use the approved font and sampling density. A reusable pool handles different point counts with gradual fades. Surplus particles are invisible at rest, so the new phrase is not overpopulated.
- The morph transports reference positions separately from the existing mouse offsets and velocity. The approved mouse-force equations and pointer tracking are unchanged and continue to work on both phrases.
- Navigation, theme controls, and other interactive regions are excluded from background toggling. A gesture moving more than six CSS pixels, canceled touch gestures, or text selection cannot accidentally toggle the text.
- The unchanged-looking title has a native keyboard button: Tab to it, then press **Enter** or **Space**. A keyboard focus ring and screen-reader help/status are provided.
- Reduced motion changes phrases immediately. Returning to Home, selecting Home again, or restoring Home from browser page cache resets the greeting to **YAO YAO**.
- The visible entry button is removed; a non-interactive spacer preserves the composition's vertical spacing.

The approved grid, scene copy, star shapes/positions/colors, and complete `animateSignals.ts` helper are unchanged. The same independent breathing and stochastic twinkling run in both themes. There is no audio.

## Source and reproducibility

- `src/app/page.tsx`: the actual particle Home route.
- `src/app/about/page.tsx`: original academic homepage loading/rendering logic.
- `src/app/layout.tsx` and `EntranceBoundary.tsx`: route-aware academic chrome; Home is normal page content.
- `src/lib/navigation.ts` and `Navigation.tsx`: the shared five destinations and academic navigation.
- `DigitalEntrance.tsx` and `homeInteraction.ts`: Home composition, local greeting state, keyboard target, and guarded gesture binding.
- `ParticleTitle.tsx`: cached masks and the separate reference-position morph.
- `entrance.module.css`: additive navigation, title-button and spacer styles only; approved scene/star rules remain intact.

Run from the repository root:

```sh
npm ci
node previews/check-home.mjs
node previews/sync-home-preview.mjs
npm run build
```

The generator derives the standalone markup, CSS, particle engine, star helper, gesture handling and navigation from the actual sources. It introduces no runtime dependencies and is safe to rerun. The deterministic tests exercise the real extracted canvas effect: unequal counts and opacity fades, non-linear paths, 1.3-second completion, exact original point appearance after return, rapid retargeting, instant reset, reduced motion, visibility/resize recovery, and cleanup during a transition.

## Verification

The Next.js production build, its lint/type checks, deterministic morph tests, and source-preservation checks pass. The static build includes the new About route and every previous academic route. The mouse-force kernel, pointer tracking, star helper, content files, academic renderers and deployment configuration are unchanged.

Chromium checks passed against both the production static PRISM app and the standalone HTML: background/title toggles stay on Home; transformations completed in approximately 1.31 seconds; repeated toggles return the exact original point count and particle radii; native Enter/Space activation works; drag-out-and-back, text selection and canceled touch gestures are excluded correctly; rapid retargeting does not snap; Home resets immediately; theme controls and light/dark/system changes do not trigger text transformations; the original mouse dispersion works on both phrases; reduced motion switches instantly and preserves the existing static-star behavior. Mobile viewport, touch taps and orientation/resize recovery also passed without browser script errors.

Actual application navigation was verified for About, Research, Teaching and CV, plus browser Back returning to default Home. Direct requests to About, Publications, Teaching, CV, Awards and Services all succeeded. Old session entry flags and `/#about` do not gate Home or automatically navigate to About.

A desktop/mobile/short-window comparison against the approved preview verified unchanged canvas, description, hint and all ten symbol positions. Visual review also checked the reforming text and mobile navigation. Safari/Firefox, physical mobile devices and a real screen-reader session were not tested. No merge or deployment is part of this work.

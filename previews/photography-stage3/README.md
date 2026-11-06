# Photography — Stage 3 integration and final verification

The primary navigation is now **Home · About · Research · Teaching · CV ·
Photography**, with the existing Chinese labels plus **摄影**. Both the custom
Home header and shared academic header use `getPrimaryNavigation(locale)`.
Photography is accessible at `/photography/` from every academic page and Home.
No deployment or merge was performed.

## Scope of the integration

- `src/lib/navigation.ts`: append the Photography destination and Chinese label.
- `src/components/entrance/DigitalEntrance.tsx`: use the existing locale preference
  for Home's shared link labels. Particle/star/click bindings remain intact.
- `src/components/entrance/entrance.module.css`: only the Home navigation gap can
  contract below 360px, keeping all six links on one line without reducing type.
  At 320px the gap is 10px; at 360px and wider the approved 20px mobile gap remains.
- `previews/sync-home-preview.mjs` and `previews/prism-stage1-preview.html`: keep
  the existing English standalone Home snapshot synchronized with six links and
  the same responsive gap. Its particle/star/input engines are unchanged.
- Update the Home-preview and Photography instructions and this verification log.

No academic content, gallery/lightbox component or style, photo input, image
preparation workflow, theme/locale provider, package/dependency, export setting,
or deployment workflow was modified.

## Checks performed

- `npm ci --ignore-scripts --no-audit --no-fund`, `npm run build`, explicit
  `npx tsc --noEmit`, `node previews/check-home.mjs`, and `git diff --check`.
- Desktop: all six destinations in order from Home; shared navigation on About,
  Research, Teaching, CV, Photography, Awards and Services; exact hrefs, active
  states, and direct access to Photography in English and Chinese.
- Mobile: real touch taps at 320/390px in both languages, all six destinations,
  correct active states and normal menu closure. The existing menu entrance/exit
  animations are retained; bounds are checked after they settle.
- Home and academic navigation across 320, 360, 390, 640, 700, 701, 768, 1023,
  1024, 1100, 1101, 1280, 1440 and 1920px, plus 844 × 390 landscape: no settled
  overlap or horizontal overflow.
- Actual English/Chinese switching, persisted labels on Home, Chinese Photography
  active state, and return to English. Existing page content is preserved.
- Light/Dark/System persists across all six destinations, including live OS theme
  changes, and the Photography active underline works.
- Eight gallery images, four natural portrait proportions, responsive geometry
  at 320–1920px, all 48 local JPEG/WebP variants, ordered content and no cropping.
- Lightbox mouse/buttons, Enter/Space, arrows/Escape, Tab/Shift+Tab, original opener
  focus, scroll/style restoration, repeated opening/closing, wrapping, rapid
  navigation, viewport changes and reduced motion.
- Real Chromium touch swipes, short/vertical/canceled/multitouch rejection, mobile
  controls and close. Native browser pinch zoom is retained; the automation
  viewport is reset after pinch checks before subsequent button taps.
- Local large-image loading, failure/Retry recovery, keyboard focus after Retry,
  and navigation during a delayed image request.
- Home particle dispersion/restoration, running star breaths, theme-control
  exclusion and keyboard navigation. Deterministic physics/input checks pass.
- The standalone Home preview's sixth link reaches the actual Photography route
  when served beside the static export.

## Visual preservation

Compared with approved Stage 2 (`0b071f1`), exact screenshot pixels and geometry
match outside navigation on Home and all seven existing non-Home routes at
1440 × 1000 and 390 × 844, in Light and Dark modes. Only changed navigation links
are hidden for comparison; the stochastic Home canvas is hidden for pixel
comparison and checked separately through geometry, unchanged source and physics
checks. Header brand/theme controls, body content, grids and decorations remain.
The entire lightbox screenshot also matches Stage 2 exactly in all four views.

The gallery/lightbox and academic renderer/content files are byte-for-byte
unchanged. Home's only scene-style edit is the narrow navigation gap described
above. No browser script errors were observed.

## Static export and limits

The production export contains all eight page entry files, including
`out/photography/index.html`, and all 48 referenced photo derivatives. A temporary
loopback server verifies direct links and assets from `out/`, without a Next.js
server or image optimizer. This matches the repository's existing root-relative
URLs, `output: 'export'`, trailing slashes and unoptimized-image configuration.
The manually triggered GitHub Pages workflow remains unchanged and was not run.

Chromium desktop/mobile emulation was tested. Safari, Firefox, physical devices,
a real screen-reader session and a live GitHub Pages deployment were not tested.
No blocking issue was found. Existing dependency peer/deprecation notices remain;
the production build and type checks complete successfully.

The gallery and lightbox screenshots remain in the Stage 1/2 review folders.
Publishing or merging awaits the user's final approval.

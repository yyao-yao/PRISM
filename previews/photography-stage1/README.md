# Photography — gallery foundation review

Actual Chromium screenshots of `/photography/` from the production static export.
Desktop viewport: 1440 × 1100. Mobile viewport: 390 × 844. Each capture includes
the full page after scrolling to load and decode all eight lazy-loaded photos.
These JPEG screenshots show the real rendered site; nothing was deployed.

| View | Light | Dark |
| --- | --- | --- |
| Desktop | [Screenshot](photography-light-desktop.jpg) | [Screenshot](photography-dark-desktop.jpg) |
| Mobile | [Screenshot](photography-light-mobile.jpg) | [Screenshot](photography-dark-mobile.jpg) |

Stage 1 includes the route, TOML data, proportional image preparation, scoped
editorial gallery and sample credits. There is no lightbox or Photography nav
link. Existing navigation, approved page styling, and Home animation code remain
unchanged.

See [photography/README.md](../../photography/README.md) to run the page locally
and add/reorder images, and [ATTRIBUTIONS.md](../../photography/ATTRIBUTIONS.md)
for the sample photographs' sources and licensing.

Verification covers production build/lint/type validation, explicit TypeScript,
image-preparation fixtures (orientation, natural ratios, no upscaling, reordering,
removal, invalid inputs, empty collection), static asset delivery, real image
rendering at 320–1920px, Light/Dark/System, keyboard focus, reduced motion, mobile
navigation and image order. Chromium comparisons check the prior Home DOM and
exact screenshots of all six existing academic routes in Light/Dark at desktop
and mobile widths. Home particles, star breathing and keyboard navigation receive
a separate smoke check. No browser script errors were observed.

Browser verification uses Chromium. Safari, Firefox and physical-device
performance were not tested. Lightbox gestures and controls are out of scope.

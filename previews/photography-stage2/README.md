# Photography — Stage 2 lightbox review

Actual Chromium screenshots of the production static export, after local images
finished decoding and short fades completed. Desktop viewport: 1440 × 1000;
mobile viewport: 390 × 844. Desktop shows the opening landscape; mobile shows the
second, portrait photograph. Nothing was deployed.

| View | Light | Dark |
| --- | --- | --- |
| Desktop | [Screenshot](lightbox-light-desktop.jpg) | [Screenshot](lightbox-dark-desktop.jpg) |
| Mobile | [Screenshot](lightbox-light-mobile.jpg) | [Screenshot](lightbox-dark-mobile.jpg) |

The approved gallery remains unchanged in its closed state. Images now use
visually unstyled buttons to open a native modal dialog. The viewer contains the
complete photograph, previous/next controls, a quiet counter, available metadata,
and a close control. Keyboard arrows and touch swipes navigate, including wrapping
at the ends. Escape closes; Enter/Space opens a photograph from the gallery.
Focus and the original scroll position return to the original photograph.

No navigation link, Line Rabbit, new content, new source image, deployment change,
or changes to Home/About/Research/Teaching/CV are included.

## Local review

```sh
git switch feature/digital-portal-stage1
npm ci
npm run dev
```

Open `http://localhost:3000/photography/`, then click or keyboard-activate a photo.
See [photography/README.md](../../photography/README.md) for editing photographs.

## Verification

- Production build/static export, lint/type validation, explicit TypeScript and
  `git diff --check`.
- Real Chromium desktop keyboard/buttons, Enter/Space, arrow keys, Escape,
  explicit Tab/Shift+Tab cycle, inert background, exact scroll/style cleanup,
  original opener focus, repeated open/close, wrapping and rapid navigation.
- Mobile Chromium touch events: left/right swipes, vertical/short/canceled and
  multitouch gestures ignored, buttons and close. Native browser pinch zoom is
  retained; the automation viewport is reset after pinch testing before taps.
- Light/Dark/System through the existing theme control; live OS color-scheme
  changes while open; reduced-motion entry and image changes; landscape resize.
- Largest local image variants, decode-before-fade, loading feedback, simulated
  network failure/Retry recovery, retained keyboard focus after Retry, and
  navigation during a delayed request.
- Optional metadata/absent fields/single-photo button states verified against the
  actual viewer component's server-rendered markup using an isolated fixture.
- Closed gallery: exact geometry, typography, image proportions and PNG screenshot
  pixels match Stage 1 at desktop/mobile widths in both themes.
- Home rendered DOM and exact screenshots of all six academic routes match the
  preceding build at desktop/mobile widths in both themes. Home particle
  dispersion/restoration, running star breaths and keyboard navigation also pass.
- No browser script errors observed.

Verification used Chromium, not Safari/Firefox or physical mobile hardware.
Stage 3 and final navigation integration await separate review and approval.

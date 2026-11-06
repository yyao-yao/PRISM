# About — Quiet Digital pilot

This folder contains real Chromium screenshots of the production static export.
It is a review record, not a deployed site or a replacement for PRISM's renderer.

| View | Light | Dark |
| --- | --- | --- |
| Desktop, 1440px wide | [Screenshot](about-light-desktop.png) | [Screenshot](about-dark-desktop.png) |
| Mobile, 390px wide | [Screenshot](about-light-mobile.png) | [Screenshot](about-dark-mobile.png) |

The design is scoped to `/about/` through `src/styles/academic.module.css` and
`EntranceBoundary`. Home, Research, Teaching, CV, Awards, and Services keep their
existing appearance. The profile, biography, publications, news, and their content
loading/order are retained. No content files or global styles were changed.

To review interactively on your computer:

```sh
git switch feature/digital-portal-stage1
npm ci
npm run dev
```

Open `http://localhost:3000/about/`. The existing standalone Home preview remains
unchanged; these screenshots show the actual PRISM About page.

Validation: production build (including lint/type validation), explicit
`npx tsc --noEmit`, desktop/mobile Chromium, responsive widths 320–1920px,
Light/Dark/System and live system preference changes, English/Chinese switching,
contact keyboard pin/unpin and mail/map destinations, Like/unlike persistence,
primary navigation, mobile menu, reduced-motion handling, and comparison against
the preceding build on routes outside About. External mail/map/social services
were not opened; their original destinations were checked.

# Quiet Digital — Research, Teaching, and CV review

Actual desktop Chromium screenshots of the production static export, captured
at a 1440 × 1100 viewport with the entire page included. Nothing was deployed.

| Page | Light | Dark |
| --- | --- | --- |
| Research (`/publications/`) | [Screenshot](research-light-desktop.png) | [Screenshot](research-dark-desktop.png) |
| Teaching (`/teaching/`) | [Screenshot](teaching-light-desktop.png) | [Screenshot](teaching-dark-desktop.png) |
| CV (`/cv/`) | [Screenshot](cv-light-desktop.png) | [Screenshot](cv-dark-desktop.png) |

## Implementation

- `src/styles/academic.module.css`: extend the approved About palette, grid,
  typography, spacing, fine rules, and open editorial treatments to these routes.
- `src/components/entrance/EntranceBoundary.tsx`: explicitly opt the three routes
  into the existing academic scope and shared navigation/footer styling.
- `src/components/pages/DynamicPageClient.tsx`: opt the existing renderers into
  editorial presentation; keep their content-loading and locale logic intact.
- `src/components/publications/PublicationsList.tsx`: presentation hooks,
  accessible search/filter/panel states, static row entrances, and reduced-motion
  expansion timing. Existing filtering, links, abstracts, BibTeX, and copying stay.
- `src/components/pages/CardPage.tsx`: open Teaching entries retaining all fields,
  Markdown, item order, dates, and tags. Unapproved routes keep their prior styles.
- `src/components/pages/TextPage.tsx`: preserve CV Markdown and information order,
  with a readable text column. No new date parser or timeline.

No content, global CSS, route files, Home renderer, particle physics, or star
animation files were modified. The approved About page remains visually unchanged.

## Verification

- `npm run build` (production static export, lint and type validation).
- `npx tsc --noEmit` and `git diff --check`.
- Real Chromium checks at 320, 390, 768, 1024, and 1440px; English/Chinese;
  Light/Dark/System, including live OS preference changes; primary and mobile nav.
- Research search/empty results/reset, independent year/type filters, keyboard
  Abstract/BibTeX toggles and contents, native clipboard readback, original links,
  visible focus, reduced motion, and mobile BibTeX wrapping.
- Compare text, links, images, headings, lists, emphasis, and publication formatting
  against the preceding build on all three changed pages.
- Compare the Home rendered DOM and exact screenshots of About/Awards/Services
  in Light/Dark at desktop/mobile widths against the approved preceding build.
- Home smoke check: particle dispersion/restoration, ten running star breaths,
  theme-control exclusion, and Enter-to-About navigation.

Browser verification uses Chromium; Firefox, Safari, physical-device performance,
and external DOI/code/mail services were not exercised. Original external link
destinations were checked without opening those services.

## Review locally

```sh
git switch feature/digital-portal-stage1
npm ci
npm run dev
```

Open `http://localhost:3000/publications/`, `/teaching/`, or `/cv/`.
The standalone Home preview remains unchanged.

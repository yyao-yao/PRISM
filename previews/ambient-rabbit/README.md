# Ambient Line Rabbit — first motion review

Approved website baseline: `0ac12e97d09ca14afcb3b2f79d6ad485531395dd`.

## Play the preview

For a convenient download, use **[prism-ambient-rabbit-preview.zip](prism-ambient-rabbit-preview.zip)**, extract it, and open the enclosed HTML.

Download **[prism-ambient-rabbit-preview.html](prism-ambient-rabbit-preview.html)** using GitHub's **Download raw file** control, then open the downloaded HTML in a modern browser. It is self-contained: no installation, server, external assets, or deployment is required.

This is a standalone review copy of the actual exported English About layout, with the same `ambientRabbit.mjs` runtime embedded verbatim (only the module export keyword is removed). It is separate from the Next.js implementation. The small “Standalone motion review” panel belongs only to this offline file. It offers Light/Dark/System selection, a shortcut to the activity area, and restart of the normal visibility delay. The original theme button also cycles themes. Close the panel while watching the visitor. Navigation, locale changes, contact controls and Like are not live in this static review copy; they retain their original behavior in PRISM.

Scroll until the visit area is visible, then wait **5–12 seconds**. On mobile, use “Find visit area” or scroll to News/Footer. Automatic visits are disabled if the browser requests reduced motion.

## Implemented sequence

Peek → two shallow entering hops → gradual turn → back-facing seated pause → gradual turn → two departing hops → absent.

The visitor remains seated for 7–12 seconds. Later visits wait 55–100 seconds of eligible visible time. These are independently chosen waits, not a fixed animation loop. Waiting and movement pause offscreen or when the document is hidden. Resting/absent states use a cancelable timeout, with no animation-frame loop.

The contour rig follows the supplied rabbit reference: long delicate ears, open neck, rounded seated haunches and a small round tail. Matching cubic paths interpolate continuously through the required side/back turn; there are no abrupt bitmap swaps or pose crossfades. The earlier transparent back-view artwork is retained in `public/illustrations/rabbit-sit-back.png` as an authoring reference. The runtime does not load a sprite sheet.

## Placement

The About-only region is absolutely positioned, transparent, clipped and non-interactive. It reserves no flow space. Desktop uses measured whitespace below Profile, with 40px clearance. Mobile uses only the existing bottom padding after News and before Footer; because that gap is 64px, the mobile visitor is approximately 50px tall. No blank row, scene, platform, label, or extra spacing is added. If the safe area is too small, visits are suppressed. A responsive width change restarts the visibility delay instead of moving a visible rabbit across the page.

## Actual browser screenshots

- [Desktop / Light](about-visit-light-desktop.jpg)
- [Desktop / Dark](about-visit-dark-desktop.jpg)
- [Mobile / Light](about-visit-light-mobile.jpg)
- [Mobile / Dark](about-visit-dark-mobile.jpg)

Desktop captures are full-page at 1440px. Mobile captures are 390 × 844 viewport views scrolled to the visit area.

## Verification

- Production Next.js build, static export, lint/type validation, explicit `tsc --noEmit`, syntax and whitespace checks passed.
- Existing Home deterministic checks passed: fixed title, mouse dispersion/restoration, reduced motion, visibility/resize/cleanup, click-to-About and keyboard/drag guards.
- Chromium completed the entire visit sequence in desktop/mobile Light/Dark. Observed first waits were approximately 5.9, 7.4, 9.8 and 10.1 seconds after visibility. Each visit produced no overlap, no Layout Shift entries, and no JavaScript errors.
- Mobile remained absent after 13 seconds offscreen. Active movement paused offscreen and resumed its same pose. The document-visibility handler paused/resumed under a simulated `document.hidden` change.
- Offline HTML was tested with all external asset requests blocked: the full sequence, Light/Dark/System, restart cleanup and reduced motion worked without external requests or JavaScript errors.
- Actual About prevented visits under reduced motion and responded to live preference changes.
- Compared with the approved baseline at 1440px and 390px, both themes: Home and seven academic routes retained exact geometry and non-navigation screenshot pixels with rabbit artwork hidden (Home's animated canvas is also hidden for deterministic comparison). Photography's complete lightbox pixels matched. Navigation source is unchanged; live theme persistence across all six destinations and OS theme changes passed.

Browser testing used desktop Chromium with mobile viewport emulation. Physical touch devices, Safari and Firefox have not been manually verified. Native hidden-tab lifecycle was not automated; its handler was tested through a simulated visibility event.

No click reactions, ear-twitch behavior, lying-down pose, extra scenery, merge or deployment. Awaiting motion/design approval before expansion.

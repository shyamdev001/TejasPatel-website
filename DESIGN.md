# Design — The Field Survey

The site is Charotar farmland seen from above. Every section is a plot of land; the leader stands in his field.

## Colour

Committed strategy: colour owns whole sections, not accents.

| Token | Value | Role |
|---|---|---|
| `chalk` | `#f5f7f0` | default ground |
| `paper` | `#ffffff` | reading ground |
| `ink` | `#141b4d` | all type on light grounds |
| `navy` | `#1d2b77` | brand navy, scrollbar |
| `green` | `#1c6b48` | paddy field sections, footer, page wipe (white and mustard type) |
| `leaf` | `#dce8cf` | soft field, hover fills |
| `mustard` | `#f3c02d` | mustard field sections, preloader, menu (ink type) |
| `pin` | `#ea5136` | the one marker: active state, cursor, bullets |
| `pin-ink` | `#c4371d` | pin for small text (errors) |

Light only. Text on `green` is white or mustard; text on every other ground is `ink`.

## Type

- Display: **Anek Latin** + **Anek Gujarati**, weight 700, width axis `wdth` 118 (wide). Width is animated: 76 → 118 on entrance, 118 → 82 on menu hover. Sub-display text sets `--wdth: 100`.
- Body: **Hind Vadodara** 400/500/600, 17px, 1.6.
- Numerals: Anek at `wdth` 80, tabular (`.num`).
- Scale: `.d-hero` 17.5vw, `.d-1` 8.2vw, `.d-2` 5.2vw, `.d-2s` 3.5vw, `.d-3` 2.6vw, `.label` 13px tracked uppercase.
- Gujarati gets looser line-height and no tracking; it is never split into single characters.

## Shape and material

Square corners everywhere. Hairline rules (`--color-line`). `.furrows` prints crop rows on a field. `.ticks` puts survey corner marks on images and plots. No shadows, no cards with rounded corners, no gradients.

## Components

- `FurrowField` — canvas of furrow lines receding to the horizon; sways, parts around the pointer. Hero, page heroes, footer.
- `Split` / `Rise` / `Rule` / `Wipe` / `Odometer` (`Reveal.tsx`) — the motion primitives.
- `.btn` (ink, mustard fill rises on hover), `.btn-ghost`, `.btn-light`, `.ulink`.
- `Header` (logo plate, language switch, menu), full-screen mustard menu, `Footer` (green field).
- `PageHero` — title set wide over furrows on chalk, mustard or leaf.
- `AwardIndex` — ruled list; photograph follows the pointer.
- `Cursor` — pin dot that swells into a labelled disc over `[data-cursor]`.

## Motion

Grammar: ploughing. Rules draw left to right, text rises out of line masks, images open with a straight wipe and then drift slower than the page. Ease `expo.out` / `cubic-bezier(0.16, 1, 0.3, 1)`.

- Preloader: mustard field, rows draw, counter to 100, lifts away.
- Page change: six green strips rise, the destination name shows, strips leave upward (`Transition.tsx`, Motion).
- Legacy: pinned, travelled sideways on desktop; stacked on mobile.
- Projects: sticky plots that slide over each other on desktop.
- Smooth scroll: Lenis, driven by the GSAP ticker.
- `prefers-reduced-motion` (or `?still` in the URL) turns all of it off and shows the settled page.

## Responsive

Fluid type via `clamp`. Below `lg`: hero info moves under the portrait, legacy and project stack become normal flow, award photographs sit inline, tab lists scroll sideways.

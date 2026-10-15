# Hero storyboard assets

Layered artwork for the hero animation ("Your storyboard", refined: loops beats 04 to 07 only).
Used by the canvas component described in `Docs/2026-10-15-hero-storyboard-contact-orbits-plan.md`.
Nothing in this folder is referenced by the site yet.

## Files

| File | What it is |
|---|---|
| `manifest.json` | Geometry for everything below: source size 904 x 412, ring centre (413, 229), and each layer's x, y, w, h in source pixels, plus the draw order. |
| `plate.webp` | The background plate: orbit lines, grid lines, small dots and the floor scribble, with every card, tile, sphere and the ring removed and the gaps filled with plain paper. Colour-matched to the site background `#FAF8F5`. No transparency. |
| `ring.webp` | The ring, recoloured to the logo colours (near-black ring, green #12B047 segment) with the green segment sticking out past the black ring and a gap at both ends, like the official logo. Transparent PNG-style WebP. |
| `card-*.webp` | Six cards: mutual funds, insurance, demat (left), demat (right), credit cards, EPF. Transparent. |
| `tile-1..4.webp`, `sphere-1..2.webp` | The small icon tiles and glass spheres. Transparent. |
| `poster.webp` | The settled composition (plate plus every layer at rest) with soft edge fading baked into the alpha. Use it for the first paint, for reduced motion, and while layers are loading. |

## Where it came from

All of it was cut from the approved storyboard mockup image (the 8-frame storyboard, hero panel). The mockup is the only source,
so the effective resolution is about 900 px wide. Layers were cut with hand-placed masks and the ring was recoloured with a script.

## Known issues (fix by replacing the files, keep the filenames and update manifest.json)

1. **Resolution.** About 900 px wide. It is fine at 1x, soft on high-density or very large screens.
2. **Garbled text inside the artwork.** The source image was AI-generated and some card labels are misspelled: the top card reads "Insuraoce",
   the right-hand demat card reads "Dmat" / "Dnat". They are baked into the pixels of `card-insurance.webp` and `card-demat-right.webp`.
   Recommended before launch: regenerate or repaint those two cards with correct text, or cover the label with live text in the canvas.
3. **Small light notch** where the ring meets the left demat card (unrecoloured ring pixels at the edge of the card). Cosmetic.
4. The ring is recoloured in the image, so it is flatter than a rendered black ring. Ideal replacement: the original artwork with the ring already built in the logo colours.

## Logo colours (from public/Logo)

Ring black `#0F0F0F`, green segment `#12B047`. The green segment is slightly larger than the ring and sticks out past its outer edge, with a thin gap at each end.
The site accent green `#22C55E` (buttons, links) is a different green and is not changed.

## Update (after first review)

- Card labels corrected: the insurance card now reads "Insurance"; the right-hand demat card now reads "Debt"; the credit cards card now reads "Gold" (its small card icon is unchanged). Known issue 2 above is resolved for those cards.
- The ring's green segment is now plain flat `#22C55E` (no shading) and the ring is a little thinner. It keeps the pop-out and the gaps at both ends. The code-drawn greens in the hero (streams, scan, halo, insights) and the contact orbits use the same `#22C55E`.
- Placement: the whole plate now stays on screen on wide screens (see `lib/heroStoryboard.ts`).


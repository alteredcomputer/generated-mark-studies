# Typography

## Decision: reopened in round six

Round five recorded Px Grotesk Mono Bold as the logotype. The operator's favourite lockup of all time, though, is X1 with **Berkeley Mono Bold** (round four). The choice is now made from side-by-side lockups with identical construction, which round six provides for:

| Face | Weight | Tracking | Status |
| --- | --- | --- | --- |
| Berkeley Mono | Bold 700 (over Medium 500) | 0 | favourite so far |
| Geist Mono | Medium 500 or Bold 700 | 0 | operator "really loving" it; added in round six |
| Px Grotesk Mono | Bold 700 | 0 | original wordmark face; Bold is trial-only |

Other roles, settled:

- **Px Grotesk (proportional), Regular 400 or Bold 700:** the casual face for app UI and blog-style copy, not the logo.
- **Berkeley Mono:** website copy.
- Condensed cuts, Black weights and wide tracking: rejected for the logo.

## Metrics

Measured from the font files by `src/type.mjs`, all as fractions of the em.

| Face | Cell (advance) | Cap height | x-height | Tallest lowercase |
| --- | --- | --- | --- | --- |
| Berkeley Mono Bold | 0.60 | 0.68 | 0.53 | 0.734 (d), 0.728 (l) |
| Geist Mono Medium / Bold | 0.60 | 0.71 | 0.53 / 0.54 | 0.71 |
| Px Grotesk Mono Bold | **0.62** | 0.68 | 0.51 | 0.68 |

Round five assumed Px Grotesk Mono's cell was 0.60 em. It is 0.62.

Berkeley Mono's ascenders rise above its capitals; Geist's and Px's stop at cap height. So at matched cap height, Berkeley's lowercase word stands slightly taller.

## The em, the cell, and tracking, plainly

- **Em.** Every letter is drawn on an invisible card. The font size is the card's height: at 42px type, 1 em = 42px. Letters do not fill the card; Berkeley Mono's tallest lowercase letter uses 0.73 of it. Lockup numbers are given in em so they scale with the type. The em has no fixed vertical position: in these faces the space above and below the baseline adds up to 1.2 to 1.3 em.
- **Cell.** In a monospace face every card is also the same width. That width is the character cell. A letter sits inside its cell with a small empty margin each side, its side bearing.
- **Tracking.** Extra space after every letter. It widens the word and changes nothing else: not the em, the cell, the icon or the gap.

## Lockup rules (round six)

Three numbers, all in em of the wordmark's font size:

1. **Icon height.**
2. **Gap, measured from the icon's edge to the first letter's ink.** Round five measured to the start of the first cell, which silently added the `a`'s side bearing (0.08 em in Berkeley Mono). Measuring to the ink makes the visible gap the chosen one, and identical across faces.
3. **Vertical centring on ink.** The middle of the word's ink, from the top of its tallest letter to the baseline, sits on the middle of the icon. This is the operator's own rule. Round four placed the baseline 54px under a 68px icon at 42px type, which left the word 4.8px low (7% of the icon); the operator saw it as "a little bit low".

The round four favourite, measured: **icon 1.62 em** (68px at 42px), **gap 0.94 em to the ink** (36px to the cell plus the 3.5px side bearing), which is **1.57 cells**. Round six holds these numbers for every typeface and icon comparison. That 1.62 is close to the golden ratio is a coincidence of 68 and 42, not a rule.

Round five's options, for the record: the operator preferred icon = 1 em among 1, 1.18 and 0.68 em, with a framed icon in Px Grotesk Mono, and gap = 1 cell over half a cell. The round six spacing sheet sweeps icon size (1 to 1.62 em) and gap (0.75 to 1.75 cells) around the favourite.

Comparisons across faces match **cap height**: each face is sized so its capitals would equal Berkeley Mono's at the same nominal size, and the icon and gap are held in pixels.

## Wordmark forms

Preferred stacked form, per the operator: **period leading line two.**

```
altered
.computer
```

Reads as "altered" then "dot computer". The second line running two characters longer is a deliberate brutalist overhang. Kept as the text-only asset, in Berkeley Mono Bold, leading to be tuned (round four used 1.14 em baseline to baseline). Round six adds a hanging variant: line two moved left one cell so the `c` sits under the `a`.

A simplified single word, `altered`, is also required.

Rejected: the period trailing line one (`altered.` over `computer`), and the single line with a square period.

## Licensing

Full licence: Px Grotesk Regular and Bold, Px Grotesk Mono Regular. **Px Grotesk Mono Bold is trial-only**; the operator will buy it if it wins. Berkeley Mono was supplied by the operator. Geist Mono and JetBrains Mono are SIL Open Font License. All are in `fonts/`; see `PIPELINE.md`.

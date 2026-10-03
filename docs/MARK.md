# The Mark

## Shape, in one sentence

A converging flow: a wide intake on the left that tapers along an expo-out curve to a throat at dead centre, where a six-pointed spike star marks the transformation, and a single bar carries the result out to the right. It ships two ways: knocked out of a solid tile (X1), or floating inside a square frame.

## The reference: X1

Round four's X1 ("16px cut / kortex") is the operator's favourite and the base for everything since. It is reproduced exactly by `x1()` in `src/glyph.mjs`, and the round six build asserts its paths are byte-identical to round four's.

48-unit field. These numbers were picked by eye in round four, so several have no clean fraction.

| Dimension | Units | Of field | Origin |
| --- | --- | --- | --- |
| Field | 48 | 1 | |
| Bar | 11 | 0.229 | picked |
| Inflection | 24 | 1/2 | locked |
| Mouth | 0.96 of height | | picked; leaves a 0.96 sliver of ink above and below at the left edge |
| Curve drop | 17.54 | 0.365 | sliver to bar edge |
| Vertical spike | 20.64 | 0.43 | 0.86 of the half-height |
| Tip margin | 3.36 | 0.07 | what 0.86 leaves |
| Vertical base | 11.55 | 0.241 | 1.05 x bar |
| Diagonal spike | 11.56 | 0.241 | 0.56 x vertical |
| Diagonal base | 8.25 | 0.172 | 0.75 x bar |
| Apex angles | 31.3 / 39.3 deg | | vertical / diagonal: unequal |
| Diagonal rise | 2.67 | 0.056 | how far a diagonal tip clears the bar |

### Why X1 vanished in round five

Round five's `cut()` derived its small-size cut from each framed finalist: it kept the parent's bar (6 or 8) and star (reach 0.6 or 0.75, diagonals 0.78, bases 0.8 and 0.5 x bar). X1 had a bar of 11 and spikes at 0.86. So every round five cut had a bar about half as thick and a smaller, spikier star. The rule that "the bar keeps its absolute weight" was the mistake. X1 was never a crop of a framed design.

## Canon: X1 as rules

`canon()` in `src/glyph.mjs`. The same shape on a **64-unit field**, every number following from a rule. The overlay sheet in round six shows the two differ by under a unit almost everywhere.

| Dimension | Units of 64 | Of field | Rule |
| --- | --- | --- | --- |
| Bar | 16 | 1/4 | centred, its edges land on 3/8 and 5/8: whole pixels at 16px |
| Inflection | 32 | 1/2 | locked |
| Tip margin | 4 | 1/16 | one pixel at 16px |
| Vertical spike | 28 | 7/16 | half-field less the tip margin |
| Vertical base | 16 | 1/4 | a spike's base equals the bar it grows from |
| Diagonal spike | 16.8 | | 0.6 x vertical, the operator's K-sweep pick |
| Diagonal base | 9.6 | | 0.6 x vertical base: the same triangle, scaled |
| Apex angle | 31.9 deg | | all six spikes share it |
| Sliver | 1 | 1/64 | the smallest unit; keeps X1's thin corner wedge |
| Diagonal rise | 3.88 | | slightly more visible than X1, as asked |

### Why 64, not 48

The field number is a ruler; crispness depends on where edges land. An edge is crisp at 16px only if it sits on a sixteenth of the field, because a sixteenth is one pixel there. 48 writes a sixteenth as 3 units, 64 as 4. The difference is everything else: the mark ships at 16, 32, 64, 128, 512 and 1024, and on 64 a unit is a whole number of pixels at every size from 64 up and an exact quarter or half below. On 48 a unit is a third of a pixel at 16 and two thirds at 32. 48's only advantage is thirds, and X1 uses none. The operator also prefers base-2 grids.

A consequence worth knowing: a bar centred on the field is crisp at 16px only at 1/8, 1/4 or 3/8. X4's heavier 5/16 bar cannot be crisp at 16px.

### Variants on canon (round six)

- `d70`: diagonals at 0.7 of the vertical.
- `heavy`: bar 5/16 (X4's weight) with diagonals at 0.7, which rise 3.86 units clear of the bar against canon's 3.88, so the heavier bar does not swallow them.

## Framed, with the same glyph

`framed()` in `src/glyph.mjs`. The glyph is placed inside a frame at a uniform scale, so every inner proportion is the tile's exactly; only the frame and the gap are new. Polarity flips: the tile's voids become ink.

| Variant | Frame | Gap | Glyph box | Scale | Bar |
| --- | --- | --- | --- | --- | --- |
| FA | 8 = 1/8 | 8 = 1/8 | 32 = 1/2 | 0.5 | 8 = frame |
| FB | 8 = 1/8 | 4 = 1/16 | 40 = 5/8 | 0.625 | 10, a quarter heavier than the frame |

With canon's quarter bar, bar = frame forces `6 x frame + 2 x gap = 64`. On whole sixteenths that allows only FA's 8 and 8, or a frame of 4 with a gap of 20, which shrinks the glyph to a quarter of the tile.

## How the curve is installed

The funnel's top edge lives in a box: left edge at the mouth (x = 0 in the tile), right edge at the inflection (x = half the field), top at the sliver, bottom at the bar's edge. Inside it:

```
x = x0 + t * (inflection - x0)
y = sliver + expoOut(t) * drop        expoOut(t) = 1 - 2^(-10t)
```

The bottom edge is the mirror. expoOut is 50% done at t = 0.1, 90% at t = 1/3 and 99% at t = 2/3, so the visible bend is all in the first third and the curve looks as if it stops early. Change the bar or the sliver and the curve re-stretches; the box, not the curve, is what the grid controls. Sampled at 72 steps, then flat from the inflection to the right edge.

## How the star is constructed

A union of six triangles sharing one centre, at the inflection on the bar's centre line.

- Each spike: apex at its length from the centre; base of its width, perpendicular to its own axis and centred on the centre point. So the base sits inside the bar and only the tip shows.
- Vertical pair at 90 and 270 degrees. Diagonals at 45, 135, 225 and 315.
- **No horizontal spike.** The bar is the horizontal, which is why the star fuses with it.
- A diagonal's visible rise above the bar is `length / sqrt 2 - bar / 2`. That one number explains why stubby diagonals vanish and a heavier bar needs longer ones.
- Painted into one mask, so the union is seam-free.

## Locked parameters

- **Easing: `expoOut`**, `1 - 2^(-10t)`. Mirrors and other curves rejected.
- **Inflection: 50%.**
- **Diagonals: 0.6 of the vertical**, with the same apex angle as the vertical.
- **Attachment: float** for framed marks. Attach-both is scrapped.
- **Bar = frame** for framed marks. A bar heavier than the frame (R75, HEAVY) is scrapped.
- **Corner radius: 0.**
- **Angles: 90 and 45 only**, outside the taper.

## Earlier framed finalists

Round four, 48 field. `B6`: frame 5, bar 6, reach 0.6 of the window half-height, star S2. `R75`: frame 5, bar 8, reach 0.75. Round five's canonical B6 (frame 6, bar 6, reach 0.6, diagonals 0.78) is superseded: its diagonals were one step too long.

"Star reach 60%" in those marks means 60% of the window's half-height: from the bar's centre line to the spike tip, as a fraction of the distance from the centre line to the frame's inner edge.

## Two rendering traps, both hit and both fixed

**Figure/ground inversion.** A light flow that touches the frame on both the left and the right bridges them, and the eye promotes the background to figure. Fixed by insetting the flow. This is why float is the default.

**Abutment seam.** Two separately painted fills that share an edge leave a faint antialiasing line. Fixed by a 1-unit `bleed` so they overlap. Only matters for attached variants, now scrapped.

## The mirror question, answered correctly

Reflecting a curve about the anti-diagonal of the unit square (top-left to bottom-right), which preserves concavity and direction, maps `(x, y) -> (1 - y, 1 - x)`, so the reflection is `g(x) = 1 - f^-1(1 - x)`.

| Curve | Formula | Anti-diagonal mirror |
| --- | --- | --- |
| `quadOut` | `1-(1-t)^2` | `t^(1/2)` |
| `cubicOut` | `1-(1-t)^3` | `t^(1/3)` |
| `quartOut` | `1-(1-t)^4` | `t^(1/4)` |
| `expoOut` | `1-2^(-10t)` | `1 + log2(t)/10` |
| 90 degree arc | `sqrt(1-(t-1)^2)` | **itself** |

The arc is the only self-symmetric curve, because the reflection fixes its centre `(1, 0)`. `circOut` is the 90 degree arc. Aggressiveness: quad < cubic < quart < expo. The operator reviewed the mirrors in round five and kept plain expoOut.

# The Mark

## Shape, in one sentence

A square frame containing a converging flow: a wide intake on the left that tapers along an expo-out curve to a throat at dead centre, where a six-pointed spike star marks the transformation, and a single bar of the same weight as the frame carries the result out to the right.

## Canonical grid

48-unit field. Every dimension is a simple fraction of it, so the whole mark is reconstructible from the table alone.

| Dimension | Units | Fraction | Notes |
| --- | --- | --- | --- |
| Field | 48 | 1 | the tile |
| Frame | 6 | 1/8 | outer border |
| Bar (throat) | 6 | 1/8 | **locked equal to the frame** |
| Window | 36 | 3/4 | `48 - 2 x 6` |
| Gap | 3 | 1/16 | void margin between flow and frame, float attachment only |
| Mouth | 27 | 3/4 of window | intake height, measured at `x = gap` |
| Inflection | 18 | window / 2 | **locked dead centre**; throat and star share this x |
| Star reach | 10.8 | 0.6 x 18 | vertical spike tip from centre |
| Diagonal reach | 8.4 | 0.78 x 10.8 | diagonal spike tip |
| Axis base | 4.8 | 1.6 x bar/2 | vertical spike base width |
| Diagonal base | 3.0 | 1.0 x bar/2 | diagonal spike base width |

Angles: 90 and 45 only, outside the taper itself.

## Locked parameters

Locked by the operator during round 4/5 review. Do not vary without instruction.

- **Easing: `expoOut`**, `1 - 2^(-10t)`.
- **Inflection position: 50%.** The steep expo curve leaves room for a properly centred star.
- **Bar weight equals frame weight.** Both may scale together, never independently.
- **Star reach: ~0.6** of the window half-height.
- **Attachment: float** is the default. An `attach both` variant of the leading candidate stays in contention.
- **Corner radius: 0.**

## Open questions

- Frame/bar weight: 6 (1/8, the clean number) versus 5 (10.4%) versus a heavier uniform 8.
- Diagonal spike proportions. Round 4's stars all failed: S1-S3 had diagonals too stubby to see, S4's ratio was awkward, S6-S7 lost brutalism, S10-S12 (asterisk) read as tacky. Round 5 sweeps diagonal length against base width.
- Whether the small-size cut becomes the primary mark wherever there is no logotype.

## Finalists

| Id | Frame | Bar | Reach | Note |
| --- | --- | --- | --- | --- |
| `B6` | 6 | 6 | 0.60 | both 1/8; the clean grid |
| `B5` | 5 | 5 | 0.60 | same logic at 10.4% |
| `R75` | 5 | 8 | 0.75 | bar heavier than frame; competitive despite breaking the uniformity rule |
| `HEAVY` | 8 | 8 | 0.65 | R75's mass with B6's logic |

Each exists in three forms: `float`, `attach both`, and the small-size cut.

## Small-size cut

The 16px derivative. Container removed, tile filled, flow punched out as a void. Geometry is re-derived at full field rather than scaled up, so the bar keeps its absolute weight instead of growing with the container.

The operator rated this highly as a profile picture and as the primary mark wherever no logotype appears. Note the earlier round-3 attempt at this failed because the mouth spanned the full height and touched both edges, leaving only two slabs; the fix is deriving it from a finalist's narrower bar rather than a generic one.

## How the star is constructed

It is **a union of six triangles sharing one centre**, not a polygon star and not a boolean operation.

- Each spike is a triangle: apex at `length` from the centre, base of `base` across, perpendicular to its own axis.
- Vertical pair at 90 and 270 degrees, length `reach`, base `1.6 x bar/2`.
- Four diagonals at 45, 135, 225, 315 degrees, length `0.78 x reach`, base `1.0 x bar/2`.
- **There is no horizontal spike.** The output bar already supplies that axis, which is why the star fuses with the bar rather than sitting on top of it.
- All six are painted into one luminance mask, so the union is implicit and seam-free.

## How the taper is constructed

`spread(x) = reach * (1 - ease(t)) + throat/2`, sampled at 72 steps from the mouth to the throat, then flat to the output.

The top edge is sampled and the bottom edge is its mirror about the centre line, so the funnel is one closed polygon.

Curved and diagonal channels are offset along **mitred normals**, not vertically. Offsetting in y alone is the cheap approach and makes every diagonal read thinner than the horizontals it connects; the operator caught this in round 3.

## Two rendering traps, both hit and both fixed

**Figure/ground inversion.** A light flow that touches the frame on both the left and the right bridges them, and the eye promotes the background to figure: you stop seeing a funnel and start seeing two wedges of background. Fixed by insetting the mouth (`mouth` < 1) and stopping the output short of the frame. This is why `float` is the default attachment.

**Abutment seam.** When the flow is deliberately attached to the frame, two separately-painted fills that share an edge leave a faint antialiasing line. Fixed by giving the flow a 1-unit `bleed` so it overlaps into the frame instead of abutting it.

## The mirror question, answered correctly

Reflecting a curve about a diagonal of the unit square:

- **Main diagonal** (`y = x`, bottom-left to top-right): the reflection of `f` is `f⁻¹`. For `f(t) = 1 - (1-t)ⁿ` that is `1 - (1-t)^(1/n)`.
- **Anti-diagonal** (`y = 1 - x`, top-left to bottom-right): the reflection is `g(x) = 1 - f⁻¹(1 - x)`.

For the anti-diagonal, which is the one that preserves concavity and left-to-right direction:

| Curve | Formula | Anti-diagonal mirror |
| --- | --- | --- |
| `quadOut` | `1-(1-t)^2` | `t^(1/2)` |
| `cubicOut` | `1-(1-t)^3` | `t^(1/3)` |
| `quartOut` | `1-(1-t)^4` | `t^(1/4)` |
| `expoOut` | `1-2^(-10t)` | `1 + log2(t)/10` |
| 90 degree arc | `sqrt(1-(t-1)^2)` | **itself** |

Power curves mirror into root curves; the exponential mirrors into a logarithm. The 90 degree arc is the only self-symmetric curve, because the reflection `(x, y) -> (1-y, 1-x)` fixes its centre `(1, 0)`. Verified numerically: max error 0.00000 for the arc, 0.275 for expoOut.

Also note: `circOut` **is** the 90 degree arc. It is not a separate option.

Easing family for reference, in order of aggressiveness: quad (power 2) < cubic (power 3) < quart (power 4) < expo.

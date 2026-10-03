# Reviews

The operator's verdicts, round by round, newest first. This is where current favourites live and why. Earlier rounds' rejections are summarised in `BRAND.md`; this file keeps the reasoning behind the live direction.

Read the latest round's open questions before building anything.

## Round 6 (2026-10-03): delivered, awaiting review

Built from the operator's review of rounds 4 and 5 below. Live at <https://generated-mark-studies.vercel.app/6/>.

Open questions put to the operator:

1. X1 exactly, or canon (X1 restated as rules on a 64 field)?
2. Diagonals at 0.6 or 0.7 of the vertical.
3. Framed: FA (frame = gap = bar = 1/8), FB (gap 1/16, bar 5/32), or neither.
4. Lockup typeface: Berkeley Mono Bold, Geist Mono Medium or Bold, or Px Grotesk Mono Bold.
5. Lockup icon size and gap: keep round four's 1.62 em and 1.57 cells, or a row from the spacing sheet.
6. Stacked text: which leading, and hanging period or not.

## Review of rounds 4 and 5 (given 2026-10-03, at the start of round 6)

### The favourite

**X1 (round 4, "16px cut / kortex") in a lockup with Berkeley Mono Bold, the last row of round 4's Berkeley lockup sheet, is the favourite of all time.** "The proportions of this are perfect." It is the base reference for everything that follows; tweak it, do not replace it.

- X1 never made it into round 5, and the operator noticed. Cause, confirmed in round 6: round 5's `cut()` reused each framed parent's bar and star instead of X1's own numbers. See `MARK.md`.
- The operator's hypothesis was that X1 was a crop of a framed design on a different grid. Not so: X1 was drawn at full field with its own hand-picked numbers. Recorded so the theory is not chased again.
- Wants X1's construction shown in full, like round 5's B6 construction: where the expo-out curve starts and ends and how it is installed, how every spike is anchored, the hidden part of each triangle (an X-ray outline), and measuring-tape dimensions that show both the length and why it is that length. Delivered in round 6.
- Likes that X1 is all straight lines except the expo curve: "very brutalist".
- In an avatar, would make X1 a little smaller than round 4's 70% to leave more space around it.

### Locked by the operator

- **Easing: expoOut.** It has personal meaning. Quart out was runner-up, now dropped entirely. Mirrored curves (round 5's M sheet): rejected; only the plain expoOut is liked.
- **Inflection at 50%.**
- **Frame: F5 in round 4 terms (10.4%), F6 runner-up.** F6 is "thick and brutalist" but pulls focus from the centre.
- **Attachment: float.** Attach-both was runner-up and is now scrapped for X1: it "does not look as good at different resolutions".
- **Bar = frame weight** for the framed mark (round 4's B6). It shows the diagonal spikes; round 4's bar 8 covers them.
- **Thick bar scrapped.** R75's bar heavier than the frame, and round 5's HEAVY, "look odd up close... not balanced enough. Stop trying to make the thicker bar work."
- **Star reach about 0.6** for the framed mark (60% of the window half-height). R75's 75% with the thicker bar was a close runner-up on the sheets.
- **Diagonal spikes at 0.6 of the vertical** (round 5's K sweep). 0.78 is "way too long"; round 5's finalists used 0.78, which is the first thing that made them look off.
- **Spike bases: same apex angle for diagonals and verticals.** The operator anchors this on concept, not looks: base 1.0 and 1.35 were visually indistinguishable, so pick the rule that makes all six spikes share one angle. Canon implements this as "every spike is the same triangle".
- **Oscilloscope: out.**
- **Small sizes: the inner glyph must look the same framed or unframed.** Design the glyph once and place it in each container, rather than giving each container its own internal proportions. How is the designer's call.
- **Grid:** prefers base-2 (32 or 64) but open to 48 if it is justified. Round 6 moved canon to 64 with reasoning in `MARK.md`.

### Wanted next

- X1 variants: diagonal spikes a touch longer. X4 (heavier throat) as a variant only if its diagonals are extended to stay visible.
- B6 and R75 (round 4) side by side at 16, 32 and 64. Delivered in round 6.
- Lockups of X1, B6 and R75 with Berkeley Mono, Geist Mono and Px Grotesk Mono, all with identical construction, compared stacked. Delivered in round 6.
- Centre the word vertically on the icon by its ink: top of the tallest letter to the baseline, centred on the icon's height. Round 4's word sat low; confirmed at 4.8px (7% of the icon) in round 6.
- Explain the em, the character cell, how the gap is built, and what tracking affects, in plain words. Delivered on the round 6 page.

### Type

- **Berkeley Mono:** Bold 700 over Medium 500. Tracking 0: "really exemplifies the original design of the font". -1 is cramped, +3 too open, +8 and condensed and Black all out. May fine-tune in quarter steps later.
- **Px Grotesk Mono:** Bold 700, tracking 0 looked best against the original wordmark (-1.5 and +1.5 close behind). Regular Px Grotesk (not mono) at 400 or 700 is the casual face for app and blog use, not the logo.
- **Geist Mono:** the operator has been "really loving" it in Medium or Bold and wants it in the comparison.
- The typeface for the logo is **reopened**: round 5 recorded Px Grotesk Mono Bold as decided, but the favourite lockup is Berkeley Mono Bold. Decide from side-by-side lockups.
- **Stacked `altered` / `.computer` in Berkeley Mono Bold** (round 4 head-to-head) is kept as a candidate asset. Line spacing may be tuned.
- Round 5's "typeface showdown" of bare words was not useful; lockups side by side are what decide a face.

### Lockup mathematics (round 5)

- Of round 5's options, icon = 1 em looked best, gap = 1 cell looked good and half a cell did not. Wants to try 0.75 to 1.25 cells.
- The operator also uses gaps based on the icon (1, 3/4 or 1/2 of its width) in their own work and is open to either system.

### Assets planned

- Icon only. Icon plus `altered`. Text only, as the stacked `altered` / `.computer`.
- Framed and unframed: get both right first; decide where each is used later.
- Final SVGs: clean, merged (unioned) paths with no overlaps, keeping the layered source SVGs in the repo. Flattening the mask to an even-odd path is fine if it is simple and most compatible.

### Process notes from this review

- Round 5's sheets had real rendering bugs: the spike anatomy ran off the right edge, the lockup icons sat 60 to 75% low in their rows, and the reconstruction of the old option-key mark rendered outside its box. Look at every render before delivering.
- Do not paste screenshots into chat; link the deployed page.

## Rounds 1 to 3

Summarised in `BRAND.md` (rejected directions) and `MARK.md` (how the convergence thesis was reached). The original brief, from the first conversation, is in `BRAND.md` under "The brief".

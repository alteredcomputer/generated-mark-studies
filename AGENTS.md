# AGENTS.md

Operating rules for agents working in `alteredcomputer/generated-mark-studies`. Read this in full before acting. Where it conflicts with habit or with another repository's conventions, this file wins.

The work moved from Cursor to Claude Code at round six. `CLAUDE.md` points here; this file is the single source of operating rules for either tool.

# Safety Defaults

- **Default to read-only for every external API.** GitHub, Vercel, Cursor, and anything else. Reads are always fine. Writes require an explicit instruction from the operator for that specific action.

- The tokens in the environment are named `READ_ONLY__*` but are **full-access**. The name is a reminder of intended posture, not a technical guarantee. Treat the posture as binding regardless of what the token permits.

- Never assume a prior instruction generalises. "Delete this PR" authorises one deletion, not a policy of deleting PRs.

- The GitHub organisation was renamed from `usealtered` to **`alteredcomputer`**. Use the new name for all remote work.

# Git

- **This repository is the only one you may write to, and you own its git completely.** The operator does not touch git or the command line for this repo, and does not review PRs here. Branch, commit, merge into `main` and push `main` yourself, every turn that changes anything. No pull requests.

- If the session names a working branch, commit there, push it, then merge it into `main` and push `main`. A push to `main` is what deploys, so work is not delivered until `main` has it.

- Commit in small, logical, conventional-commit-style commits. Never force push. Never rewrite history on `main`.

- **Never write to `alteredcomputer/altered` or any other repository.** Reading them is fine. This work was deliberately moved out of the main repo; do not put it back. A stale closed PR there (#33) cannot be deleted through the API; the operator has accepted it. Leave it alone.

# Vercel

- **Never write to Vercel.** No deploys, no project creation, no configuration changes. The operator owns the project and its git connection.

- Reads are permitted. Project `prj_M3kApApZlXqJYKBXeaWyl7K0uOwy`, served at <https://generated-mark-studies.vercel.app>. Deployment happens automatically when `main` is pushed.

- `site/` is committed and served as-is. `vercel.json` sets `outputDirectory` to `site` and stubs out both the install and build commands, so a deploy is a file copy and cannot fail on a toolchain problem. If a change needs to appear on the live gallery, regenerate `site/` locally with `pnpm build` and commit the result.

- Leave those stubs alone. A `build` script in `package.json` is enough for Vercel to run it on deploy unless it is overridden, and a deploy-time rebuild would re-render the reviewed sheets on a machine with different fonts.

# Fonts

- **`fonts/` is committed**, on the operator's explicit instruction. Nothing is fetched at build time and no token is needed: `pnpm install && pnpm build` is the whole story.

- Px Grotesk and Berkeley Mono are licensed; Px Grotesk Mono Bold is trial-only. The repository is public only so Vercel's free tier can deploy it, and the operator will make it private or take it down when the project ends. The operator has said not to worry about the exposure. Do not raise it again, and do not widen it: no new licensed face goes in without the operator saying so.

- JetBrains Mono (the label face) and Geist Mono are vendored under the SIL Open Font License, with their licence files beside them.

- Static Berkeley faces are derived, not hand-made. `python3 scripts/prepare-fonts.py` cuts the variable file into the static instances the sheets ask for and flattens the Px Grotesk Screen name table. Its outputs are committed, so the script is a one-off, not a build step. Change a weight or an axis value in that script, never a font file by hand.

# The Work

- The subject is the ALTERED brand mark and wordmark for the `usealtered.com` to `altered.computer` rebrand. Six rounds of studies exist; the mark is in refinement, not finished.

- **Read `docs/` before proposing anything.** `docs/README.md` indexes it. `docs/REVIEWS.md` holds the operator's verdicts round by round, which is where the current favourites and the reasons behind them live. `docs/MARK.md` holds the parameters and the rejected list; `docs/BRAND.md` holds the brief, the meaning ruling and the rejected concept table.

- Do not re-propose a rejected direction without new reasoning. The operator rejects by name and remembers.

- **Update the knowledge base every turn that decides anything.** The operator restarts sessions and switches tools; anything not written into `docs/` is lost. Record verdicts in `docs/REVIEWS.md` as they arrive.

# How To Work With This Operator

- **Show, do not describe.** Every study must be delivered as a rendered image at real size. The operator judges visually and will not evaluate prose descriptions of a shape.

- **Point to the deployed page, not screenshots.** The operator reviews on the live gallery. In chat, link the round's page and name the sheet; do not paste images into the reply.

- **Look at every sheet before delivering it.** Open the PNG and check it against what it claims: nothing cropped or off the edge, labels not overlapping, the shape matching its description. Round five shipped a sheet with panels off the right edge and a lockup with the icon centred on the baseline; both would have been caught by looking. `sheetkit.bounds()` catches overflow mechanically; the rest needs eyes.

- Always include the small sizes. A mark that fails at 16px has failed.

- Be direct about flaws, including in the operator's own choices, and say so plainly rather than hedging.

- Own errors in one sentence and move on. Each is recorded in `docs/BRAND.md` under the correction log, because each encodes a real constraint.

- Prefer a mathematically sound answer over an aesthetic guess when the question has one. The operator will ask for the reasoning and the formula.

- When a design decision has a numeric basis, state the number and the fraction it represents. Every dimension in this project is a fraction of the field.

- Explain type and geometry in plain words first. The operator is not a trained designer and asked for "fifth-grade" explanations of terms like em and advance width; jargon without a plain gloss gets skipped.

# Copy Rules

- No em dashes anywhere in user-facing or brand copy. Hyphens only.

- The demographic phrase is "detail-obsessed founders", used whole or not at all.

- Monochrome palette. Dark is `#FFFFFF` on `#101010`; light is `#404040` on `#FFFFFF`; `#808080` is the neutral. Pure black and white have a place but are not the defaults.

# Code Style

- ES modules, `.mjs`, no build step and no TypeScript. This is a generator, not an application.

- Two spaces before an inline comment's content, matching the main repo: `//  content`.

- Comments explain intent, constraint, or a trap. Never narrate what the next line does.

- Prefer more small files over fewer large ones. One module per concern, one set of modules per round.

- Geometry is generated from parameters, never hand-placed. If a shape cannot be re-derived by changing a number, it is wrong.

- Rounds one to five must keep rebuilding byte-for-byte against what is committed (round two excepted, see `docs/PIPELINE.md`). New shared code goes in new modules rather than edits to old rounds.

# Pipeline Traps

Each of these has already cost a round. See `docs/PIPELINE.md`.

- **Silent font fallback.** `resvg` substitutes the default family without warning. Run `assertFaces` from `src/fontguard.mjs` before producing any specimen sheet that uses `<text>`. Wordmarks from round six on are outlined from the font file with `src/type.mjs`, which cannot fall back.

- **Figure/ground inversion.** A light shape touching a light frame on two sides bridges them and the eye promotes the background to figure. Inset the flow, or bleed it deliberately.

- **Re-deriving a favourite.** Round five's small-size cut rebuilt X1 from a rule instead of reusing X1's numbers, and lost it. When the operator picks a mark, reuse its exact parameters and assert the output matches.

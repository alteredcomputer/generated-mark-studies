# AGENTS.md

Operating rules for agents working in `usealtered/generated-mark-studies`. Read this in full before acting. Where it conflicts with habit or with another repository's conventions, this file wins.

# Safety Defaults

- **Default to read-only for every external API.** GitHub, Vercel, and anything else. Reads are always fine. Writes require an explicit instruction from the operator for that specific action.

- The tokens in the environment are named `READ_ONLY__*` but are **full-access**. The name is a reminder of intended posture, not a technical guarantee. Treat the posture as binding regardless of what the token permits.

- Never assume a prior instruction generalises. "Delete this PR" authorises one deletion, not a policy of deleting PRs.

# Git

- **This repository is the only one you may write to.** Full autonomy here: branch, commit, merge, and push directly using the CLI. The operator does not want to review PRs for this repo.

- Commit in small, logical, conventional-commit-style commits. Never force push. Never rewrite history on `main`.

- **Never write to `usealtered/altered` or any other repository.** Reading them is fine. This work was deliberately moved out of the main repo; do not put it back.

# Vercel

- **Never write to Vercel.** No deploys, no project creation, no configuration changes. The operator owns the project and its git connection.

- Reads are permitted. Deployment happens automatically when you push to this repository.

- `site/` is committed and served as-is. `vercel.json` sets `outputDirectory` to `site` and stubs out both the install and build commands, so a deploy is a file copy and cannot fail on a toolchain problem. If a change needs to appear on the live gallery, regenerate `site/` locally with `pnpm build` and commit the result.

- Leave those stubs alone. A `build` script in `package.json` is enough for Vercel to run it on deploy unless it is overridden, and a deploy-time rebuild would re-render the reviewed sheets on a machine with different fonts.

# Fonts

- **`fonts/` is committed.** Px Grotesk and Berkeley Mono live in the repository as ordinary files, on the operator's explicit instruction. Nothing is fetched at build time and no token is needed: `pnpm install && pnpm build` is the whole story.

- **This repository is public, and both faces are licensed.** Px Grotesk Mono Bold is still trial-only. Committing them was a deliberate trade of licence exposure for a build that works from a clean clone. Do not widen it: no new licensed face goes in without the operator saying so.

- Static faces are derived, not hand-made. `python3 scripts/prepare-fonts.py` cuts Berkeley Mono's variable file into the eight static instances the sheets ask for and flattens the Px Grotesk Screen name table. Its outputs are committed as well, so the script is a one-off, not a build step.

- Change a weight or an axis value in that script, never a font file by hand.

# The Work

- The subject is the ALTERED brand mark and wordmark for the `usealtered.com` to `altered.computer` rebrand. Five rounds of studies exist; the mark is in refinement, not finished.

- **Read `docs/` before proposing anything.** `docs/README.md` indexes it. `docs/MARK.md` holds the locked parameters and the full rejected list; `docs/BRAND.md` holds the meaning ruling and the rejected concept table.

- Do not re-propose a rejected direction without new reasoning. The operator rejects by name and remembers.

# How To Work With This Operator

- **Show, do not describe.** Every study must be delivered as a rendered image at real size. The operator judges visually and will not evaluate prose descriptions of a shape.

- Always include the small sizes. A mark that fails at 16px has failed.

- Be direct about flaws, including in the operator's own choices, and say so plainly rather than hedging.

- Own errors in one sentence and move on. Several have happened and each is recorded in `docs/BRAND.md` under the correction log, because each encodes a real constraint.

- Prefer a mathematically sound answer over an aesthetic guess when the question has one. The operator will ask for the reasoning and the formula.

- When a design decision has a numeric basis, state the number and the fraction it represents. Every dimension in this project is a fraction of the field.

# Copy Rules

- No em dashes anywhere in user-facing or brand copy. Hyphens only.

- The demographic phrase is "detail-obsessed founders", used whole or not at all.

- Monochrome palette. Dark is `#FFFFFF` on `#101010`; light is `#404040` on `#FFFFFF`; `#808080` is the neutral. Pure black and white have a place but are not the defaults.

# Code Style

- ES modules, `.mjs`, no build step and no TypeScript. This is a generator, not an application.

- Two spaces before an inline comment's content, matching the main repo: `//  content`.

- Comments explain intent, constraint, or a trap. Never narrate what the next line does.

- Prefer more small files over fewer large ones. One module per concern, one pair of modules per round.

- Geometry is generated from parameters, never hand-placed. If a shape cannot be re-derived by changing a number, it is wrong.

# Pipeline Traps

Both of these have already cost a round. See `docs/PIPELINE.md`.

- **Silent font fallback.** `resvg` substitutes the default family without warning. Run `assertFaces` from `src/fontguard.mjs` before producing any specimen sheet.

- **Figure/ground inversion.** A light shape touching a light frame on two sides bridges them and the eye promotes the background to figure. Inset the flow, or bleed it deliberately.

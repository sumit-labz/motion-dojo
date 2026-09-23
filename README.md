# Motion Dojo

A local practice playground for directing motion design in the browser. You are the
director, not the coder: you describe what a beat should feel like, in plain language, and
the actual `rep.js` — the GSAP/timeline code — gets written for you (by Claude, in
conversation) and staged into this repo. You never write GSAP syntax yourself. The harness
supplies the stage, controls, and export; your job is planning (layout, storyboard, which
typographic move a line calls for) and judging (which built variation is true).

## Setup (one time)

```bash
npm install
```

`ffmpeg` (with `ffprobe`) must be on your PATH for `npm run export` (see the error message
it prints if missing). Rendering itself goes through
[HyperFrames](https://github.com/heygen-com/hyperframes) (a devDependency, invoked via
`npx hyperframes`), which owns its own headless Chrome — nothing else to install.

## Daily workflow

Self-paced, not one-a-day. `npm run curriculum` shows how far through the phase bank you
are, so there's always a next session to bring rather than starting from a blank idea.

1. `npm run dev` — starts Vite.
2. `npm run rep` — pick a phase, hit Enter to accept the suggested next session (or type
   your own). This creates `reps/YYYY-MM-DD-NN/`, writes a starter `meta.json`
   (`status: "awaiting-direction"` — no `rep.js` yet), appends a row to `LOG.md`, and
   prints the exact prompt to bring to Claude. Answer "Another session now?" to queue up
   more than one before you start directing.
3. **Bring the printed prompt to Claude** — in this project's conversation, describe what
   the beat should feel like (weight, arrival, mood — plain language, not code). Claude
   writes `reps/<id>/rep.js` and stages it into this repo directly.
4. Open the rep's URL (`rep.html?id=<id>`) and use the harness controls (`Space` replay,
   `←`/`→` frame-step, `g` grid, `s` safe areas, `d` GSDevTools) to review what got built.
5. Judge: is this the true version? If not, go back to Claude and redirect — "make it feel
   more reluctant," "hold longer before it arrives" — rather than editing the code
   yourself. Repeat until it's right.
6. `npm run lint:reps` — fast static check that the rep obeys the HyperFrames contract
   (below). This still matters even though you didn't write the code — it's your
   guarantee the export will render correctly.
7. When happy, `npm run export -- <id>` to render `thumb.gif` + `out.mp4` into the rep's
   folder via HyperFrames.
8. Fill in the log row's last two columns — your judgment in your own words, and whether
   it's a real candidate for the piece.
9. Check `index.html` (the contact sheet) to browse everything and flag candidates.

**Storyboarding a scene (Phase 2), before any motion is built:**

1. Write a beat table as JSON — one entry per beat, `{ time, vo, mood, visual }` — either
   by hand or dictated to Claude, who writes the JSON file for you.
2. `npm run storyboard -- <beats.json> <id>` — builds a static `reps/<id>/storyboard.html`
   contact sheet: one card per beat, no motion, just the planned frame and its intent.
3. Open it in a browser. Review the sequence as a whole before committing to any timing.
4. Revise the beat table and regenerate until the storyboard is locked — this is where
   most of the director's judgment actually happens, cheaply, before Phase 4's build.

## Writing a rep that exports cleanly (HyperFrames constraints)

HyperFrames renders by **seeking** the timeline you return, frame by frame, out of
real-time order — it never just "plays" your rep. That constrains what `build(stage)` is
allowed to do, and it was already most of the rep contract; this just makes it load-bearing:

- `build(stage)` must **return** a `gsap.timeline({ paused: true })`. A timeline that
  isn't paused, or motion that lives outside the returned timeline, will render wrong or
  blank — HyperFrames only ever calls `.progress()`/`.seek()` on what you hand back.
- No `requestAnimationFrame`, `Date.now()`, `performance.now()`, or CSS
  `transition`/`animation`/`@keyframes`. Anything driven by the wall clock instead of the
  timeline is not seekable and will not render deterministically. Drive everything through
  GSAP tweens on the timeline you return.
- No CDN links, no hardcoded `http(s)://` URLs, no render-time network calls. A rep's
  fonts/assets must resolve from `src/assets/` (the shared local dir) or the rep's own
  folder — `stage.type()` already only uses the two locally-hosted variable fonts, so this
  mostly matters if you `stage.add()` raw HTML referencing an image or font yourself.
- `npm run lint:reps` checks all of the above statically across every rep and fails with
  the offending file and line — run it before `npm run export` catches the same thing
  the slow way.

## The rep contract

This is what Claude writes into `reps/<id>/rep.js` when you bring it a direction — you
never write this yourself, but it's worth knowing the shape so you can read a built rep
and know precisely what to ask to change.

```js
export default {
  meta: { title, phase, prompt, notes },
  aspect: '16:9', // '16:9' | '4:5' | '9:16'
  build(stage) {
    // stage.el                          -> the stage DOM element
    // stage.add(html)                   -> appends string/Node, returns element(s)
    // stage.type(text, {size, weight, tracking, font}) -> a styled text element
    // must RETURN a paused gsap timeline
  },
}
```
Never call `.play()`/`.pause()` yourself, don't handle resize, don't load fonts — the
harness does all of that.

## A/B mode

`rep.html?id=X&vs=Y` mounts both reps side by side under one shared scrub slider and
replay button. Scrubbing/replay drive each timeline by **normalized progress (0–1)**, so
the slider compares the *shape* of two eases regardless of duration; timeScale applies to
both equally. Frame-step (`←`/`→`) instead moves each timeline by an absolute 1/60s,
clamped to its own duration, since a frame-accurate nudge should mean the same physical
time for both.

## Self-paced curriculum

`curriculum.json` is a bank of director-direction sessions grouped into phases:

- **Phase 1 — Layout and staging.** Composition, weight, anchor — a still frame, no
  motion at all.
- **Phase 2 — Storyboarding.** Beat tables, `storyboard.html` review, locking a sequence
  before any timing is built.
- **Phase 3 — Kinetic typography, when to use what.** A decision table (which reveal move
  reads as what, and when each one actively hurts), applied to real script lines.
- **Phase 4 — Motion as direction.** Timing and weight, applied to the locked storyboard
  and Phase 3's type-move decisions.
- **Phase 5 — Space and camera.** The director's vocabulary for 3D (lens, height, depth,
  light as staging) — entered only when a beat genuinely needs it.

None of these phases ask you to learn animation syntax. Each session is a direction you
give in plain language; what gets built is Claude's job. It's a session bank, not a
schedule — no "complete phase 1 before touching phase 2" gate, jump around as your actual
Story Dojo work demands.

- `npm run curriculum` — prints progress per phase (done/total, a progress bar, and the
  next un-logged session) plus an overall count.
- `npm run rep` reads the same data: for whichever phase you pick, it suggests the next
  session you haven't logged yet and pre-fills it on Enter. "Done" means a `meta.json`
  exists in `reps/` with that phase and a matching prompt — completion is read live off
  the reps folder, not tracked separately, so it can't drift out of sync.
- Once a phase's sessions are exhausted, `npm run rep` says so and lets you free-session
  (type any prompt) instead of blocking you.
- Add/reorder/edit sessions directly in `curriculum.json` any time — it's just data.

## Scripts

- `npm run dev` — Vite dev server.
- `npm run rep` — creates a session's folder + starter `meta.json` + log row, and prints
  the prompt to bring to Claude. Does not write `rep.js` — that's Claude's job, in
  conversation. Loops so one run can queue up several sessions.
- `npm run curriculum` — self-paced progress dashboard (see above).
- `npm run storyboard -- <beats.json> <id>` — Phase 2 tool: builds a static
  `reps/<id>/storyboard.html` contact sheet from a beat table (`{ time, vo, mood, visual }`
  per beat). No motion, no GSAP — a planning artifact to review and lock before Phase 4
  builds any timing.
- `npm run lint:reps` — static HyperFrames-compatibility check across every `reps/*/rep.js`.
- `npm run export -- <id>` — wraps the rep into a throwaway HyperFrames composition,
  renders it, and writes `out.mp4` + `thumb.gif` (720px wide, ≤4s, palette-optimized) into
  `reps/<id>/`, then stamps `meta.json.fps`/`meta.json.duration` from the actual render.
  Does **not** need `npm run dev` running — HyperFrames renders the composition standalone.
  - `--fps 30|60` — render frame rate (default `60`; reps are always authored/scrubbed at
    60fps in the harness regardless of export fps).
  - `--aspect 16:9|4:5|9:16` — export at a different aspect than the rep's own `aspect`
    field, without editing the rep file.
  - `--keep` — don't delete the generated `.hf-export/<id>/` composition after
    rendering; see [HYPERFRAMES.md](HYPERFRAMES.md) for what's in it.
- `npm run index` — optional: writes a static `reps-index.json` snapshot. Not needed day
  to day — the contact sheet reads `/api/reps` live from a Vite dev middleware, so a
  freshly-created rep shows up on refresh with zero build step.

## Implementation calls made where the spec left things open

- **Fonts**: self-hosted [Inter Variable](https://github.com/rsms/inter) (display/body)
  and [JetBrains Mono Variable](https://github.com/JetBrains/JetBrainsMono)
  (timecodes/labels), downloaded as `.woff2` into `src/assets/fonts/`. Both are true
  variable fonts across a wide weight range, so `stage.type({weight})` and
  `gsap.to(el, {fontVariationSettings: "'wght' 700"})` both work for animatable weight.
- **A/B sync model**: normalized progress (0–1), not absolute time against the longer
  duration — see A/B mode section above for reasoning.
- **HMR behavior**: `harness.js` calls `import.meta.hot.accept()` so saving `rep.js` fully
  re-runs `build()` in place (no page reload, no lost scrub/grid/safe-area state). If this
  ever proves flaky, delete that call — Vite will fall back to a full reload, which the
  original spec also called acceptable.
- **Candidate persistence**: a tiny Vite dev-server middleware (`scripts/vite-plugin-
  candidates.js`) — `POST /api/candidate` writes `candidate: true/false` straight into
  that rep's `meta.json`. No separate `candidates.json` to reconcile.
- **Contact sheet data source**: a second dev middleware (`scripts/vite-plugin-reps-
  api.js`) serves `GET /api/reps`, reading `reps/*/meta.json` live on every request. `npm
  run index` remains as an optional static-export escape hatch, not part of the daily
  loop.
- **Headless capture tool**: Playwright over Puppeteer, for its built-in element
  screenshot API and steadier Windows support.
- **Record viewport**: fixed at 1280×720 regardless of a rep's aspect — the `.stage`
  element itself (letterboxed inside that viewport) is what actually gets screenshotted,
  so this only needs to be "big enough," not aspect-matched.
- **GSDevTools + A/B mode**: only attaches to session A when in A/B mode — the plugin
  doesn't natively support driving two independent timelines from one panel.
- **`new-rep.js` title**: no separate "title" prompt; the title is the prompt text itself
  (truncated to ~60 chars), so the CLI only ever asks the two questions named in the spec.
- **HyperFrames export (`scripts/export.js` + `scripts/lib/hf-compose.js`)**: each export
  generates a throwaway, standalone HyperFrames project under `.hf-export/<id>/`
  (git-ignored, deleted after render) — a minimal `index.html` with a sized `#hf-root`,
  a locally-vendored `gsap.min.js` (copied from `node_modules`, no CDN), the two shared
  fonts copied alongside it, and the rep's `build(stage)` bundled via `esbuild` (aliasing
  the `gsap` import to a one-line `window.gsap` shim) and **inlined** into a `<script>`
  tag — HyperFrames' lint/duration-inference statically parses inline script content for
  `window.__timelines[...]`, so an external `<script src>` bundle is invisible to it and
  was the cause of a `root_composition_missing_duration_source` lint failure during
  development; inlining fixed it.
- **Export stage vs. dev stage**: export uses a separate, smaller `createExportStage`
  (`scripts/lib/export-stage.js`) instead of `src/stage.js`. The dev harness's stage
  letterboxes a fixed-aspect box inside an arbitrary browser viewport; a HyperFrames
  composition's root already **is** the exact render canvas (sized via
  `data-width`/`data-height`), so there's no letterboxing to do, and grid/safe-area
  overlays (editing aids only) are no-ops there so they can never leak into a render.
- **Duration**: the composition's root `data-duration` is intentionally omitted —
  HyperFrames infers render length from the registered GSAP timeline. The actual duration
  written to `meta.json` comes from `ffprobe`-ing the rendered `out.mp4` after the fact,
  which sidesteps needing a separate browser probe just to read `timeline.duration()`.
- **GIF thumbnail**: derived from the rendered `out.mp4` via a two-pass ffmpeg palette
  encode (same approach as before), rather than HyperFrames' own `--format gif` output —
  simpler than teaching the composition generator two different canvas sizes, and ffmpeg
  is already a required dependency either way.
- **Headless browser dependency removed**: Playwright is no longer a devDependency — the
  old `record.js` used it to drive frame-by-frame capture by hand; HyperFrames' `render`
  owns headless Chrome itself now. Its one other job, the `window.__motionDojo` debug hook
  in `harness.js`, was removed along with it since nothing else read it.
- **`esbuild` as an explicit devDependency**: only used to bundle a rep for export
  (aliasing `gsap` to the local shim). It was already present transitively (via Vite and
  HyperFrames), but importing it directly from `scripts/lib/hf-compose.js` without
  declaring it would be fragile if either of those stopped depending on it.
- **Self-paced curriculum, not a daily cap**: "too little to learn in one day" was solved
  by (a) making `npm run rep` loop so one sitting can produce as many sessions as you want
  — the tool never limited this, `nextId()` already auto-increments `NN` per day, the
  constraint was purely UX — and (b) a `curriculum.json` session bank so you're never stuck
  inventing a prompt. Completion is derived live from `reps/*/meta.json` (phase + matching
  prompt) rather than tracked in a separate progress file, so it can't drift out of sync
  with what you've actually logged.
- **Direction, not hand-authoring (later revision)**: the curriculum moved from "you write
  `rep.js` yourself, phases are GSAP-syntax topics" to "you direct in plain language,
  Claude writes `rep.js`, phases are design-judgment topics (layout, storyboarding,
  typographic decision-making, timing, 3D-as-vocabulary)." `curriculum.json` and
  `new-rep.js` were rewritten for this: sessions are now direction prompts, not syntax
  exercises, and `new-rep.js` no longer scaffolds a blank template — it creates the
  bookkeeping (folder, `meta.json` with `status: "awaiting-direction"`, log row) and prints
  the prompt to bring to Claude, who writes and stages the actual `rep.js`. The rep
  contract, harness, lint, and export pipeline are all unchanged — this only changes who
  authors the code inside that contract, not the contract itself.
- **Storyboarding added (`scripts/storyboard.js`)**: a new Phase 2 planning tool, matching
  a real HyperFrames convention (an agent-authored `storyboard.html` proposal, reviewed
  before any motion is built). Takes a JSON beat table (`{ time, vo, mood, visual }`) and
  renders a static, styled contact sheet — same font/color tokens as the export stage, no
  GSAP, no timeline. Exists so sequence-level judgment (does this order of beats make
  sense) happens cheaply as a static review pass before Phase 4 commits to any timing.

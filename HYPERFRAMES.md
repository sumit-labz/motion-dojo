# HyperFrames in Motion Dojo

[HyperFrames](https://github.com/heygen-com/hyperframes) is HeyGen's open-source
HTML-to-video renderer. Motion Dojo uses it as the export backend: `npm run export`
wraps a rep's `build(stage)` into a small HyperFrames "composition" (a plain HTML file
with a few `data-*` timing attributes) and asks HyperFrames to render it to MP4/GIF.

You never write a composition by hand here — `scripts/export.js` generates one
per-export into `.hf-export/<id>/` and deletes it afterward. This doc is about the tool
underneath that, in case you want to poke at it directly or use it outside this repo.

## The core idea

A HyperFrames composition is an HTML page where:

- One root `<div data-composition-id="...">` declares the canvas size
  (`data-width`/`data-height`).
- Motion comes from **exactly one paused GSAP timeline**, registered on
  `window.__timelines["<composition-id>"]`.
- HyperFrames renders by **seeking** that timeline frame-by-frame in a headless
  browser — it never plays it in real time. That's why the timeline must be paused and
  fully seekable, and why nothing in a composition may depend on the wall clock
  (`Date.now()`, `requestAnimationFrame`, CSS `transition`/`animation`, network fetches at
  render time — see [determinism rules](#determinism-rules) below).

That's the entire contract. Everything else — layout, fonts, images, sub-compositions,
audio — is ordinary HTML/CSS layered on top of it.

## How motion-dojo's adapter uses it

`scripts/export.js` + `scripts/lib/hf-compose.js`, for a given rep id:

1. Reads `reps/<id>/rep.js` to get its `aspect` (or takes `--aspect` override).
2. Builds a throwaway project in `.hf-export/<id>/`:
   - `index.html` — the composition: a sized `#hf-root`, a local (not CDN) copy of
     `gsap.min.js`, the two shared fonts copied alongside it, and the rep's
     `build(stage)` bundled via `esbuild` and **inlined** into a `<script>` tag.
   - The rep's own `gsap` import is aliased to a one-line shim
     (`export const gsap = window.gsap`) so it shares the same GSAP instance the
     vendored script loaded — no network, no duplicate GSAP copies.
3. Runs `npx hyperframes lint` on the generated project — a fast static check, no
   browser spin-up, that catches structural mistakes (missing timeline registration,
   CSS/GSAP conflicts) before wasting time rendering.
4. Runs `npx hyperframes render` to produce `out.mp4`.
5. `ffprobe`s the result for the real duration, writes it (+ the fps used) into
   `meta.json`.
6. Derives `thumb.gif` from `out.mp4` via ffmpeg (not HyperFrames' own `--format gif`,
   which would need a second differently-sized render).
7. Deletes `.hf-export/<id>/`.

## Determinism rules

These are the rules `npm run lint:reps` checks statically across every rep, and the ones
HyperFrames itself enforces at render time:

- Motion goes through the returned, paused `gsap.timeline()` — nothing else.
- No `Date.now()`, `performance.now()`, `requestAnimationFrame`, `setInterval` for visual
  state.
- No CSS `transition`, `animation`, `@keyframes`.
- No unseeded `Math.random()` (fine if you want it, just seed it).
- No render-time network fetches — fonts/assets must be local.

## Commands worth knowing

These aren't part of the daily motion-dojo loop (that's just `npm run export`), but
they're how you'd work with HyperFrames directly — e.g. debugging a generated
composition, or starting an unrelated HyperFrames project from scratch.

```bash
# Inspect what export.js generated instead of letting it clean up after itself:
npm run export -- <id> --keep
# → leaves the composition at .hf-export/<id>/ (normally deleted after render)

# Preview a composition in the full Studio timeline editor (hot-reloads on save):
npx hyperframes preview --background <project-dir>
# → prints a URL like http://localhost:3002/#project/<name>

# Fast static check (structure only, no browser):
npx hyperframes lint <project-dir>

# Full gate: lint + runtime errors + layout + contrast (opens a browser):
npx hyperframes check <project-dir>

# Render to MP4 (or gif/webm/mov/png-sequence):
npx hyperframes render <project-dir> --fps 60 --quality looks --output out.mp4

# Scaffold a brand-new HyperFrames project (not what motion-dojo does, but how you'd
# start one on its own):
npx hyperframes init my-video

# Search HyperFrames' registry of ready-made motion primitives before hand-authoring one:
npx hyperframes catalog --query "reveal a headline one line at a time"
```

`npx hyperframes docs <topic>` gives terminal-local reference on `data-attributes`,
`gsap`, `compositions`, `rendering`, `examples`, `troubleshooting` — no network needed.

## Where to go deeper

The agent skills installed for this machine (`~/.claude/skills/hyperframes-*`) are the
canonical reference — `hyperframes-core` for the composition contract,
`hyperframes-cli` for every command and flag, `hyperframes-animation` for GSAP/other
runtime specifics. They're written for an AI agent to follow, but they're plain markdown
and worth reading directly if you want the full picture rather than this repo-scoped
summary.

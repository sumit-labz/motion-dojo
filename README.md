# Motion Dojo

A local daily-rep playground for practising motion design in the browser. One rep = one
small GSAP animation exercise in its own file. The harness supplies the stage, controls,
and recording — you only ever write `build(stage)`.

## Setup (one time)

```bash
npm install
npx playwright install chromium
```

`ffmpeg` must also be on your PATH for `npm run record` (see error message it prints if
missing).

## Daily workflow

1. `npm run dev` — starts Vite.
2. `npm run rep` — answers two prompts (phase number, prompt/brief), scaffolds
   `reps/YYYY-MM-DD-NN/`, appends a row to `LOG.md`, and prints the rep's URL.
3. Open that URL, edit `reps/<id>/rep.js`, save — Vite HMR re-runs `build()` live, no
   reload.
4. Use the harness controls (or keyboard: `Space` replay, `←`/`→` frame-step, `g` grid,
   `s` safe areas, `d` GSDevTools) to study the move.
5. When happy, `npm run record -- <id>` to render `thumb.gif` + `out.mp4` into the rep's
   folder.
6. Fill in the last two columns of the new `LOG.md` row ("what I learned about timing",
   "Candidate?").
7. Check `index.html` (the contact sheet) to browse everything and flag candidates.

## The rep contract

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

## Scripts

- `npm run dev` — Vite dev server.
- `npm run rep` — interactive new-rep scaffolder.
- `npm run record -- <id>` — deterministic 60fps frame capture (Playwright) → `thumb.gif`
  (720px wide, ≤4s) + `out.mp4` via ffmpeg. Requires `npm run dev` running in another
  terminal.
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

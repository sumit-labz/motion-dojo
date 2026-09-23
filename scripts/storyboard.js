import fs from 'node:fs';
import path from 'node:path';

// Builds a static storyboard.html contact sheet from a beat table — the
// director-planning artifact for Phase 2. No motion, no GSAP: this is a
// review page for locking a sequence of beats before Phase 4 builds any
// timing at all.
//
// Usage: node scripts/storyboard.js <beats-json-path> <output-id>
//   beats-json-path: a JSON array of { time, vo, mood, visual } objects.
//   output-id: written to reps/<output-id>/storyboard.html
//
// Example beats file:
// [
//   { "time": "0:00–0:04", "vo": "Inception doesn't end. It stops.",
//     "mood": "Cold, precise, analyst voice.",
//     "visual": "A single line of text, centered, held. No motion yet." },
//   ...
// ]

const ROOT = process.cwd();

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function beatCard(beat, index) {
  return `
    <article class="beat">
      <header class="beat-header">
        <span class="beat-index">${String(index + 1).padStart(2, '0')}</span>
        <span class="beat-time">${escapeHtml(beat.time || '')}</span>
      </header>
      <div class="beat-frame">
        <p class="beat-visual">${escapeHtml(beat.visual || '(visual description)')}</p>
      </div>
      <dl class="beat-meta">
        <dt>VO</dt>
        <dd class="beat-vo">${escapeHtml(beat.vo || '—')}</dd>
        <dt>Mood</dt>
        <dd class="beat-mood">${escapeHtml(beat.mood || '—')}</dd>
      </dl>
    </article>`;
}

function css() {
  return `
    @font-face {
      font-family: 'Inter Variable';
      src: url('/src/assets/fonts/InterVariable.woff2') format('woff2');
      font-weight: 100 900;
      font-style: normal;
    }
    @font-face {
      font-family: 'JetBrains Mono Variable';
      src: url('/src/assets/fonts/JetBrainsMono-Variable.ttf') format('truetype');
      font-weight: 100 800;
      font-style: normal;
    }
    :root {
      --bg: #0e0e10;
      --ink: #f5f5f0;
      --dim: #6a6a70;
      --accent: #ff5a36;
      --font-inter: 'Inter Variable', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono Variable', Consolas, monospace;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--font-inter); }
    body { padding: 3rem 2rem 6rem; }
    h1 { font-size: 1.4rem; font-weight: 600; margin: 0 0 0.25rem; }
    .subtitle { font-family: var(--font-mono); color: var(--dim); font-size: 0.85rem; margin: 0 0 3rem; }
    .board {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
      max-width: 1400px;
    }
    .beat {
      border: 1px solid #232326;
      border-radius: 10px;
      overflow: hidden;
      background: #141416;
    }
    .beat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 1rem;
      border-bottom: 1px solid #232326;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--dim);
    }
    .beat-index { color: var(--accent); font-weight: 700; }
    .beat-frame {
      aspect-ratio: 16 / 9;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: #0a0a0b;
    }
    .beat-visual {
      margin: 0;
      text-align: center;
      font-size: 1.05rem;
      line-height: 1.5;
      color: var(--ink);
    }
    .beat-meta { margin: 0; padding: 1rem; font-size: 0.85rem; }
    .beat-meta dt {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--dim);
      margin-top: 0.6rem;
    }
    .beat-meta dt:first-child { margin-top: 0; }
    .beat-meta dd { margin: 0.2rem 0 0; line-height: 1.4; }
    .beat-vo { font-style: italic; }
  `;
}

function buildStoryboardHtml({ title, beats }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)} — storyboard</title>
    <style>${css()}</style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p class="subtitle">Storyboard — static frames, no motion. Locked here before Phase 4 builds any timing.</p>
    <div class="board">
      ${beats.map(beatCard).join('\n')}
    </div>
  </body>
</html>
`;
}

function main() {
  const [, , beatsPath, outputId] = process.argv;
  if (!beatsPath || !outputId) {
    console.error('Usage: node scripts/storyboard.js <beats-json-path> <output-id>');
    console.error('  beats-json-path: JSON array of { time, vo, mood, visual }');
    console.error('  output-id: writes to reps/<output-id>/storyboard.html');
    process.exit(1);
  }

  if (!fs.existsSync(beatsPath)) {
    console.error(`No beats file found at ${beatsPath}`);
    process.exit(1);
  }

  const beats = JSON.parse(fs.readFileSync(beatsPath, 'utf-8'));
  if (!Array.isArray(beats) || beats.length === 0) {
    console.error('Beats file must be a non-empty JSON array of { time, vo, mood, visual } objects.');
    process.exit(1);
  }

  const outDir = path.join(ROOT, 'reps', outputId);
  fs.mkdirSync(outDir, { recursive: true });

  const html = buildStoryboardHtml({ title: outputId, beats });
  const outPath = path.join(outDir, 'storyboard.html');
  fs.writeFileSync(outPath, html);

  console.log(`\nStoryboard written: reps/${outputId}/storyboard.html`);
  console.log(`Open it directly in a browser (file://) or via the Vite dev server if it's running.\n`);
}

main();

import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';

const ROOT = process.cwd();
const FONTS_SRC = path.join(ROOT, 'src', 'assets', 'fonts');
const GSAP_MIN = path.join(ROOT, 'node_modules', 'gsap', 'dist', 'gsap.min.js');

const FONT_FILES = ['InterVariable.woff2', 'InterVariable-Italic.woff2', 'JetBrainsMono-Variable.ttf'];

function css() {
  return `
    @font-face {
      font-family: 'Inter Variable';
      src: url('./fonts/InterVariable.woff2') format('woff2');
      font-weight: 100 900;
      font-style: normal;
    }
    @font-face {
      font-family: 'Inter Variable';
      src: url('./fonts/InterVariable-Italic.woff2') format('woff2');
      font-weight: 100 900;
      font-style: italic;
    }
    @font-face {
      font-family: 'JetBrains Mono Variable';
      src: url('./fonts/JetBrainsMono-Variable.ttf') format('truetype');
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
      --fs-1: 1rem;
      --fs-2: 1.6rem;
      --fs-3: 3rem;
      --fs-4: 5rem;
      --fs-5: 8rem;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; }
    body { font-family: var(--font-inter); }
  `;
}

/**
 * Builds a standalone HyperFrames composition for one rep into
 * .hf-export/<id>/ and returns its directory + canvas size.
 */
export function buildHfProject({ id, width, height }) {
  const outDir = path.join(ROOT, '.hf-export', id);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'fonts'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'vendor'), { recursive: true });

  fs.copyFileSync(GSAP_MIN, path.join(outDir, 'vendor', 'gsap.min.js'));
  for (const f of FONT_FILES) {
    fs.copyFileSync(path.join(FONTS_SRC, f), path.join(outDir, 'fonts', f));
  }

  const shimPath = path.join(outDir, '_gsap-shim.js');
  fs.writeFileSync(shimPath, 'export const gsap = window.gsap;\n');

  const repAbsPath = path.join(ROOT, 'reps', id, 'rep.js');
  const stageAbsPath = path.join(ROOT, 'scripts', 'lib', 'export-stage.js');
  const entryPath = path.join(outDir, '_entry.js');
  fs.writeFileSync(
    entryPath,
    [
      `import { createExportStage } from ${JSON.stringify(stageAbsPath)};`,
      `import repDef from ${JSON.stringify(repAbsPath)};`,
      '',
      "const root = document.getElementById('hf-root');",
      'const stage = createExportStage(root);',
      'const tl = repDef.build(stage);',
      `window.__timelines[${JSON.stringify(id)}] = tl;`,
      '',
    ].join('\n')
  );

  const bundle = esbuild.buildSync({
    entryPoints: [entryPath],
    bundle: true,
    format: 'iife',
    write: false,
    alias: { gsap: shimPath },
    logLevel: 'silent',
  });
  const bundleCode = bundle.outputFiles[0].text;

  // HyperFrames' compiler/lint statically parses inline <script> content for
  // the window.__timelines registration and duration source — an external
  // <script src> is invisible to that pass, so the bundle is inlined rather
  // than written to its own file.
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${width}, height=${height}" />
    <title>${id}</title>
    <style>${css()}</style>
  </head>
  <body>
    <div
      id="hf-root"
      data-composition-id="${id}"
      data-start="0"
      data-width="${width}"
      data-height="${height}"
      style="position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--bg)"
    ></div>
    <script src="./vendor/gsap.min.js"></script>
    <script>
${bundleCode}
    </script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  fs.writeFileSync(
    path.join(outDir, 'meta.json'),
    JSON.stringify({ id, name: id }, null, 2) + '\n'
  );

  return { dir: outDir, width, height };
}

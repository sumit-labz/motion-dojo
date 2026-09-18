import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { buildHfProject } from './lib/hf-compose.js';

const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const ASPECT_SIZES = {
  '16:9': [1280, 720],
  '4:5': [1080, 1350],
  '9:16': [720, 1280],
};

function parseArgs(argv) {
  const args = { id: null, fps: 60, aspect: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fps') args.fps = Number(argv[++i]);
    else if (a === '--aspect') args.aspect = argv[++i];
    else if (!args.id) args.id = a;
  }
  return args;
}

function checkFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    execFileSync('ffprobe', ['-version'], { stdio: 'ignore' });
  } catch {
    console.error(
      [
        'ffmpeg/ffprobe not found on PATH.',
        'Install it first:',
        '  Windows (winget):  winget install Gyan.FFmpeg',
        '  Windows (choco):   choco install ffmpeg',
        '  macOS (brew):      brew install ffmpeg',
        '',
        'Then re-run: npm run export -- <id>',
      ].join('\n')
    );
    process.exit(1);
  }
}

async function run() {
  const { id, fps, aspect: aspectOverride } = parseArgs(process.argv.slice(2));

  if (!id) {
    console.error('Usage: npm run export -- <id> [--fps 30|60] [--aspect 16:9|4:5|9:16]');
    process.exit(1);
  }
  if (![24, 30, 60].includes(fps)) {
    console.error('--fps must be 30 or 60 (24 also accepted by the renderer).');
    process.exit(1);
  }

  const repPath = path.join('reps', id, 'rep.js');
  if (!fs.existsSync(repPath)) {
    console.error(`No rep found at ${repPath}`);
    process.exit(1);
  }

  checkFfmpeg();

  const repDef = (await import(pathToFileURL(path.resolve(repPath)).href)).default;
  const aspect = aspectOverride || repDef.aspect || '16:9';
  if (!ASPECT_SIZES[aspect]) {
    console.error(`Unknown aspect "${aspect}". Expected one of: ${Object.keys(ASPECT_SIZES).join(', ')}`);
    process.exit(1);
  }
  const [width, height] = ASPECT_SIZES[aspect];

  console.log(`Composing ${id} for HyperFrames (${aspect}, ${width}x${height})...`);
  const { dir } = buildHfProject({ id, width, height });

  console.log('Linting the generated composition...');
  execFileSync(NPX, ['hyperframes', 'lint', dir], { stdio: 'inherit', shell: true });

  const outDir = path.join('reps', id);
  const mp4Path = path.join(outDir, 'out.mp4');
  const gifPath = path.join(outDir, 'thumb.gif');

  console.log(`Rendering ${id} via HyperFrames (${fps}fps)...`);
  execFileSync(
    NPX,
    ['hyperframes', 'render', dir, '--fps', String(fps), '--quality', 'looks', '--output', path.resolve(mp4Path)],
    { stdio: 'inherit', shell: true }
  );

  const durationStr = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    mp4Path,
  ]).toString().trim();
  const duration = Math.round(Number(durationStr) * 1000) / 1000;

  console.log('Encoding thumb.gif...');
  const framesDir = path.join(outDir, '__gif_frames__');
  fs.mkdirSync(framesDir, { recursive: true });
  const palettePath = path.join(framesDir, 'palette.png');
  const gifFilter = 'fps=24,scale=720:-1:flags=lanczos';

  execFileSync('ffmpeg', [
    '-y', '-i', mp4Path,
    '-t', '4',
    '-vf', `${gifFilter},palettegen`,
    palettePath,
  ]);
  execFileSync('ffmpeg', [
    '-y', '-i', mp4Path,
    '-i', palettePath,
    '-t', '4',
    '-lavfi', `${gifFilter}[x];[x][1:v]paletteuse`,
    gifPath,
  ]);
  fs.rmSync(framesDir, { recursive: true, force: true });

  const metaPath = path.join(outDir, 'meta.json');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  meta.fps = fps;
  meta.duration = duration;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');

  fs.rmSync(dir, { recursive: true, force: true });

  console.log(`\nDone (${duration}s @ ${fps}fps):\n  ${mp4Path}\n  ${gifPath}\n`);
}

run();

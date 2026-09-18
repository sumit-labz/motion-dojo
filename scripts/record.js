import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DEV_URL = 'http://localhost:5173';

function checkFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  } catch {
    console.error(
      [
        'ffmpeg not found on PATH.',
        'Install it first:',
        '  Windows (winget):  winget install Gyan.FFmpeg',
        '  Windows (choco):   choco install ffmpeg',
        '  macOS (brew):      brew install ffmpeg',
        '',
        'Then re-run: npm run record -- <id>',
      ].join('\n')
    );
    process.exit(1);
  }
}

async function checkDevServer() {
  try {
    await fetch(DEV_URL);
  } catch {
    console.error(`Dev server not running at ${DEV_URL}. Start it with: npm run dev`);
    process.exit(1);
  }
}

async function run(id) {
  const repPath = path.join('reps', id, 'rep.js');
  if (!fs.existsSync(repPath)) {
    console.error(`No rep found at ${repPath}`);
    process.exit(1);
  }

  checkFfmpeg();
  await checkDevServer();

  const outDir = path.join('reps', id);
  const framesDir = path.join(outDir, '__frames__');
  fs.mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`${DEV_URL}/rep.html?id=${id}`);
  await page.waitForSelector('.stage');
  await page.waitForFunction(() => Boolean(window.__motionDojo && window.__motionDojo.timeline));

  const totalFrames = Math.round(
    await page.evaluate(() => window.__motionDojo.timeline.duration() * 60)
  );

  console.log(`Rendering ${totalFrames} frames...`);

  const stageHandle = page.locator('.stage');
  for (let f = 0; f <= totalFrames; f++) {
    await page.evaluate(
      ({ f, total }) => {
        window.__motionDojo.timeline.pause().progress(total === 0 ? 1 : f / total);
      },
      { f, total: totalFrames }
    );
    await stageHandle.screenshot({ path: path.join(framesDir, `frame-${String(f).padStart(4, '0')}.png`) });
  }

  await browser.close();

  const gifFrameCap = Math.min(totalFrames + 1, Math.round(4 * 60));
  const framePattern = path.join(framesDir, 'frame-%04d.png');
  const thumbPath = path.join(outDir, 'thumb.gif');
  const mp4Path = path.join(outDir, 'out.mp4');

  console.log('Encoding thumb.gif...');
  const palettePath = path.join(framesDir, 'palette.png');
  const gifFilter = 'fps=24,scale=720:-1:flags=lanczos';
  execFileSync('ffmpeg', [
    '-y',
    '-framerate', '60',
    '-i', framePattern,
    '-frames:v', String(gifFrameCap),
    '-vf', `${gifFilter},palettegen`,
    palettePath,
  ]);
  execFileSync('ffmpeg', [
    '-y',
    '-framerate', '60',
    '-i', framePattern,
    '-i', palettePath,
    '-frames:v', String(gifFrameCap),
    '-lavfi', `${gifFilter}[x];[x][1:v]paletteuse`,
    thumbPath,
  ]);

  console.log('Encoding out.mp4...');
  execFileSync('ffmpeg', [
    '-y',
    '-framerate', '60',
    '-i', framePattern,
    '-pix_fmt', 'yuv420p',
    '-vf', 'scale=1280:-2',
    mp4Path,
  ]);

  fs.rmSync(framesDir, { recursive: true, force: true });

  console.log(`\nDone:\n  ${thumbPath}\n  ${mp4Path}\n`);
}

const id = process.argv[2];
if (!id) {
  console.error('Usage: npm run record -- <id>');
  process.exit(1);
}

run(id);

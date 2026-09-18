import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { GSDevTools } from 'gsap/GSDevTools';
import { createStage } from './stage.js';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer, GSDevTools);

const FRAME = 1 / 60;
const repModules = import.meta.glob('/reps/*/rep.js');

let sessions = [];
let gridOn = false;
let safeOn = false;
let devToolsOn = false;
let devToolsInstance = null;
let scrubbing = false;
let tickerAttached = false;

function readParams() {
  const p = new URLSearchParams(location.search);
  return { id: p.get('id'), vs: p.get('vs') };
}

async function loadRep(id) {
  const key = `/reps/${id}/rep.js`;
  const loader = repModules[key];
  if (!loader) throw new Error(`No rep found for id "${id}"`);
  const mod = await loader();
  return mod.default;
}

async function mountRep(id, containerEl) {
  const repDef = await loadRep(id);
  const stage = createStage(containerEl, { aspect: repDef.aspect });
  const timeline = repDef.build(stage);
  if (!timeline || typeof timeline.progress !== 'function') {
    throw new Error(`rep "${id}" build() must return a gsap timeline`);
  }
  if (!timeline.paused()) {
    console.warn(`rep "${id}" returned a timeline that wasn't paused; pausing it.`);
    timeline.pause(0);
  }
  return { id, repDef, stage, timeline, containerEl };
}

function renderError(containerEl, message) {
  containerEl.innerHTML = `<div class="stage-error">${message}</div>`;
}

function longestDuration() {
  return Math.max(...sessions.map((s) => s.timeline.duration()));
}

function currentDisplayProgress() {
  return Math.max(...sessions.map((s) => s.timeline.progress()));
}

function replay() {
  sessions.forEach((s) => s.timeline.progress(0).play());
  startTickerIfNeeded();
}

function scrubTo(progress) {
  sessions.forEach((s) => s.timeline.pause().progress(progress));
}

function setTimeScale(value, toolbarEl) {
  sessions.forEach((s) => s.timeline.timeScale(value));
  toolbarEl.querySelectorAll('[data-timescale]').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.timescale) === value);
  });
}

function frameStep(direction) {
  sessions.forEach((s) => {
    const t = s.timeline.time();
    const dur = s.timeline.duration();
    const next = gsap.utils.clamp(0, dur, t + direction * FRAME);
    s.timeline.pause().time(next);
  });
  updateReadout();
  syncSlider();
}

function updateReadout() {
  const readout = document.getElementById('readout');
  if (!readout) return;
  const parts = sessions.map((s, i) => {
    const t = s.timeline.time();
    const dur = s.timeline.duration();
    const frame = Math.round(t * 60);
    const totalFrames = Math.round(dur * 60);
    const label = sessions.length > 1 ? (i === 0 ? 'A: ' : 'B: ') : '';
    return `${label}${t.toFixed(3)}s (f ${frame}/${totalFrames}) — dur ${dur.toFixed(2)}s`;
  });
  readout.innerHTML = `<strong>${parts.join(' &nbsp;·&nbsp; ')}</strong>`;
}

function syncSlider() {
  const slider = document.getElementById('scrub');
  if (!slider || scrubbing) return;
  slider.value = String(currentDisplayProgress());
}

function startTickerIfNeeded() {
  if (tickerAttached) return;
  tickerAttached = true;
  gsap.ticker.add(tick);
}

function tick() {
  syncSlider();
  updateReadout();
  if (sessions.every((s) => s.timeline.progress() >= 1)) {
    gsap.ticker.remove(tick);
    tickerAttached = false;
  }
}

function buildControls(toolbarEl) {
  toolbarEl.innerHTML = '';

  const replayBtn = document.createElement('button');
  replayBtn.textContent = '⟲ Replay';
  replayBtn.addEventListener('click', replay);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.id = 'scrub';
  slider.min = '0';
  slider.max = '1';
  slider.step = '0.0001';
  slider.value = '0';
  slider.tabIndex = -1;
  slider.addEventListener('pointerdown', () => {
    scrubbing = true;
    sessions.forEach((s) => s.timeline.pause());
  });
  slider.addEventListener('input', () => {
    scrubTo(Number(slider.value));
    updateReadout();
  });
  slider.addEventListener('pointerup', () => {
    scrubbing = false;
  });

  const timeScaleGroup = document.createElement('div');
  timeScaleGroup.className = 'group';
  [0.25, 0.5, 1, 2].forEach((value) => {
    const btn = document.createElement('button');
    btn.textContent = `${value}x`;
    btn.dataset.timescale = String(value);
    if (value === 1) btn.classList.add('active');
    btn.addEventListener('click', () => setTimeScale(value, toolbarEl));
    timeScaleGroup.append(btn);
  });

  const gridBtn = document.createElement('button');
  gridBtn.textContent = 'Grid (g)';
  gridBtn.addEventListener('click', toggleGrid);

  const safeBtn = document.createElement('button');
  safeBtn.textContent = 'Safe (s)';
  safeBtn.addEventListener('click', toggleSafe);

  const devBtn = document.createElement('button');
  devBtn.textContent = 'DevTools (d)';
  devBtn.addEventListener('click', toggleDevTools);

  const readout = document.createElement('div');
  readout.id = 'readout';
  readout.className = 'readout';

  toolbarEl.append(replayBtn, slider, timeScaleGroup, gridBtn, safeBtn, devBtn, readout);
  updateReadout();
}

function toggleGrid() {
  gridOn = !gridOn;
  sessions.forEach((s) => s.stage.setGridVisible(gridOn));
}

function toggleSafe() {
  safeOn = !safeOn;
  sessions.forEach((s) => s.stage.setSafeAreaVisible(safeOn));
}

function toggleDevTools() {
  devToolsOn = !devToolsOn;
  const mount = document.getElementById('devtools-mount');
  if (devToolsOn) {
    mount.innerHTML = '';
    devToolsInstance = GSDevTools.create({ animation: sessions[0].timeline, container: '#devtools-mount' });
  } else if (devToolsInstance) {
    devToolsInstance.kill();
    devToolsInstance = null;
    mount.innerHTML = '';
  }
}

function wireKeyboard() {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      replay();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      frameStep(-1);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      frameStep(1);
    } else if (e.key === 'g') {
      toggleGrid();
    } else if (e.key === 's') {
      toggleSafe();
    } else if (e.key === 'd') {
      toggleDevTools();
    }
  });
}

let keyboardWired = false;

async function main() {
  const { id, vs } = readParams();
  const toolbarEl = document.getElementById('toolbar');
  const stageRow = document.getElementById('stage-row');
  const slotA = document.getElementById('stage-slot-a');
  const slotB = document.getElementById('stage-slot-b');
  const devtoolsMount = document.getElementById('devtools-mount');

  devtoolsMount.innerHTML = '';
  devToolsInstance = null;
  devToolsOn = false;
  sessions = [];

  if (!id) {
    renderError(slotA, 'No rep id given. Use rep.html?id=&lt;rep-id&gt;');
    return;
  }

  try {
    const a = await mountRep(id, slotA);
    sessions.push(a);

    if (vs) {
      stageRow.classList.add('ab-mode');
      slotB.hidden = false;
      const b = await mountRep(vs, slotB);
      sessions.push(b);
    } else {
      stageRow.classList.remove('ab-mode');
      slotB.hidden = true;
    }
  } catch (err) {
    renderError(slotA, String(err.message || err));
    return;
  }

  buildControls(toolbarEl);
  if (!keyboardWired) {
    wireKeyboard();
    keyboardWired = true;
  }

  // Automation hook for scripts/record.js — not part of the rep-author contract.
  window.__motionDojo = { timeline: sessions[0].timeline, stage: sessions[0].stage };
}

main();

if (import.meta.hot) {
  import.meta.hot.accept();
}

// RakshaPath 3D — page wiring. Every control on the page works through
// the same API the smoke test uses (window.RakshaPath).

import { createSim, armLabel } from './sim.js';
import { createScene } from './scene.js';

const sim = createSim();
const canvas = document.getElementById('scene');
const scene = createScene(canvas, sim);
scene.setInterventions(sim.cfg.interventions);

let playing = true;
let speed = 1;

// ---------- controls ----------
const btnPlay = document.getElementById('btnPlay');
function setPlaying(on) {
  playing = !!on;
  btnPlay.textContent = playing ? 'Pause' : 'Run';
}
btnPlay.addEventListener('click', () => setPlaying(!playing));

const segBtns = [...document.querySelectorAll('.seg button')];
function setSpeed(n) {
  speed = n;
  for (const b of segBtns) b.classList.toggle('on', Number(b.dataset.speed) === n);
}
segBtns.forEach((b) => b.addEventListener('click', () => setSpeed(Number(b.dataset.speed))));

document.getElementById('btnReset').addEventListener('click', () => { sim.reset(); refresh(); });

const densityInput = document.getElementById('density');
const densityVal = document.getElementById('densityVal');
function densityName(v) { return v < 0.34 ? 'Light' : v < 0.72 ? 'Steady' : 'Rush hour'; }
function setDensity(v01) {
  sim.cfg.density = v01;
  densityInput.value = Math.round(v01 * 100);
  densityVal.textContent = densityName(v01);
}
densityInput.addEventListener('input', () => setDensity(Number(densityInput.value) / 100));

const pedInput = document.getElementById('pedSecs');
const pedVal = document.getElementById('pedSecsVal');
function setPedSecs(n) {
  sim.cfg.pedSecs = n;
  pedInput.value = n;
  pedVal.textContent = `${n} s`;
}
pedInput.addEventListener('input', () => setPedSecs(Number(pedInput.value)));

const TOGGLES = { island: 'tglIsland', stopBox: 'tglStopBox', rumble: 'tglRumble' };
function setIntervention(name, on) {
  sim.setIntervention(name, on);
  document.getElementById(TOGGLES[name]).checked = !!on;
  scene.setInterventions(sim.cfg.interventions);
}
for (const [name, id] of Object.entries(TOGGLES)) {
  document.getElementById(id).addEventListener('change', (e) => setIntervention(name, e.target.checked));
}

const camBtns = [...document.querySelectorAll('.cam')];
camBtns.forEach((b) => b.addEventListener('click', () => {
  scene.setPreset(b.dataset.preset);
  camBtns.forEach((x) => x.classList.toggle('on', x === b));
}));

// ---------- readouts ----------
const $ = (id) => document.getElementById(id);
const PHASE_TEXT = {
  NS_GREEN: 'North–South traffic moving',
  NS_AMBER: 'Amber — north–south slowing',
  EW_GREEN: 'East–West traffic moving',
  EW_AMBER: 'Amber — east–west slowing',
  PED: 'Pedestrians crossing',
};
function phaseDuration(phase) {
  if (phase === 'PED') return sim.cfg.pedSecs;
  return phase.endsWith('AMBER') ? 2.5 : 14;
}
function fmtTime(t) {
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function refresh() {
  const snap = sim.snapshot();
  $('stNearTotal').textContent = snap.nearMiss.total;
  $('stPed').textContent = snap.nearMiss.ped;
  $('stCut').textContent = snap.nearMiss.cutin;
  $('stVeh').textContent = snap.vehiclesPassed;
  $('stPeds').textContent = snap.pedsCrossed;
  $('stRate').textContent = snap.ratePer100.toFixed(1);
  $('outNear').textContent = snap.nearMiss.total;
  $('outSafe').textContent = snap.pedsCrossed;
  $('outRate').textContent = snap.ratePer100.toFixed(1);

  const worst = sim.worstArm();
  $('stWorst').textContent = worst ? `${armLabel(worst.arm)} crossing (${worst.count})` : '— none yet';
  $('outSentence').textContent = worst
    ? `Right now the worst spot is the ${armLabel(worst.arm)} crossing${worst.arm === 'N' || worst.arm === 'E' ? ', on the school side of the junction' : ''} — ${worst.count} near-miss${worst.count === 1 ? '' : 'es'} recorded there this run. That is exactly the kind of pattern a real junction audit would act on first.`
    : 'No near-misses yet this run. Keep watching the crossings in the first seconds after the lights change — that is when they happen.';

  const left = Math.max(0, phaseDuration(sim.state.phase) - sim.state.phaseT);
  $('phaseChip').textContent = `${PHASE_TEXT[sim.state.phase]} · ${Math.ceil(left)}s`;

  const log = $('logList');
  const evs = snap.events.slice(-6).reverse();
  if (!evs.length) {
    log.innerHTML = '<li class="log-empty">Nothing yet. Watch the crossings just after the lights change.</li>';
  } else {
    log.innerHTML = evs.map((e) =>
      `<li><span class="log-time">${fmtTime(e.t)}</span><span class="log-tag ${e.type === 'cutin' ? 'cutin' : ''}">${e.type === 'cutin' ? 'CUT-IN' : 'NEAR-MISS'}</span>${e.reason} — ${armLabel(e.arm)} side</li>`
    ).join('');
  }
}

// ---------- main loop: fixed-step sim, damped render ----------
let last = performance.now();
let uiT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (playing && !document.hidden) {
    let remaining = dt * speed;
    while (remaining > 0) {
      const step = Math.min(1 / 30, remaining);
      sim.update(step);
      remaining -= step;
    }
  }
  scene.update(dt, now / 1000);
  uiT += dt;
  if (uiT > 0.25) { uiT = 0; refresh(); }
}
requestAnimationFrame(frame);
refresh();

// Test/debug API — the same paths the controls use.
window.RakshaPath = {
  sim,
  snapshot: () => sim.snapshot(),
  phase: () => sim.state.phase,
  setPlaying, setSpeed, setDensity, setPedSecs, setIntervention,
  reset: () => sim.reset(),
  isPlaying: () => playing,
};

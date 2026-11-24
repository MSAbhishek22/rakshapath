// RakshaPath 3D — simulation core.
// Pure logic: no DOM, no Three.js. The scene renders what this produces,
// the page wires controls into it. Simple rules, stated honestly:
// left-hand traffic, fixed signal cycle with a pedestrian phase,
// vehicles brake for people in their path, two-wheelers sometimes
// filter to the front. A teaching model — not real traffic data.

export const ARMS = ['S', 'N', 'E', 'W'];

// Approach frames: u = direction of travel into the junction,
// v = the driver's left. Point(d, lat) = -u*d + v*lat (d = distance
// out from the centre along the arm, lat = sideways, + = driver's left).
const FRAME = {
  S: { u: [0, -1], v: [-1, 0], group: 'NS', label: 'South' },
  N: { u: [0, 1], v: [1, 0], group: 'NS', label: 'North' },
  E: { u: [-1, 0], v: [0, 1], group: 'EW', label: 'East' },
  W: { u: [1, 0], v: [0, -1], group: 'EW', label: 'West' },
};
const OPPOSITE = { S: 'N', N: 'S', E: 'W', W: 'E' };

export function pointAt(arm, d, lat) {
  const f = FRAME[arm];
  return { x: -f.u[0] * d + f.v[0] * lat, z: -f.u[1] * d + f.v[1] * lat };
}
export function armLabel(arm) { return FRAME[arm].label; }
function leftExitArm(arm) {
  // The arm whose outward direction equals this approach's "left".
  const v = FRAME[arm].v;
  for (const a of ARMS) {
    const out = { x: -FRAME[a].u[0], z: -FRAME[a].u[1] };
    if (out.x === v[0] && out.z === v[1]) return a;
  }
  return OPPOSITE[arm];
}
function rightExitArm(arm) {
  const v = FRAME[arm].v;
  for (const a of ARMS) {
    const out = { x: -FRAME[a].u[0], z: -FRAME[a].u[1] };
    if (out.x === -v[0] && out.z === -v[1]) return a;
  }
  return OPPOSITE[arm];
}

const ROAD_END = 66;          // spawn / despawn distance
const STOP_LINE_D = 12.6;     // where front bumpers stop
const ZEBRA_D = 16.7;         // centre of each zebra crossing
const LANES = [3.1, 6.3];     // inbound lane offsets (driver's left side)
const SCHOOL_ARMS = ['N', 'E']; // the school sits on the north-east corner

const TYPE = {
  car:  { halfLen: 2.2, width: 1.9, speed: 13.5, accel: 4.6 },
  auto: { halfLen: 1.7, width: 1.5, speed: 10.5, accel: 4.0 },
  tw:   { halfLen: 0.95, width: 0.7, speed: 14.5, accel: 5.6 },
  bus:  { halfLen: 4.6, width: 2.4, speed: 10.0, accel: 3.2 },
};
const CAR_COLORS = [0xc94f38, 0x3e6fb0, 0xe8e3d8, 0x5d8a66, 0xd9a441, 0x7a4f8c, 0x9aa3a8, 0x37474f];
const SHIRT_COLORS = [0xc94f38, 0x3e6fb0, 0xe0a51f, 0x5d8a66, 0xe8e3d8, 0x7a4f8c, 0x2f8f83, 0xd4698f];

let _id = 1;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- paths ----------
function buildPath(arm, laneLat, exitArm, halfLen) {
  const dE = STOP_LINE_D + halfLen + 0.5; // centre position when stopped at the line
  const p0 = pointAt(arm, ROAD_END, laneLat);
  const pStop = pointAt(arm, dE, laneLat);
  const p1 = pointAt(exitArm, dE, -laneLat);
  const pEnd = pointAt(exitArm, ROAD_END, -laneLat);
  // Bezier control = intersection of the entry lane line and exit lane line.
  const uA = FRAME[arm].u, uB = FRAME[exitArm].u;
  const det = uA[0] * uB[1] - uA[1] * uB[0];
  let ctrl;
  if (Math.abs(det) < 1e-6) {
    ctrl = { x: (pStop.x + p1.x) / 2, z: (pStop.z + p1.z) / 2 };
  } else {
    const dx = p1.x - pStop.x, dz = p1.z - pStop.z;
    const t = (dx * uB[1] - dz * uB[0]) / det;
    ctrl = { x: pStop.x + uA[0] * t, z: pStop.z + uA[1] * t };
  }
  const pts = [{ ...p0 }];
  const SEG = 16;
  for (let i = 1; i <= SEG; i++) {
    const t = i / SEG, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
    pts.push({
      x: a * pStop.x + b * ctrl.x + c * p1.x,
      z: a * pStop.z + b * ctrl.z + c * p1.z,
    });
  }
  pts.push({ ...pEnd });
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  }
  const entryLen = Math.hypot(pStop.x - p0.x, pStop.z - p0.z);
  return { pts, cum, total: cum[cum.length - 1], stopS: entryLen, curveEndS: cum[SEG] };
}
function samplePath(path, s) {
  const { pts, cum } = path;
  if (s <= 0) s = 0;
  if (s >= path.total) s = path.total;
  let lo = 0, hi = cum.length - 1;
  while (lo < hi - 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
  const segLen = cum[lo + 1] - cum[lo] || 1;
  const t = (s - cum[lo]) / segLen;
  const x = pts[lo].x + (pts[lo + 1].x - pts[lo].x) * t;
  const z = pts[lo].z + (pts[lo + 1].z - pts[lo].z) * t;
  let hx = pts[lo + 1].x - pts[lo].x, hz = pts[lo + 1].z - pts[lo].z;
  const m = Math.hypot(hx, hz) || 1;
  return { x, z, hx: hx / m, hz: hz / m };
}

// ---------- the sim ----------
export function createSim() {
  const cfg = {
    density: 0.55,          // 0..1 from the slider
    pedSecs: 7,             // pedestrian phase length, seconds (4..12)
    interventions: { island: false, stopBox: false, rumble: false },
  };
  const state = {
    time: 0,
    vehicles: [],
    peds: [],
    events: [],             // newest last
    stats: freshStats(),
    phase: null,            // filled by controller below
    phaseT: 0,
    spawnT: { S: 0.5, N: 1.4, E: 0.9, W: 1.9 },
    pedSpawnT: 2.5,
    schoolBurstT: rand(16, 26),
    pedPairCooldown: new Map(),
  };
  function freshStats() {
    return {
      vehiclesPassed: 0, pedsCrossed: 0,
      nearMiss: { total: 0, ped: 0, cutin: 0 },
      conflicts: { S: 0, N: 0, E: 0, W: 0 },
    };
  }

  // ----- signal controller -----
  function cycle() {
    return [
      { name: 'NS_GREEN', dur: 14 }, { name: 'NS_AMBER', dur: 2.5 },
      { name: 'PED', dur: cfg.pedSecs },
      { name: 'EW_GREEN', dur: 14 }, { name: 'EW_AMBER', dur: 2.5 },
      { name: 'PED', dur: cfg.pedSecs },
    ];
  }
  let phaseIdx = 0;
  state.phase = 'NS_GREEN';
  state.phaseT = 0;
  function signalFor(arm) {
    const g = FRAME[arm].group;
    if (state.phase === g + '_GREEN') return 'green';
    if (state.phase === g + '_AMBER') return 'amber';
    return 'red';
  }
  function stepSignals(dt) {
    state.phaseT += dt;
    const cyc = cycle();
    if (state.phaseT >= cyc[phaseIdx].dur) {
      state.phaseT = 0;
      phaseIdx = (phaseIdx + 1) % cyc.length;
      state.phase = cyc[phaseIdx].name;
      if (state.phase === 'NS_GREEN' || state.phase === 'EW_GREEN') onGreenStart(state.phase === 'NS_GREEN' ? 'NS' : 'EW');
    }
  }

  // ----- events -----
  const listeners = [];
  function fireEvent(type, arm, reason, pos) {
    const ev = { t: state.time, type, arm, reason, x: pos.x, z: pos.z };
    state.events.push(ev);
    if (state.events.length > 40) state.events.shift();
    state.stats.nearMiss.total++;
    state.stats.nearMiss[type]++;
    state.stats.conflicts[arm]++;
    for (const fn of listeners) fn(ev);
  }

  // ----- spawning -----
  function spawnVehicle(arm, seed) {
    if (state.vehicles.length >= 26) return;
    const r = Math.random();
    const type = seed?.type ?? (r < 0.48 ? 'car' : r < 0.78 ? 'tw' : r < 0.93 ? 'auto' : 'bus');
    const spec = TYPE[type];
    const laneLat = seed?.laneLat ?? (type === 'bus' ? LANES[1] : pick(LANES));
    // keep the spawn point clear
    for (const v of state.vehicles) {
      if (v.approach === arm && v.laneLat === laneLat && Math.abs(v.s - (seed?.s ?? 0)) < 9) return;
    }
    const tr = Math.random();
    let exitArm, turn;
    if (type === 'bus') { turn = tr < 0.8 ? 'straight' : 'left'; }
    else turn = tr <  0.55 ? 'straight' : tr < 0.8 ? 'left' : 'right';
    exitArm = turn === 'straight' ? OPPOSITE[arm] : turn === 'left' ? leftExitArm(arm) : rightExitArm(arm);
    const path = buildPath(arm, laneLat, exitArm, spec.halfLen);
    const s0 = seed?.s ?? 0;
    const startPos = samplePath(path, s0);
    // seeded traffic starts at a speed that fits where it is placed
    let v0 = spec.speed * rand(0.7, 1);
    const dc0 = Math.hypot(startPos.x, startPos.z);
    if (dc0 < 36) v0 = Math.min(v0, 12);
    if (SCHOOL_ARMS.includes(arm) && dc0 < 44) v0 = Math.min(v0, 10);
    state.vehicles.push({
      id: _id++, type, approach: arm, laneLat, exitArm, turn, path,
      s: s0, v: v0, halfLen: spec.halfLen, width: spec.width,
      x: startPos.x, z: startPos.z, hx: startPos.hx, hz: startPos.hz,
      mode: 'path', passedStop: false, filteredThisStop: false, filterWait: 0,
      decelNow: 0, color: type === 'auto' ? pick([0xf2b21b, 0x3f7d3a]) : pick(CAR_COLORS),
      filterTargets: null, creepState: null, pairHits: new Set(),
    });
  }
  function spawnPed(arm, opts = {}) {
    if (state.peds.length >= 22) return;
    const side = opts.side ?? (Math.random() < 0.5 ? 1 : -1);
    const child = !!opts.child;
    state.peds.push({
      id: _id++, arm, side, child,
      lat: side * 10.6, state: 'wait',
      speed: child ? rand(2.3, 3.1) : rand(1.9, 2.8),
      reaction: rand(0, 1.4),
      late: Math.random() < (child ? 0.25 : 0.15),
      started: false, startAt: Infinity,
      shirt: pick(SHIRT_COLORS), hitBy: new Set(),
    });
  }
  function stepSpawning(dt) {
    const vehInterval = 8.5 - 5.5 * cfg.density; // per approach; rush hour (1.0) deliberately overloads the junction
    for (const arm of ARMS) {
      state.spawnT[arm] -= dt;
      if (state.spawnT[arm] <= 0) { spawnVehicle(arm); state.spawnT[arm] = vehInterval * rand(0.7, 1.3); }
    }
    state.pedSpawnT -= dt;
    if (state.pedSpawnT <= 0) {
      spawnPed(pick(ARMS));
      state.pedSpawnT = (5.2 - 2.6 * cfg.density) * rand(0.7, 1.4);
    }
    state.schoolBurstT -= dt;
    if (state.schoolBurstT <= 0) {
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) spawnPed(pick(SCHOOL_ARMS), { child: true });
      state.schoolBurstT = rand(22, 38);
    }
  }

  // ----- pedestrians -----
  function stepPeds(dt) {
    const inPedPhase = state.phase === 'PED';
    const cyc = cycle();
    const pedDur = cyc[2].dur;
    for (const p of state.peds) {
      if (p.state === 'wait') {
        if (inPedPhase && !p.started) {
          p.started = true;
          // Late crossers leave it to the last moment of the phase.
          p.startAt = p.late ? Math.max(0.2, pedDur - rand(0.4, 1.8)) : p.reaction;
        }
        if (inPedPhase && state.phaseT >= p.startAt) {
          p.state = cfg.interventions.island ? 'cross1' : 'cross';
        }
      } else if (p.state === 'cross' || p.state === 'cross1' || p.state === 'cross2') {
        const hurry = inPedPhase ? 1 : 1.35;
        let target;
        if (p.state === 'cross') target = -p.side * 10.6;
        else if (p.state === 'cross1') target = -p.side * 1.5;
        else target = -p.side * 10.6;
        const dir = Math.sign(target - p.lat);
        p.lat += dir * p.speed * hurry * dt;
        if ((dir > 0 && p.lat >= target) || (dir < 0 && p.lat <= target)) {
          p.lat = target;
          if (p.state === 'cross1') p.state = 'islandWait';
          else { p.state = 'done'; state.stats.pedsCrossed++; }
        }
      } else if (p.state === 'islandWait') {
        if (inPedPhase) p.state = 'cross2';
      }
      const pos = pointAt(p.arm, ZEBRA_D, p.lat);
      p.x = pos.x; p.z = pos.z;
      const v = FRAME[p.arm].v;
      p.hx = -v[0] * p.side; p.hz = -v[1] * p.side;
      // In the roadway = inside a lane band. The refuge island strip
      // (|lat| <= 1.9) and the kerbs are safe ground.
      p.inRoad = Math.abs(p.lat) > 1.9 && Math.abs(p.lat) < 8.6;
    }
    state.peds = state.peds.filter((p) => p.state !== 'done');
  }

  // ----- two-wheeler filtering & cut-in -----
  function onGreenStart(group) {
    for (const v of state.vehicles) {
      if (FRAME[v.approach].group !== group) continue;
      if (v.mode !== 'filter' || v.creepState !== 'crept') continue;
      // A two-wheeler waiting in the junction mouth has drifted toward
      // the centre, into the arc of turning traffic — most often a
      // vehicle turning right from its own queue, whose wide sweep
      // (left-hand traffic) passes right where the rider is waiting.
      let conflict = null;
      for (const o of state.vehicles) {
        if (o === v || o.mode !== 'path' || o.turn === 'straight') continue;
        if (o.s > o.path.curveEndS + 6) continue; // already cleared the junction
        for (let s = o.s; s < Math.min(o.s + 32, o.path.total); s += 2) {
          const q = samplePath(o.path, s);
          // The sweep must be about to reach the rider (within ~18 units
          // of travel) — a turning vehicle far back in the queue is not
          // a conflict for a rider who darts now.
          if (Math.hypot(q.x - v.x, q.z - v.z) < 2.7 && s - o.s <= 18) { conflict = o; break; }
        }
        if (conflict) break;
      }
      if (conflict) {
        fireEvent('cutin', v.approach,
          `a two-wheeler cut across a turning ${conflict.type === 'auto' ? 'auto-rickshaw' : conflict.type}`,
          { x: v.x, z: v.z });
      }
      v.mode = 'rejoin';
      v.rejoinS = v.path.stopS + 12;
    }
    // Boxed two-wheelers simply rejoin — they were visible, in line.
    for (const v of state.vehicles) {
      if (FRAME[v.approach].group !== group) continue;
      if (v.mode === 'filter' && v.creepState === 'boxed') { v.mode = 'rejoin'; v.rejoinS = v.path.stopS + 6; }
    }
  }
  function maybeStartFilter(v, dt, queueAhead) {
    if (v.type !== 'tw' || v.mode !== 'path' || v.passedStop || v.filteredThisStop) return;
    if (signalFor(v.approach) !== 'red' || queueAhead < 2 || v.v > 0.6) { v.filterWait = 0; return; }
    v.filterWait += dt;
    if (v.filterWait < 1.1 || Math.random() > 0.6) return;
    v.filteredThisStop = true;
    v.mode = 'filter';
    const filterLat = v.laneLat - 1.7;
    const myD = ROAD_END - v.s; // entry segment: s maps linearly to distance out
    const boxed = cfg.interventions.stopBox;
    v.creepState = boxed ? 'boxing' : 'creeping';
    v.filterTargets = [
      pointAt(v.approach, myD, filterLat),
      boxed ? pointAt(v.approach, 13.7, v.laneLat) : pointAt(v.approach, 11.9, v.laneLat * 0.62),
    ];
  }
  function stepFilter(v, dt) {
    if (!v.filterTargets || v.filterTargets.length === 0) { v.v = 0; return; } // arrived; waiting for green
    const tgt = v.filterTargets[0];
    const dx = tgt.x - v.x, dz = tgt.z - v.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.35) {
      v.filterTargets.shift();
      if (v.filterTargets.length === 0) {
        v.creepState = v.creepState === 'boxing' ? 'boxed' : 'crept';
        v.v = 0;
        return;
      }
      return;
    }
    const sp = Math.min(5.5, dist * 2.2);
    v.hx = dx / dist; v.hz = dz / dist;
    v.x += v.hx * sp * dt; v.z += v.hz * sp * dt;
    v.v = sp;
  }
  function stepRejoin(v, dt) {
    const q = samplePath(v.path, Math.min(v.rejoinS, v.path.total));
    const dx = q.x - v.x, dz = q.z - v.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 1.3) { v.mode = 'path'; v.s = v.rejoinS; v.passedStop = true; return; }
    const sp = v.creepState === 'crept' ? 10.5 : 8;
    v.hx = dx / dist; v.hz = dz / dist;
    v.x += v.hx * sp * dt; v.z += v.hz * sp * dt;
    v.v = sp;
  }

  // ----- vehicles -----
  function stepVehicles(dt) {
    const toRemove = [];
    for (const v of state.vehicles) {
      const spec = TYPE[v.type];
      const prevV = v.v;
      if (v.mode === 'filter') { stepFilter(v, dt); v.decelNow = 0; continue; }
      if (v.mode === 'rejoin') { stepRejoin(v, dt); v.decelNow = 0; continue; }

      const pos = samplePath(v.path, v.s);
      v.x = pos.x; v.z = pos.z; v.hx = pos.hx; v.hz = pos.hz;
      const distCentre = Math.hypot(v.x, v.z);

      // speed limit by place
      let limit = spec.speed;
      if (distCentre < 36) limit = Math.min(limit, 12);
      // Rumble strips calm the whole approach, not just the last
      // metres: drivers see the junction ahead and settle early.
      // The cap is anticipatory — the target follows the same
      // demand-shaped curve as a stop line, reaching 8.5 a full
      // approach-length before the line, so traffic in the final
      // stretch is already calm instead of braking inside it.
      if (cfg.interventions.rumble && !v.passedStop) {
        const distStop = v.path.stopS - v.s;
        const room = Math.max(0, distStop - 36);
        limit = Math.min(limit, Math.sqrt(8.5 * 8.5 + 2 * 5.2 * room));
      }
      if (SCHOOL_ARMS.includes(v.approach) && !v.passedStop && distCentre < 44) limit = Math.min(limit, 10);
      if (v.turn !== 'straight' && v.s > v.path.stopS - 3 && v.s < v.path.curveEndS + 6) limit = Math.min(limit, 7.5);
      let vTarget = limit;
      let decel = 5.2;

      // follow the vehicle ahead (world-space corridor check)
      let queueAhead = 0;
      for (const o of state.vehicles) {
        if (o === v) continue;
        const rx = o.x - v.x, rz = o.z - v.z;
        const lon = rx * v.hx + rz * v.hz;
        const lat = Math.abs(rx * -v.hz + rz * v.hx);
        if (lon > 0 && lat < 1.35) {
          const gap = v.halfLen + o.halfLen + 2.1;
          if (lon < gap + 6) {
            const room = Math.max(0, lon - gap);
            vTarget = Math.min(vTarget, Math.sqrt(2 * 5.2 * room));
            if (lon < gap + 14 && o.v < 0.6 && !v.passedStop && o.approach === v.approach && o.laneLat === v.laneLat && o.mode === 'path') queueAhead++;
          }
        }
      }

      // signal stop line
      if (!v.passedStop) {
        const sig = signalFor(v.approach);
        const distStop = v.path.stopS - v.s;
        if (sig === 'red' || (sig === 'amber' && distStop > (v.v * v.v) / (2 * 5.5) + 1)) {
          vTarget = Math.min(vTarget, Math.sqrt(2 * 5.2 * Math.max(0, distStop - 0.25)));
          if (distStop < 0.35) vTarget = 0;
        }
        if (v.s > v.path.stopS + 0.4) v.passedStop = true;
      }

      // right-turn yield: in left-hand traffic the right turn crosses
      // the opposing flow — hold at the mouth until it is clear.
      if (v.turn === 'right' && v.s > v.path.stopS - 0.5 && v.s < v.path.stopS + 5) {
        const opp = OPPOSITE[v.approach];
        let blocked = false;
        for (const o of state.vehicles) {
          if (o.approach === opp && o.mode === 'path' && o.s > o.path.stopS - 14 && o.s < o.path.stopS + 22 && o.v > 0.8) { blocked = true; break; }
        }
        if (blocked) {
          const room = Math.max(0, v.path.stopS + 1.6 - v.s);
          vTarget = Math.min(vTarget, Math.sqrt(2 * 5.2 * room));
        }
      }

      // Brake for a pedestrian in the corridor ahead, with only as much
      // force as the room demands. Calmer approaches (rumble strips)
      // also pick the hazard up earlier — speed shortens hazard
      // perception — but only for vehicles still approaching.
      const detect = cfg.interventions.rumble && !v.passedStop ? 13.5 : 10.5;
      for (const p of state.peds) {
        if (!p.inRoad) continue;
        const rx = p.x - v.x, rz = p.z - v.z;
        const lon = rx * v.hx + rz * v.hz;
        const lat = Math.abs(rx * -v.hz + rz * v.hx);
        if (lon > 0.5 && lon < detect && lat < 1.45) {
          const stopRoom = Math.max(0.3, lon - (v.halfLen + 1.3));
          const needed = (v.v * v.v) / (2 * stopRoom);
          const a = Math.min(Math.max(needed, 5.2), 9.5);
          const vt = Math.sqrt(2 * a * stopRoom);
          if (vt < vTarget) { vTarget = vt; decel = Math.max(decel, a); }
        }
      }

      // integrate speed
      if (vTarget > v.v) v.v = Math.min(vTarget, v.v + spec.accel * dt);
      else v.v = Math.max(vTarget, v.v - decel * dt);
      v.decelNow = dt > 0 ? Math.max(0, (prevV - v.v) / dt) : 0;
      v.s += v.v * dt;
      const np = samplePath(v.path, v.s);
      v.x = np.x; v.z = np.z; v.hx = np.hx; v.hz = np.hz;

      // A near-miss is recorded only when the vehicle ACTUALLY braked
      // hard (deceleration above 6) with a pedestrian in its corridor,
      // on a green light. Gentle braking and red-light stops are normal
      // driving — this is where rumble strips earn their keep, because
      // the same stop from a calmer approach never crosses 6.
      if (v.decelNow > 6 && signalFor(v.approach) === 'green') {
        for (const p of state.peds) {
          if (!p.inRoad || v.pairHits.has(p.id)) continue;
          const rx = p.x - v.x, rz = p.z - v.z;
          const lon = rx * v.hx + rz * v.hz;
          const lat = Math.abs(rx * -v.hz + rz * v.hx);
          if (lon > 0 && lon < 9 && lat < 1.45) {
            v.pairHits.add(p.id);
            const reason = p.child
              ? 'a child ran out from the school side — hard braking'
              : p.late
                ? 'a pedestrian crossed after the walking phase had ended'
                : v.turn !== 'straight'
                  ? 'a turning vehicle braked hard for a pedestrian on the crossing'
                  : 'a pedestrian was still on the crossing when the lights changed';
            fireEvent('ped', p.arm, `${v.type === 'tw' ? 'a two-wheeler' : v.type === 'auto' ? 'an auto-rickshaw' : 'a ' + v.type} braked hard — ${reason}`, { x: p.x, z: p.z });
          }
        }
      }

      maybeStartFilter(v, dt, queueAhead);
      if (v.s >= v.path.total - 0.5) { toRemove.push(v); state.stats.vehiclesPassed++; }
    }
    if (toRemove.length) state.vehicles = state.vehicles.filter((v) => !toRemove.includes(v));
  }

  // Opening frame: a junction that is already alive, so the first thing a
  // visitor sees is traffic, not an empty road filling up. Vehicles are
  // placed along their entry lanes with clear gaps; people wait at kerbs.
  function seedTraffic() {
    const plan = [
      ['S', LANES[0], 'car', 14], ['S', LANES[1], 'auto', 30],
      ['N', LANES[0], 'tw', 20], ['N', LANES[1], 'car', 8],
      ['E', LANES[0], 'car', 24], ['E', LANES[1], 'tw', 12],
      ['W', LANES[0], 'auto', 18], ['W', LANES[1], 'car', 34],
      ['S', LANES[0], 'tw', 38], ['E', LANES[0], 'car', 44],
    ];
    for (const [arm, laneLat, type, s] of plan) spawnVehicle(arm, { laneLat, type, s });
    spawnPed('N', { side: 1, child: true });
    spawnPed('E', { side: -1, child: true });
    spawnPed('S', { side: -1 });
    spawnPed('W', { side: 1 });
    spawnPed('N', { side: -1 });
  }
  seedTraffic();

  // ----- public API -----
  return {
    cfg, state,
    signalFor,
    onEvent(fn) { listeners.push(fn); },
    update(dt) {
      state.time += dt;
      stepSignals(dt);
      stepSpawning(dt);
      stepPeds(dt);
      stepVehicles(dt);
    },
    setIntervention(name, on) { cfg.interventions[name] = !!on; },
    reset() {
      state.vehicles = []; state.peds = []; state.events = [];
      state.stats = freshStats(); state.time = 0;
      phaseIdx = 0; state.phase = 'NS_GREEN'; state.phaseT = 0;
      seedTraffic();
    },
    worstArm() {
      let best = null, n = 0;
      for (const a of ARMS) if (state.stats.conflicts[a] > n) { n = state.stats.conflicts[a]; best = a; }
      return best ? { arm: best, count: n } : null;
    },
    snapshot() {
      const s = state.stats;
      return {
        time: state.time, phase: state.phase,
        vehiclesPassed: s.vehiclesPassed, pedsCrossed: s.pedsCrossed,
        nearMiss: { ...s.nearMiss }, conflicts: { ...s.conflicts },
        ratePer100: s.vehiclesPassed > 0 ? (s.nearMiss.total / s.vehiclesPassed) * 100 : 0,
        activeVehicles: state.vehicles.length, activePeds: state.peds.length,
        interventions: { ...cfg.interventions },
        events: state.events.slice(-8),
      };
    },
  };
}

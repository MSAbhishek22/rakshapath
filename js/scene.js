// RakshaPath 3D — Three.js scene. Flat-shaded daylight, low-poly.
// Colour is spent on meaning only: signals, warnings, interventions.
// Everything is pooled; nothing is created per-frame.

import * as THREE from 'three';
import { ARMS, pointAt } from './sim.js';

const LAM = (c) => new THREE.MeshLambertMaterial({ color: c });
const BAS = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}
function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 10) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  return m;
}

// ---------- vehicle builders (front faces +z) ----------
function buildCar() {
  const g = new THREE.Group();
  const body = LAM(0xffffff);
  g.add(box(1.8, 0.55, 4.4, body, 0, 0.58, 0));
  g.add(box(1.6, 0.5, 2.1, LAM(0x22303a), 0, 1.08, -0.25));
  const tyre = LAM(0x1b1b1d);
  for (const [x, z] of [[-0.85, 1.45], [0.85, 1.45], [-0.85, -1.45], [0.85, -1.45]]) {
    const w = cyl(0.34, 0.34, 0.22, tyre, x, 0.34, z); w.rotation.z = Math.PI / 2; g.add(w);
  }
  g.add(box(0.34, 0.12, 0.06, BAS(0xfff6cf), -0.55, 0.62, 2.21));
  g.add(box(0.34, 0.12, 0.06, BAS(0xfff6cf), 0.55, 0.62, 2.21));
  const brake = new THREE.Group();
  brake.add(box(0.36, 0.12, 0.06, BAS(0xff2a1a), -0.55, 0.66, -2.21));
  brake.add(box(0.36, 0.12, 0.06, BAS(0xff2a1a), 0.55, 0.66, -2.21));
  g.add(brake);
  return { group: g, bodyMat: body, brake };
}
function buildAuto() {
  const g = new THREE.Group();
  const body = LAM(0xf2b21b);
  g.add(box(1.5, 0.85, 2.9, body, 0, 0.72, 0));
  g.add(box(1.52, 0.62, 1.8, LAM(0x22201c), 0, 1.42, -0.35));
  g.add(box(1.1, 0.5, 0.08, LAM(0x9fc4cf), 0, 0.95, 1.47));
  const tyre = LAM(0x1b1b1d);
  for (const [x, z] of [[0, 1.25], [-0.72, -1.05], [0.72, -1.05]]) {
    const w = cyl(0.3, 0.3, 0.18, tyre, x, 0.3, z); w.rotation.z = Math.PI / 2; g.add(w);
  }
  const brake = new THREE.Group();
  brake.add(box(0.3, 0.1, 0.06, BAS(0xff2a1a), -0.45, 0.7, -1.46));
  brake.add(box(0.3, 0.1, 0.06, BAS(0xff2a1a), 0.45, 0.7, -1.46));
  g.add(brake);
  return { group: g, bodyMat: body, brake };
}
function buildTw() {
  const g = new THREE.Group();
  const body = LAM(0xffffff);
  g.add(box(0.3, 0.42, 1.85, body, 0, 0.55, 0));
  g.add(box(0.4, 0.55, 0.34, LAM(0x37424a), 0, 1.02, -0.18)); // rider torso
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), LAM(0xd8492f));
  helmet.position.set(0, 1.48, -0.12); g.add(helmet);
  const tyre = LAM(0x1b1b1d);
  for (const z of [0.78, -0.78]) {
    const w = cyl(0.33, 0.33, 0.09, tyre, 0, 0.33, z); w.rotation.z = Math.PI / 2; g.add(w);
  }
  const brake = new THREE.Group();
  brake.add(box(0.16, 0.08, 0.05, BAS(0xff2a1a), 0, 0.62, -0.94));
  g.add(brake);
  return { group: g, bodyMat: body, brake };
}
function buildBus() {
  const g = new THREE.Group();
  const body = LAM(0xffffff);
  g.add(box(2.4, 2.1, 9.2, body, 0, 1.5, 0));
  g.add(box(2.44, 0.65, 8.4, LAM(0x22303a), 0, 1.95, 0));
  g.add(box(2.0, 0.7, 0.08, LAM(0x9fc4cf), 0, 1.7, 4.62));
  const tyre = LAM(0x1b1b1d);
  for (const [x, z] of [[-1.1, 3.1], [1.1, 3.1], [-1.1, -3.1], [1.1, -3.1]]) {
    const w = cyl(0.46, 0.46, 0.26, tyre, x, 0.46, z); w.rotation.z = Math.PI / 2; g.add(w);
  }
  const brake = new THREE.Group();
  brake.add(box(0.4, 0.16, 0.06, BAS(0xff2a1a), -0.8, 0.8, -4.62));
  brake.add(box(0.4, 0.16, 0.06, BAS(0xff2a1a), 0.8, 0.8, -4.62));
  g.add(brake);
  return { group: g, bodyMat: body, brake };
}
function buildPed() {
  const g = new THREE.Group();
  const shirt = LAM(0xffffff);
  const body = cyl(0.15, 0.19, 0.66, shirt, 0, 0.78, 0);
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 10, 8), LAM(0xc98d64));
  head.position.y = 1.3; g.add(head);
  g.add(box(0.3, 0.42, 0.2, LAM(0x3a4149), 0, 0.24, 0)); // legs block
  return { group: g, shirtMat: shirt };
}

// ---------- static world ----------
function textTexture(text, w = 512, h = 128, bg = '#f6efdd', fg = '#1c2b39', font = 'bold 84px system-ui, sans-serif') {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createScene(canvas, sim) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd7e6ea);
  scene.fog = new THREE.Fog(0xd7e6ea, 150, 240);

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400);
  const cam = { az: Math.PI / 4, el: 0.72, r: 84, tx: 0, ty: 0, tz: 0 };
  const camGoal = { ...cam };
  const PRESETS = {
    overview: { az: Math.PI / 4, el: 0.72, r: 84, tx: 0, ty: 0, tz: 0 },
    top: { az: Math.PI / 4, el: 1.45, r: 96, tx: 0, ty: 0, tz: 0 },
    school: { az: Math.PI / 4, el: 0.42, r: 36, tx: 15, ty: 0, tz: -15 },
    street: { az: 0, el: 0.1, r: 21, tx: 0, ty: 1.2, tz: 14 },
  };

  scene.add(new THREE.HemisphereLight(0xeaf4ff, 0x8a7f63, 1.05));
  const sun = new THREE.DirectionalLight(0xfff1da, 1.9);
  sun.position.set(45, 70, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -58; sun.shadow.camera.right = 58;
  sun.shadow.camera.top = 58; sun.shadow.camera.bottom = -58;
  sun.shadow.camera.far = 220;
  scene.add(sun);

  const world = new THREE.Group();
  scene.add(world);

  // ground + roads
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), LAM(0xb7bd9e));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.06; ground.receiveShadow = true;
  world.add(ground);
  const asphalt = LAM(0x494a4d);
  for (const rot of [0, Math.PI / 2]) {
    const road = box(150, 0.08, 17.4, asphalt, 0, 0, 0);
    road.rotation.y = rot; road.receiveShadow = true; world.add(road);
  }
  // pavement corners
  const pave = LAM(0xd9d2bf);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const p = box(56, 0.14, 56, pave, sx * 36.8, 0.03, sz * 36.8);
    p.receiveShadow = true; world.add(p);
  }

  const white = LAM(0xf4f2ea), yellow = LAM(0xe8b93b);
  function flat(w, d, mat, x, z, rotY = 0, y = 0.06) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.rotation.x = -Math.PI / 2; m.rotation.z = rotY;
    m.position.set(x, y, z); world.add(m); return m;
  }
  // per-arm markings, in arm-local space (d out, lat across)
  function armAngle(arm) { return { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 }[arm]; }
  function armLocal(arm, d, lat, w, dd, mat, y = 0.06) {
    const p = pointAt(arm, d, lat);
    return flat(w, dd, mat, p.x, p.z, armAngle(arm), y);
  }
  for (const arm of ARMS) {
    // centre double-yellow
    armLocal(arm, 40, 0.55, 0.28, 46, yellow);
    armLocal(arm, 40, -0.55, 0.28, 46, yellow);
    // lane divider dashes (both directions)
    for (const lat of [4.7, -4.7]) {
      for (let d = 22; d < 62; d += 6.5) armLocal(arm, d, lat, 0.22, 2.6, white);
    }
    // edge lines
    armLocal(arm, 40, 8.35, 0.24, 46, white);
    armLocal(arm, 40, -8.35, 0.24, 46, white);
    // stop line (inbound)
    armLocal(arm, 12.6, 4.6, 6.2, 0.5, white);
    // zebra stripes
    for (let i = 0; i < 6; i++) armLocal(arm, 15.05 + i * 0.66, 0, 16.6, 0.36, white);
  }
  // yellow box junction border
  for (const [w, d, x, z] of [[22.4, 0.35, 0, 11], [22.4, 0.35, 0, -11], [0.35, 22.4, 11, 0], [0.35, 22.4, -11, 0]]) {
    flat(w, d, yellow, x, z);
  }

  // --- intervention groups (toggled) ---
  const islandGroup = new THREE.Group();
  const stopBoxGroup = new THREE.Group();
  const rumbleGroup = new THREE.Group();
  for (const arm of ARMS) {
    // refuge island: raised strip in the middle of the zebra
    const isl = box(3.1, 0.2, 3.7, LAM(0xcfc7ae), 0, 0, 0);
    const ip = pointAt(arm, 16.7, 0);
    isl.position.set(ip.x, 0.12, ip.z); isl.rotation.y = armAngle(arm);
    isl.castShadow = true; islandGroup.add(isl);
    const edge = box(3.2, 0.06, 3.8, LAM(0xe8b93b), 0, 0, 0);
    edge.position.set(ip.x, 0.03, ip.z); edge.rotation.y = armAngle(arm);
    islandGroup.add(edge);
    for (const s of [-1, 1]) {
      const bp = pointAt(arm, 16.7 + s * 1.6, 0);
      const bol = cyl(0.09, 0.09, 0.65, LAM(0x37424a), bp.x, 0.42, bp.z);
      islandGroup.add(bol);
    }
    // stop box: green-tinted box ahead of the car stop line
    const sb = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 1.9),
      new THREE.MeshBasicMaterial({ color: 0x2e9e5b, transparent: true, opacity: 0.4 }));
    sb.rotation.x = -Math.PI / 2; sb.rotation.z = armAngle(arm);
    const sp = pointAt(arm, 13.65, 4.6);
    sb.position.set(sp.x, 0.075, sp.z); stopBoxGroup.add(sb);
    const sbEdge = box(6.4, 0.03, 2.1, LAM(0x2e9e5b), 0, 0, 0);
    sbEdge.position.set(sp.x, 0.015, sp.z); sbEdge.rotation.y = armAngle(arm);
    stopBoxGroup.add(sbEdge);
    // rumble strips across both inbound lanes
    for (let i = 0; i < 4; i++) {
      const rp = pointAt(arm, 27 + i * 1.15, 4.6);
      const bar = box(6.4, 0.07, 0.5, LAM(0x8a4a38), rp.x, 0.06, rp.z);
      bar.rotation.y = armAngle(arm); rumbleGroup.add(bar);
    }
  }
  islandGroup.visible = false; stopBoxGroup.visible = false; rumbleGroup.visible = false;
  world.add(islandGroup, stopBoxGroup, rumbleGroup);

  // --- buildings + school (NE corner) + trees ---
  const palette = [0xe8dcc3, 0xd9b48f, 0xc98a5e, 0xefe9dc, 0xb9c4b5, 0xdcc7a8];
  let ci = 0;
  function building(x, z, w, h, d, color) {
    const b = box(w, h, d, LAM(color), x, h / 2, z);
    b.castShadow = true; b.receiveShadow = true; world.add(b);
    const roof = box(w + 0.4, 0.3, d + 0.4, LAM(0x8a6f52), x, h + 0.15, z);
    world.add(roof);
    return b;
  }
  for (const [cx, cz] of [[-30, -30], [-30, 30], [30, 30]]) {
    building(cx - 6, cz + 4, 13, 9 + (ci += 2), 11, palette[ci % palette.length]);
    building(cx + 8, cz - 5, 10, 6 + ci, 12, palette[(ci + 2) % palette.length]);
    building(cx + 2, cz + 10, 9, 13 - (ci % 5), 9, palette[(ci + 4) % palette.length]);
  }
  // school: green block, sign board, gate
  building(29, -27, 20, 7, 12, 0x86ac72);
  building(29, -38, 14, 5, 8, 0x9db98d);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2),
    new THREE.MeshBasicMaterial({ map: textTexture('SCHOOL', 512, 128, '#f6efdd', '#1c6b3c'), side: THREE.DoubleSide }));
  sign.position.set(29, 5.2, -20.85); world.add(sign);
  // Two planes back to back, texture facing outward on both sides —
  // a single DoubleSide plane reads mirrored from behind.
  const zoneTex = textTexture('SCHOOL ZONE · 30', 512, 128, '#fdfdf8', '#1c2b39', 'bold 62px system-ui, sans-serif');
  const zp = pointAt('N', 30, 10.4);
  for (const flip of [0, Math.PI]) {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.6),
      new THREE.MeshBasicMaterial({ map: zoneTex, side: THREE.FrontSide }));
    face.position.set(zp.x, 2.6, zp.z); face.rotation.y = Math.PI + flip;
    world.add(face);
  }
  const zpole = cyl(0.06, 0.06, 2.6, LAM(0x37424a), zp.x, 1.3, zp.z); world.add(zpole);

  const trunkM = LAM(0x7a5c3e), leafM = LAM(0x6f9e5f), leaf2M = LAM(0x84b06c);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.4;
    const r = 24 + (i % 3) * 7;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x) < 13 && Math.abs(z) < 40) continue;
    if (Math.abs(z) < 13 && Math.abs(x) < 40) continue;
    const t = new THREE.Group();
    t.add(cyl(0.14, 0.2, 1.6, trunkM, 0, 0.8, 0));
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 6), i % 2 ? leafM : leaf2M);
    c1.position.y = 2.6; c1.castShadow = true; t.add(c1);
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 6), leafM);
    c2.position.set(0.8, 3.3, 0.4); t.add(c2);
    t.position.set(x, 0, z);
    world.add(t);
  }

  // --- signals ---
  const lampOff = 0x23282c;
  const signals = {};
  for (const arm of ARMS) {
    const g = new THREE.Group();
    const pp = pointAt(arm, 13.8, 10.1);
    g.position.set(pp.x, 0, pp.z);
    g.add(cyl(0.07, 0.07, 3.5, LAM(0x2c343a), 0, 1.75, 0));
    const head = box(0.52, 1.25, 0.34, LAM(0x1d2329), 0, 3.6, 0);
    g.add(head);
    const lamps = {};
    const cols = { red: 0xff3524, amber: 0xffb020, green: 0x2fe07a };
    ['red', 'amber', 'green'].forEach((name, i) => {
      const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.13, 16), BAS(lampOff));
      lamp.position.set(0, 3.98 - i * 0.38, 0.18);
      g.add(lamp); lamps[name] = { mesh: lamp, on: cols[name] };
    });
    // face the drivers on this approach (they look along -u... they face u direction of travel)
    const f = { S: [0, -1], N: [0, 1], E: [-1, 0], W: [1, 0] }[arm];
    g.rotation.y = Math.atan2(f[0], f[1]) + Math.PI;
    world.add(g);
    // pedestrian signal at the far end of the zebra
    const pg = new THREE.Group();
    const pq = pointAt(arm, 19.8, 10.1);
    pg.position.set(pq.x, 0, pq.z);
    pg.add(cyl(0.06, 0.06, 2.4, LAM(0x2c343a), 0, 1.2, 0));
    pg.add(box(0.44, 0.8, 0.3, LAM(0x1d2329), 0, 2.6, 0));
    const pl = {};
    [['red', 2.78], ['green', 2.42]].forEach(([name, y]) => {
      const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.1, 14), BAS(lampOff));
      lamp.position.set(0, y, 0.16); pg.add(lamp);
      pl[name] = { mesh: lamp, on: name === 'red' ? 0xff3524 : 0x2fe07a };
    });
    pg.rotation.y = Math.atan2(f[0], f[1]) + Math.PI;
    world.add(pg);
    signals[arm] = { lamps, ped: pl };
  }

  // --- heat marker (worst conflict point) ---
  const heat = new THREE.Group();
  const heatDisc = new THREE.Mesh(new THREE.CircleGeometry(1, 28),
    new THREE.MeshBasicMaterial({ color: 0xe23b2a, transparent: true, opacity: 0.32, depthWrite: false }));
  heatDisc.rotation.x = -Math.PI / 2; heatDisc.position.y = 0.12;
  const heatRing = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 28),
    new THREE.MeshBasicMaterial({ color: 0xe23b2a, transparent: true, opacity: 0.75, depthWrite: false }));
  heatRing.rotation.x = -Math.PI / 2; heatRing.position.y = 0.13;
  heat.add(heatDisc, heatRing);
  heat.visible = false;
  world.add(heat);

  // --- near-miss flash pool ---
  const flashes = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.75, 1, 26),
      new THREE.MeshBasicMaterial({ color: 0xff3524, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.16; m.visible = false;
    world.add(m);
    flashes.push({ mesh: m, t: 99 });
  }
  let flashIdx = 0;
  sim.onEvent((ev) => {
    const f = flashes[flashIdx++ % flashes.length];
    f.mesh.position.x = ev.x; f.mesh.position.z = ev.z;
    f.t = 0; f.mesh.visible = true;
  });

  // --- agent pools ---
  const pools = { car: [], auto: [], tw: [], bus: [] };
  const builders = { car: buildCar, auto: buildAuto, tw: buildTw, bus: buildBus };
  const caps = { car: 16, auto: 8, tw: 14, bus: 4 };
  for (const t of Object.keys(pools)) {
    for (let i = 0; i < caps[t]; i++) {
      const s = builders[t]();
      s.group.visible = false;
      s.group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      world.add(s.group);
      pools[t].push({ ...s, vehId: -1 });
    }
  }
  const pedPool = [];
  for (let i = 0; i < 24; i++) {
    const s = buildPed();
    s.group.visible = false;
    s.group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    world.add(s.group);
    pedPool.push({ ...s, pedId: -1 });
  }

  // --- camera input ---
  let dragging = false, px = 0, py = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    camGoal.az -= (e.clientX - px) * 0.005;
    camGoal.el = THREE.MathUtils.clamp(camGoal.el + (e.clientY - py) * 0.004, 0.06, 1.5);
    px = e.clientX; py = e.clientY;
  });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camGoal.r = THREE.MathUtils.clamp(camGoal.r * (1 + e.deltaY * 0.001), 16, 140);
  }, { passive: false });

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight;
    if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  return {
    setPreset(name) { Object.assign(camGoal, PRESETS[name]); },
    setInterventions(iv) {
      islandGroup.visible = !!iv.island;
      stopBoxGroup.visible = !!iv.stopBox;
      rumbleGroup.visible = !!iv.rumble;
    },
    update(dt, tNow) {
      resize();
      // camera damping
      const k = Math.min(1, dt * 4.5);
      for (const key of ['az', 'el', 'r', 'tx', 'ty', 'tz']) cam[key] += (camGoal[key] - cam[key]) * k;
      camera.position.set(
        cam.tx + cam.r * Math.cos(cam.el) * Math.sin(cam.az),
        cam.ty + cam.r * Math.sin(cam.el),
        cam.tz + cam.r * Math.cos(cam.el) * Math.cos(cam.az),
      );
      camera.lookAt(cam.tx, cam.ty, cam.tz);

      // signals
      for (const arm of ARMS) {
        const st = sim.signalFor(arm);
        const sg = signals[arm];
        for (const name of ['red', 'amber', 'green']) {
          sg.lamps[name].mesh.material.color.setHex(st === name ? sg.lamps[name].on : lampOff);
        }
        const walk = sim.state.phase === 'PED';
        sg.ped.red.mesh.material.color.setHex(walk ? lampOff : sg.ped.red.on);
        sg.ped.green.mesh.material.color.setHex(walk ? sg.ped.green.on : lampOff);
      }

      // vehicles
      const used = { car: 0, auto: 0, tw: 0, bus: 0 };
      for (const v of sim.state.vehicles) {
        const slot = pools[v.type][used[v.type]++];
        if (!slot) continue;
        slot.group.visible = true;
        slot.group.position.set(v.x, 0, v.z);
        slot.group.rotation.y = Math.atan2(v.hx, v.hz);
        if (slot.vehId !== v.id) { slot.vehId = v.id; slot.bodyMat.color.setHex(v.color); }
        slot.brake.visible = v.decelNow > 2.2;
      }
      for (const t of Object.keys(pools)) {
        for (let i = used[t]; i < pools[t].length; i++) pools[t][i].group.visible = false;
      }
      // pedestrians
      let pu = 0;
      for (const p of sim.state.peds) {
        const slot = pedPool[pu++];
        if (!slot) break;
        slot.group.visible = true;
        const moving = p.state === 'cross' || p.state === 'cross1' || p.state === 'cross2';
        const bob = moving ? Math.abs(Math.sin(tNow * 9 + p.id * 1.7)) * 0.05 : 0;
        slot.group.position.set(p.x, bob, p.z);
        slot.group.rotation.y = Math.atan2(p.hx, p.hz);
        slot.group.scale.setScalar(p.child ? 0.68 : 1);
        if (slot.pedId !== p.id) { slot.pedId = p.id; slot.shirtMat.color.setHex(p.shirt); }
      }
      for (let i = pu; i < pedPool.length; i++) pedPool[i].group.visible = false;

      // heat marker
      const worst = sim.worstArm();
      if (worst) {
        heat.visible = true;
        const hp = pointAt(worst.arm, 16.7, 0);
        heat.position.x += (hp.x - heat.position.x) * Math.min(1, dt * 3);
        heat.position.z += (hp.z - heat.position.z) * Math.min(1, dt * 3);
        const target = Math.min(2 + worst.count * 0.45, 6.5);
        heatDisc.scale.setScalar(target * (1 + 0.05 * Math.sin(tNow * 3)));
        heatRing.scale.setScalar(target * (1 + 0.05 * Math.sin(tNow * 3)));
      } else heat.visible = false;

      // flashes
      for (const f of flashes) {
        if (f.t > 1.3) { f.mesh.visible = false; continue; }
        f.t += dt;
        const u = Math.min(1, f.t / 1.3);
        f.mesh.scale.setScalar(0.6 + u * 3.4);
        f.mesh.material.opacity = 0.9 * (1 - u);
      }

      renderer.render(scene, camera);
    },
  };
}

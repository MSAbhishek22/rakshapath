# RakshaPath 3D

A junction you can make safer.

RakshaPath is a live 3D model of a busy Indian road junction — cars, auto-rickshaws, two-wheelers, a bus, and people on foot, all sharing one signal cycle. It counts the moments that real junctions never record: the near-misses. A pedestrian still on the zebra when the light turns. A rider squeezed into the junction mouth, right where a car is about to turn.

Then it lets you fix the junction. Three small, real interventions are one switch each:

- **Pedestrian refuge island** — people cross in two short stages and wait on a raised island in the middle.
- **Two-wheeler stop box** — riders who filter to the front wait in a marked box, in the open, instead of inside the junction.
- **Rumble strips on the approaches** — traffic arrives calmer, so braking is gentle instead of desperate.

Every near-miss flashes red on the road, lands in the log with a reason, and builds a picture of the junction's worst spot — marked live on the road by a growing red heat marker.

## Run it

It is one static page. No build step, no server, no data collected.

- Open `index.html` in any modern browser, or
- serve the folder: `python3 -m http.server` and visit `http://localhost:8000`

Drag to look around. Scroll to zoom. The controls are on the right: run/pause, speed, traffic density, pedestrian green time, camera views, and the three fixes.

## What it is, honestly

A teaching model with simple rules — left-hand traffic, one fixed signal cycle, drivers who brake for people in their path, some riders who filter. It does not use real traffic data and it does not predict what any real junction will do. In the model's own test runs (10 simulated minutes, steady traffic, 7-second pedestrian phase), the three fixes together cut recorded near-misses from roughly 55–60 to under 10 — the island does most of the work for pedestrians, the stop box ends the cut-ins, and the rumble strips calm the approaches. Your run will differ; that is the point of a model you can argue with.

## Built with

Three.js (r160, vendored in `vendor/`), plain JavaScript modules, no framework. The simulation core (`js/sim.js`) has no rendering code in it; the scene (`js/scene.js`) only draws what the simulation decides.

## Test

`node qa/smoke.mjs` — drives the real page in headless Chromium: checks the traffic flows, the signals cycle, people cross, near-misses get logged, pause freezes time, and each of the three fixes changes behaviour. Results live in `qa/QA_RESULTS.md`.

## For

The Smart Mobility track of i-Hack, E-Summit '26 (E-Cell, IIT Bombay), sponsored by Maruti Suzuki Innovation — integrated intelligent urban mobility: congestion, road safety, traffic management.

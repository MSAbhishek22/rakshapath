# RakshaPath 3D — Submission Pack (i-Hack, Smart Mobility track)

## The event (verified 24 Nov 2026 — see ../REELS_HUNT_2026-11-24.md)

- **Event:** i-Hack, E-Summit '26, E-Cell IIT Bombay — https://www.ecell.in/esummit/ihack
- **Track:** Ideathon — Smart Mobility (Maruti Suzuki Innovation): integrated intelligent urban mobility — congestion, road safety, unsafe-driving detection, traffic management.
- **Prize pool:** ₹2,25,000 for this track.
- **Teams:** 1–4 (solo allowed). Format: hybrid — online round first; only the top ten pitch live at IIT Bombay, 12–13 Dec 2026.
- **Deadline:** registrations close **30 Nov 2026** (time of day not stated on the page — file well before).
- **Fee caveat:** no fee is mentioned for this track, but unlike the FirstCheq track the page does not print "free to enter" — **confirm at the registration form** before assuming.

## What we are filing

**RakshaPath 3D** — a 3D road-intersection safety simulator that runs live in the browser.

- One-line pitch: *A busy Indian junction, rebuilt as a living 3D model that counts its own near-misses — and lets you switch on three small fixes to watch them fall.*
- Problem: near-misses at junctions leave no data, so dangerous crossings stay dangerous. Pedestrians are caught mid-crossing when lights change; two-wheelers filter into the junction mouth, invisible to turning drivers.
- Solution: a real-time 3D simulation (Three.js) of a four-way Indian junction — left-hand traffic, signal cycle with a pedestrian phase, a school zone — that detects, flashes and logs near-misses by type and location, and identifies the worst conflict point live.
- The three testable interventions: pedestrian refuge island (two-stage crossing), two-wheeler stop box, rumble strips on approaches. Each visibly changes the scene and the counts.
- Honest framing for judges: a teaching model with simple rules, not real traffic data. Say this out loud — it is a strength, not a weakness.

## Measured behaviour (model's own runs, 24 Nov 2026)

Node-level simulation runs, 10 simulated minutes each, steady density, 7 s pedestrian phase, repeated 3×:

| Setting | Pedestrian near-misses | Two-wheeler cut-ins | Total |
|---|---|---|---|
| No fixes | 32–44 | 13–21 | 53–63 |
| Refuge island only | 1–4 | 12–20 | 16–24 |
| Stop box only | ~34 | 0 | ~34 |
| All three fixes | 2–7 | 0 | 2–7 |

Also: a longer pedestrian phase (12 s vs 7 s) cuts pedestrian near-misses by roughly a third; rumble strips cap approach speeds (verified on the page by the automated test) and reduce hard braking on the approaches, with their largest effect in combination.

## Filing checklist

- [ ] Register for i-Hack on the E-Summit site **before 30 Nov 2026** and choose the **Smart Mobility (Ideathon)** track. At the form: confirm solo entry is accepted and confirm there is no fee for this track.
- [ ] Deploy the site (see DEPLOY.md) and put the **live URL** in the submission — the model must be clickable, not a video of it.
- [ ] Record the demo video from the **live deployment** (see DEPLOY.md for the 90-second script).
- [ ] GitHub repo public, README from this folder, deployed commit matching the live site.
- [ ] Submission text: use the pitch above; attach the measured-behaviour table; state the teaching-model honesty line plainly.

## Demo script (90 seconds, from the live site)

1. (0–10 s) Open on the junction at Overview. "This is one Indian junction, alive. Watch the crossings."
2. (10–35 s) Let a pedestrian phase end with people still crossing; a near-miss flashes red and lands in the log. Point at the counter and the worst-spot marker.
3. (35–55 s) Show a two-wheeler filtering to the front and waiting in the junction mouth; a turning car sweeps past — cut-in logged.
4. (55–80 s) Reset the run. Switch on all three fixes. Let it run at 4× — the counters climb far more slowly; riders wait in the green box; people pause on the island.
5. (80–90 s) Close on the outcome figures. "Small fixes. Counted difference. The model is honest about being a model — and that is why its numbers can be argued with."

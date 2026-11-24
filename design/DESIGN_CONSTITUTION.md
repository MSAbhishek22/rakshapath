# RakshaPath 3D — Design Constitution

**Project:** RakshaPath 3D — a 3D road-intersection safety simulator.
**For:** i-Hack, E-Summit '26 (IIT Bombay) — Smart Mobility track, Maruti Suzuki Innovation. Registrations close 30 Nov 2026; prize pool ₹2,25,000; teams 1–4.
**One line:** A busy Indian junction in daylight, running live in the browser — and three small, real fixes you can switch on to watch the near-misses fall.

## References researched before building (5+)

1. **threeui.com** (fetched 24 Nov 2026) — a library of Three.js scenes and components where the 3D scene *is* the product surface, not decoration. Lesson taken: the junction fills the stage; the page exists to serve the scene. Scene economy — every object in frame earns its place.
2. **tasteskill.dev** (fetched 24 Nov 2026) — a design-skill library distilled from 247 curated sites. Lessons taken: **"One motif — one shape runs it all"** and **"The product performs"** (show the thing working, not a picture of it), plus its anti-slop rules: one palette, real type, no purple gradients, no emoji doing the talking. Its app-screen rule — *"quiet panels, aligned figures, colour spent on data"* — governs the stats board.
3. **land-book.com** (fetched 24 Nov 2026) — landing-page gallery. Lesson taken: the proven landing order — bold promise up top, the working product immediately after, proof/figures last. That maps directly onto this page's required structure: problem → solution (the live junction) → outcome (live figures).
4. **dark.design** (fetched 24 Nov 2026) — a gallery of dark-themed sites with strict light discipline: in a dark room, only the meaningful things are lit. Lesson taken **by inversion**: RakshaPath is a *daylight* scene, so the discipline flips — in bright daylight, only the meaningful things are **coloured**. The scene is pale and flat; saturated colour is spent only on signals, warnings, near-miss flashes and the heat marker.
5. **21st.dev** (fetched 24 Nov 2026) — component craft library (shadcn-style conventions): switches, segmented controls and cards that look machined, with clear on/off states. Lesson taken: the three intervention toggles and the camera presets are built like real components — visible state, generous hit areas, no ambiguity about what is on.
6. **godly.website / gsap.com** (from the user's standing reference set) — oversized confident type for the hero sentence, and eased, damped motion (camera moves glide; nothing snaps). Used sparingly: this is an instrument, not a showreel.

## The identity: "The Municipal Sign-Plate"

Indian junctions speak through painted metal plates: white or cream boards, ink-navy lettering, a coloured band for the message that matters. RakshaPath's whole interface is built from that one motif (tasteskill's rule #7):

- **UI surfaces** are sign-plates: warm paper-white (`#FAF6EE`), a 2px ink-navy (`#1C2B39`) border, small-caps plate labels, a thin coloured top band (signal green / amber / red) that says what kind of plate it is.
- **The 3D scene** is flat-shaded low-poly **daylight**: pale sky (`#DCE9EC`), warm asphalt, cream/terracotta/sand buildings, one green school block on the north-east corner. No night, no neon, no fog mood.
- **Colour is spent on meaning only:** signal lamps, the red near-miss flash, the heat marker, and the three intervention colours (island = kerb yellow, stop box = green, rumble strips = rust). Everything else stays quiet.
- **Type:** system grotesque (no webfonts — the app must run offline as static files). Headlines large and plain; figures tabular and aligned like a notice board.

## How this is NOT the other projects

- **Not Night Touge:** no night, no sodium-amber monochrome, no monospace instruments, no speed fantasy. RakshaPath is noon daylight, civic and calm; the drama is people crossing, not velocity.
- **Not SwapSetu's model table:** no spreadsheet/grid aesthetic, no dark slate panels. Data here lives on sign-plates beside a living scene, and every figure on the page is wired to the simulation, not typed in.

## Interaction rules (blueprint Part V)

- Every visible control works or does not ship. Full list in `qa/INTERACTION_INVENTORY.md`.
- The simulation is the demo: play/pause, density, pedestrian-phase timing, three intervention toggles, four camera presets, drag-orbit + zoom, sim speed, reset. Each intervention must *visibly* change the scene and the near-miss counts — a toggle that only flips a label is a failed gate.
- Honesty on the page, in plain words: this is a teaching model with simple rules, not real traffic data and not a prediction for any real junction.
- Performance: pooled vehicles and pedestrians, capped counts, fixed-step simulation, pause when the tab is hidden, pixel-ratio cap. It must stay smooth on a low-end laptop.

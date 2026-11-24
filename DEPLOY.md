# RakshaPath 3D — Deploy & File (remaining steps, for the user's browser)

Everything buildable locally is done: the app, QA, README, submission pack.
What remains needs the user's signed-in browser and accounts. Do these in order.

## 1. GitHub repo

1. Create a public repo named `rakshapath` under github.com/MSAbhishek22 (browser, signed-in session).
2. Push this folder (`~/workspace/hackathons/i-hack/rakshapath/`) as the repo root. The vendored `vendor/three.module.js` (~1.3 MB) goes with it — the page must run with no build step and no CDN.
3. Note the commit hash; the live deployment must match it.

## 2. Live deployment (GitHub Pages is the simplest fit)

1. Repo → Settings → Pages → deploy from branch `main`, folder `/ (root)`.
2. Wait for the Pages URL: `https://msabhishek22.github.io/rakshapath/`
3. Open the live URL as a stranger (logged-out / incognito): confirm the junction loads, traffic moves, and one full signal cycle runs. Click every control once — pause, 4× speed, each camera preset, each of the three fix switches — and watch a near-miss land in the log.
4. If Pages is unavailable, Netlify Drop of the same folder works identically (static files, no build command, publish directory = the folder root).

## 3. Demo video (from the LIVE deployment only)

1. Record the screen on the live URL, following the 90-second script in SUBMISSION_PACK.md.
2. Upload to YouTube as **Public**. Keep the link for the submission form.

## 4. i-Hack registration + filing — deadline 30 Nov 2026

1. Go to https://www.ecell.in/esummit/ihack and register (solo, team of 1).
2. Choose the **Smart Mobility** track (Ideathon, Maruti Suzuki Innovation).
3. **At the form, verify two things before submitting:** (a) solo entry accepted for this track, (b) no entry fee for this track (the track page does not print "free" — if a fee appears, stop and decide deliberately; do not pay by default).
4. Paste: live URL (step 2), GitHub repo (step 1), demo video (step 3), and the pitch + measured-behaviour table from SUBMISSION_PACK.md.
5. Save the submission confirmation / receipt.

## Deadline discipline

- Registrations close **30 Nov 2026** (no time of day published — treat 29 Nov as the working deadline).
- If shortlisted: top-ten live pitch at IIT Bombay, **12–13 Dec 2026** — travel decision is the user's.

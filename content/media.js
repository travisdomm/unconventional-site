/* ==========================================================================
   MEDIA SLOTS — what goes in every visual spot on the site.

   Every visual is a named "slot". The HTML only says
   <div data-slot="about"></div>; this file says what goes in it.

   To fill a slot:
     1. Make or pick the asset to the slot's `spec`.
     2. Save the file into media/ at the slot's `src` path (plus `poster` for video).
     3. Set status: "ready" and write real `alt` text.
     4. Log the prompt + settings in brand/shot-list.md (kept out of the public site).

   status: "empty"  -> the site shows a designed placeholder (safe to deploy)
   status: "ready"  -> the site renders the file at `src`
   If a "ready" file is missing, the slot falls back to the placeholder.

   Open the site with ?dev on the URL to see every slot, its spec and status.

   The site never shows client work, with one deliberate exception chosen by the
   owner: the intro film (one event, from drawing to reality, unnamed and with no
   client branding in frame). Every other visual is abstract brand imagery.
   This file is public; keep prompts and private notes in brand/shot-list.md.
   ========================================================================== */

window.MEDIA_SLOTS = {

  /* ---- Intro film, first versions (not used by any page now) ------------
     These slots fed js/intro.js (v1) and js/film.js (v2). Since 2026-09-26 the
     home page plays film v3 (js/film3.js, the film-s… slots below). film3.js still
     plots "intro-drawing" on its plan screen when it is ready; it reads none of the
     others: a produced MP4 in "intro" would NOT play until playback for it is
     added back to film3.js. */
  "intro": {
    type: "video",
    status: "empty",
    page: "home.html",
    src: "media/intro.mp4",
    poster: "media/intro-poster.jpg",
    alt: "",
    endAt: 0,
    spec: "Optional produced film · 16:9 · 1920×1080 · 12–20 s · no audio · MP4 (H.264) · aim < 12 MB. When ready it replaces the live render. endAt = the second the title card should appear."
  },
  "intro-drawing": {
    type: "image",
    status: "empty",
    usedBy: "the intro film",
    src: "media/intro-drawing.png",
    alt: "",
    invert: false,
    spec: "The owner's engineering drawing from one event (plan or elevation) · PNG/JPG · landscape · min 2400 px wide. Plotted onto the screen in act one. Set invert: true for black lines on white paper. Crop out client names, logos and title-block details."
  },
  "intro-photo-1": {
    type: "image",
    status: "empty",
    usedBy: "the intro film",
    src: "media/intro-photo-1.jpg",
    alt: "",
    spec: "Photo of the same event, finished and lit · 16:9 or wider · min 2400×1350 · JPG/WebP · aim < 600 KB. The last act crossfades through the photos in order. No client branding in frame."
  },
  "intro-photo-2": {
    type: "image",
    status: "empty",
    usedBy: "the intro film",
    src: "media/intro-photo-2.jpg",
    alt: "",
    spec: "Second photo of the same event · same spec as intro-photo-1."
  },
  "intro-photo-3": {
    type: "image",
    status: "empty",
    usedBy: "the intro film",
    src: "media/intro-photo-3.jpg",
    alt: "",
    spec: "Third photo of the same event · same spec as intro-photo-1."
  },
  "intro-photo-4": {
    type: "image",
    status: "empty",
    usedBy: "the intro film",
    src: "media/intro-photo-4.jpg",
    alt: "",
    spec: "Fourth photo of the same event · same spec as intro-photo-1."
  },

  /* ---- Film v3 (home.html and preview.html = Preview 1, played by js/film3.js)
     The footage of the four-scene film, one slot per shot, in playing order.
     A scene plays as footage only when its clips are "ready" and load; until
     then that scene plays on the live canvas (scene 4 needs film-s4-03, so
     the film always ends on the exact name). Missing or "empty" shots are
     skipped. The clips are aria-hidden (the film's text description is in the
     page); alt records what each shot shows.
     Every clip: MP4 (H.264), 1280×720, no audio, about 3 Mbit/s, already
     trimmed to the seconds it plays (built from the 5 s masters in the private
     brand/raw/masters/ by tools/film-encode-all.ps1, which lists the in and out
     point of every shot).
       src         the desktop clip
       srcMobile   the phone file: a 540×960 9:16 strip cut from the master at
                   the shot's focus x, about 1.2 Mbit/s (the desktop clip is
                   used if it is missing)
       poster      the approved keyframe, 1280 px wide JPG (first clip of each scene)
       use         the clip's length in seconds, used until the file loads
       in / out    optional: the seconds to play inside the file (only needed
                   for an untrimmed take)
       focus       0–1: where a phone crops the desktop clip if it has no strip
                   (the same x the strip was cut at)
       hold        (s4-03) the final frame as a still, shown after the clip ends
       phoneEnd    (s3-08) a 9:16 still that phones crossfade to at the end
       phoneStills (s4-03) the unlit and lit 9:16 stills phones get instead of the clip
       exact       (s4-03) the owner's own logo, pixel for pixel: the film ends on it
                   (the hold, or the phones' lit still, dissolves into it under the title;
                   without footage the canvas logo does). "Never larger than its own pixels"
                   holds in CSS px; on 2x/3x screens the 557 px logo is upscaled.
       exact2x     optional (s4-03): the same PNG at exactly twice the size (1306×886), from a
                   larger or vector master of the logo; high-density screens get it and the
                   rule then holds in device pixels too
       overlay     optional: a transparent PNG of lime lines laid over the clip in
                   screen blend (S1-07's traced drawing, made from the chosen take) */
  "film-s1-01": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 1, People)",
    src: "media/film/s1-01.mp4", srcMobile: "media/film/s1-01-m.mp4", poster: "media/film/s1-01.jpg",
    use: 2.5, focus: 0.45,
    alt: "At dusk in a glass meeting room high above a city, a woman in a grey blazer and a man in a black sweater shake hands across a table while two colleagues look on.",
    spec: "S1-01 First meeting: the two leads shake hands in a glass meeting room at dusk (slow dolly). Trimmed to 0.25–2.75 s of the take (the leads drift after 3 s). Phone strip at focus x 0.45 (her face and the handshake). Poster = the keyframe, 1280 px wide."
  },
  /* s1-02a, s1-02b, s1-05 and s2-02 were taken out of the film at the owner's request (2026-09-26):
     status "empty" skips them. Preview 2 (preview2.html, content/media-p2.js) still plays them. */
  "film-s1-02a": {
    type: "video", status: "empty", usedBy: "the home film and Preview 1 (scene 1, People)",
    src: "media/film/s1-02a.mp4", srcMobile: "media/film/s1-02a-m.mp4",
    use: 2.0, focus: 0.55,
    alt: "Close on the woman in the grey blazer, listening, then breaking into a laugh.",
    spec: "S1-02a Talking: she listens and laughs. Trimmed to 0.5–2.5 s. Phone strip at focus x 0.55."
  },
  "film-s1-02b": {
    type: "video", status: "empty", usedBy: "the home film and Preview 1 (scene 1, People)",
    src: "media/film/s1-02b.mp4", srcMobile: "media/film/s1-02b-m.mp4",
    use: 1.5, focus: 0.45,
    alt: "Close on the man in the black sweater nodding, his hand resting on a lime-green notebook.",
    spec: "S1-02b Talking: he nods, the lime notebook under his hand. Trimmed to 3.3–4.8 s (the nod comes late in the take). Phone strip at focus x 0.45."
  },
  "film-s1-03": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 1, People)",
    src: "media/film/s1-03-v2.mp4", srcMobile: "media/film/s1-03-v2-m.mp4",
    use: 2.5, focus: 0.6,
    alt: "A planning room at night: the team gathers at a wall map of a desert mesa while a man in glasses explains the site.",
    spec: "S1-03 The planning room: the team at the map wall; a man in glasses explains the site (re-shot 2026-09-26 at the owner's request; the first take is s1-03.mp4, still used by Preview 2). Trimmed to 0.25–2.75 s; keep the lower left calm for the caption. Phone strip at focus x 0.60."
  },
  "film-s1-04": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 1, People)",
    src: "media/film/s1-04.mp4", srcMobile: "media/film/s1-04-m.mp4",
    use: 1.5, focus: 0.5,
    alt: "A hand pins the summit plateau on a contour map, where it is ringed in lime.",
    spec: "S1-04 The map: the summit plateau is ringed in lime and pinned. Start + end frame shot, trimmed to 3.5–5.0 s. Phone strip at focus x 0.50."
  },
  "film-s1-05": {
    type: "video", status: "empty", usedBy: "the home film and Preview 1 (scene 1, People)",
    src: "media/film/s1-05.mp4", srcMobile: "media/film/s1-05-m.mp4",
    use: 2.0, focus: 0.56,
    alt: "A whiteboard reads 100,000, 3 nights, December beside a wall of dashboard charts, with a team member standing in the foreground.",
    spec: "S1-05 The brief and the KPIs (the site's caption carries the words). Trimmed to 0.25–2.25 s. Phone strip at focus x 0.56 (the whole whiteboard)."
  },
  "film-s1-06": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 1, People)",
    src: "media/film/s1-06-v2.mp4", srcMobile: "media/film/s1-06-v2-m.mp4",
    use: 1.42, focus: 0.5, captions: [],
    alt: "Three dark cards with simple shapes and no words are laid out on a table under a warm lamp; a hand squares the third card into line.",
    spec: "S1-06 Marketing and sponsorship: three wordless cards with plain shapes (re-shot 2026-09-26 at the owner's request: no words, no stray dots; the first take is s1-06.mp4, still used by Preview 2). Trimmed to 0.6–2.0 s. captions: [] turns off the caption box for this shot. Phone strip at focus x 0.50."
  },
  "film-s1-07": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 1, People)",
    src: "media/film/s1-07.mp4", srcMobile: "media/film/s1-07-m.mp4",
    use: 2.0, focus: 0.5,
    alt: "A fineliner finishes the arc of a stage roof on tracing paper laid over the site plan.",
    spec: "S1-07 Inception: a fineliner completes the roof arc on tracing paper (camera nearly locked). Start + end frame shot, trimmed to 3.0–5.0 s. Phone strip at focus x 0.50."
  },
  "film-s1-08": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 1, People)",
    src: "media/film/s1-08.mp4", srcMobile: "media/film/s1-08-m.mp4",
    use: 3.0, focus: 0.5,
    alt: "The handshake over the table, then the camera tilts down and pushes in until the stage plan drawing fills the frame from directly above.",
    spec: "S1-08 Agreement, then into the drawing: ends top-down on the drawing (black lines on white paper), which the site darkens, turns lime and dissolves into the canvas drawing. Trimmed to 2.0–5.0 s. Phone strip at focus x 0.50."
  },
  "film-s2-01": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 2, Build)",
    src: "media/film/s2-01.mp4", srcMobile: "media/film/s2-01-m.mp4", poster: "media/film/s2-01.jpg",
    use: 2.0, focus: 0.5,
    alt: "Night on the mesa: six lattice towers carry an arched stage roof as it reaches trim on chain hoists, with crew and road cases on the deck below.",
    spec: "S2-01 The roof reaches trim: the match cut from the canvas at T.realCut (36.0 s); the canvas dissolves into it. Trimmed to 0.25–2.25 s. Seen from house left, empty hang bars (no LED or PA yet). Phone strip at focus x 0.50. Poster = the keyframe, 1280 px wide."
  },
  "film-s2-02": {
    type: "video", status: "empty", usedBy: "the home film and Preview 1 (scene 2, Build)",
    src: "media/film/s2-02.mp4", srcMobile: "media/film/s2-02-m.mp4",
    use: 1.5, focus: 0.5,
    alt: "A gloved hand drives a steel pin into a truss joint beside a shackle and chain, a lime work light glowing behind.",
    spec: "S2-02 Pins, clips and chain: rigging detail. Trimmed to 0.25–1.75 s. Phone strip at focus x 0.50."
  },
  "film-s2-03": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 2, Build)",
    src: "media/film/s2-03.mp4", srcMobile: "media/film/s2-03-m.mp4",
    use: 1.5, focus: 0.5,
    alt: "A giant LED wall above the stage deck ramps smoothly from dark to full white.",
    spec: "S2-03 Video: the LED wall comes alive in one soft ramp (no strobe). Trimmed to 2.7–4.2 s (the ramp is at 3.3–3.9 s of the take). Phone strip at focus x 0.50."
  },
  "film-s2-03b": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 2, Build)",
    src: "media/film/s2-03b.mp4", srcMobile: "media/film/s2-03b-m.mp4",
    use: 1.5, focus: 0.5,
    alt: "A row of moving-head lights on a silver truss tilts together during the focus call, two of the beams lime.",
    spec: "S2-03b Lighting: the focus call, a truss of moving heads tilts together. Trimmed to 1.8–3.3 s. Phone strip at focus x 0.50."
  },
  "film-s2-04": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 2, Build)",
    src: "media/film/s2-04.mp4", srcMobile: "media/film/s2-04-m.mp4",
    use: 1.5, focus: 0.45,
    alt: "A curved line-array speaker hang rises into the night over the desert ground while crew hold its tag line.",
    spec: "S2-04 Audio: the line array flies. Trimmed to 0.25–1.75 s. Phone strip at focus x 0.45."
  },
  "film-s2-05": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 2, Build)",
    src: "media/film/s2-05.mp4", srcMobile: "media/film/s2-05-m.mp4",
    use: 2.0, focus: 0.5,
    alt: "Blue-hour drone view of the finished stage on the mesa, a halo ring on its LED wall and a lime beam rising, as a line of crew walks out toward it.",
    spec: "S2-05 Blue hour: the finished site, the crew walk out toward it. Trimmed to 0.25–2.25 s; hard cut to S3-01. Phone strip at focus x 0.50."
  },
  "film-s3-01": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 3, Arrival)",
    src: "media/film/s3-01.mp4", srcMobile: "media/film/s3-01-m.mp4", poster: "media/film/s3-01.jpg",
    use: 2.0, focus: 0.55,
    alt: "A plain white private jet flies level over layered desert ridges at golden hour.",
    spec: "S3-01 The jet on approach at golden hour. Trimmed to 0.25–2.25 s. Phone strip at focus x 0.55. Poster = the keyframe, 1280 px wide."
  },
  "film-s3-02": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 3, Arrival)",
    src: "media/film/s3-02.mp4", srcMobile: "media/film/s3-02-m.mp4",
    use: 1.5, focus: 0.55,
    alt: "In the jet cabin, the woman looks out of an oval window at the summit of the mesa glowing far below.",
    spec: "S3-02 Cabin: the first glimpse of the summit. Trimmed to 0.25–1.75 s. Phone strip at focus x 0.55 (her profile and the window)."
  },
  "film-s3-03": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 3, Arrival)",
    src: "media/film/s3-03.mp4", srcMobile: "media/film/s3-03-m.mp4",
    use: 2.0, focus: 0.6,
    alt: "Sunset at a low stone-and-glass desert hotel: two guests walk a lantern-lit path toward the entrance, where a porter waits.",
    spec: "S3-03 Hotel arrival: low stone-and-glass pavilions. Trimmed to 0.25–2.25 s. Phone strip at focus x 0.60 (the two figures)."
  },
  "film-s3-04": {
    type: "video", status: "empty", usedBy: "the home film and Preview 1 (scene 3, Arrival)",
    src: "media/film/s3-04.mp4", srcMobile: "media/film/s3-04-m.mp4",
    use: 1.5, focus: 0.5, alt: "",
    spec: "S3-04 Lobby (optional, outside the budget, first to cut; not generated): a key card handed over. Uses 1.5 s. Phone strip at focus x 0.50."
  },
  "film-s3-05": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 3, Arrival)",
    src: "media/film/s3-05.mp4", srcMobile: "media/film/s3-05-m.mp4",
    use: 1.5, focus: 0.5,
    alt: "Dusk from far out over the valley: coach headlights climb a switchback road to the lit venue on top of the mesa, a lime beam standing above it.",
    spec: "S3-05 The climb: shuttles on the road up the mesa. Trimmed to 0.25–1.75 s. Phone strip at focus x 0.50."
  },
  "film-s3-06": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 3, Arrival)",
    src: "media/film/s3-06.mp4", srcMobile: "media/film/s3-06-m.mp4",
    use: 3.0, focus: 0.5,
    alt: "A drone rises over the dark rim of the mesa and reveals the whole venue on the summit plateau at dusk.",
    spec: "S3-06 The reveal: the venue on the summit plateau at dusk. Ends on the venue master: trimmed to 2.0–5.0 s. Phone strip at focus x 0.50."
  },
  "film-s3-07": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 3, Arrival)",
    src: "media/film/s3-07.mp4", srcMobile: "media/film/s3-07-m.mp4",
    use: 2.0, focus: 0.5,
    alt: "Through the entry arches, four friends walk arm in arm toward the glowing stage; a raised fist wears a lime wristband.",
    spec: "S3-07 Gates: wristbands (no logos), friends flowing into the field. Trimmed to 0.25–2.25 s. Phone strip at focus x 0.50."
  },
  "film-s3-08": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 3, Arrival)",
    src: "media/film/s3-08.mp4", srcMobile: "media/film/s3-08-m.mp4", phoneEnd: "media/film/s3-08-9x16.jpg",
    use: 3.5, focus: 0.5,
    alt: "A drone pulls up and back from raised hands and phone lights over a vast packed crowd filling the summit plateau at night, lime lasers overhead.",
    spec: "S3-08 The crowd: a drone pulls back over hands and phone lights to the whole packed plateau (no number on screen). Trimmed to 1.5–5.0 s (the first 1.5 s of the take are never published). Phone strip at focus x 0.50; phones crossfade to phoneEnd (a 9:16 still of the end frame, 1080×1920 JPG) over the last 0.8 s."
  },
  "film-s3-09": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 3, Arrival)",
    src: "media/film/s3-09.mp4", srcMobile: "media/film/s3-09-m.mp4",
    use: 1.5, focus: 0.5,
    alt: "In the crowd, a woman on a friend's shoulders laughs with her arm raised as a lime laser skims overhead.",
    spec: "S3-09 Joy: close-ups in the crowd, a laser skimming overhead. Trimmed to 0.25–1.75 s. Phone strip at focus x 0.50."
  },
  "film-s3-10": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 3, Arrival)",
    src: "media/film/s3-10.mp4", srcMobile: "media/film/s3-10-m.mp4",
    use: 2.5, focus: 0.65,
    alt: "On the front-of-house riser, the woman turns to the man with a small smile while the technical director sits at the console, the crowd glowing beyond.",
    spec: "S3-10 The team at FOH, watching what they built; she turns to him, he answers; then a dip to black. Trimmed to 0.25–2.75 s. Phone strip at focus x 0.65 (both faces)."
  },
  "film-s4-01": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 4, Unconventional)",
    src: "media/film/s4-01.mp4", srcMobile: "media/film/s4-01-m.mp4", poster: "media/film/s4-01.jpg",
    use: 1.5, focus: 0.5,
    alt: "Macro inside a giant steel letter U: a gloved hand tightens a bolt beside X-shaped truss lacing and an unlit neon tube.",
    spec: "S4-01 Built: a gloved hand bolts the steel U together (macro in the channel). Trimmed to 0.25–1.75 s. Phone strip at focus x 0.50. Poster = the keyframe, 1280×720. Scene 4 plays as footage only when film-s4-03 is ready too."
  },
  "film-s4-02": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 4, Unconventional)",
    src: "media/film/s4-02.mp4", srcMobile: "media/film/s4-02-m.mp4",
    use: 2.5, focus: 0.5,
    alt: "At night the giant steel U is lowered on two chain hoists and settles onto its cradles on the stage deck while two riggers steady it.",
    spec: "S4-02 Brought into place: the giant U is lowered on two chain hoists and lands on the deck. Ends landed: trimmed to 2.5–5.0 s. Phone strip at focus x 0.50."
  },
  "film-s4-03": {
    type: "video", status: "ready", usedBy: "the home film and Preview 1 (scene 4, Unconventional)",
    src: "media/film/s4-03.mp4", hold: "media/film/s4-hold.jpg",
    phoneStills: ["media/film/s4-03-9x16-dark.jpg", "media/film/s4-03-9x16.jpg"],
    exact: "media/film/logo-exact.png",
    use: 4.75, focus: 0.5,
    alt: "At night the neon inside the steel U strikes, then the word UNCONVENTIONAL lights up below it on the stage deck.",
    spec: "S4-03 Lit: the neon in the U strikes, then UNCONVENTIONAL lights (all letters together in this take, not left to right); locked camera. Trimmed to 0.25–5.0 s (the strike starts at 0.25 s). Desktop only (no phone strip: the word is too wide). hold = the final frame as a 1920×1080 JPG, crossfaded in after the clip. phoneStills = two 9:16 JPGs (1080×1920), unlit then lit, wiped left to right on phones. exact = the owner's logo (brand/unconventional-logo.jpg, 557×347) copied pixel for pixel into a 653×443 PNG whose 48 px margin continues its dark backdrop and fades it out (the backdrop also fades a little into the photo at the left, top and right, where there is no mark); the film ends on it: under the title card the hold (phones: the lit still) dissolves into it, the U laid over the U, never shown larger than its own pixels."
  },

  /* ---- Who we are: 01 Why we exist --------------------------------------- */
  "about": {
    type: "image",
    status: "empty",
    page: "about.html",
    src: "media/about.jpg",
    alt: "",
    spec: "Image · 4:5 portrait · min 1200×1500 · JPG/WebP · aim < 400 KB. Sits beside the thesis text; moody, abstract."
  },

  /* ---- Who we are: 03 What we do (3 cards) ------------------------------- */
  "offer-1": {
    type: "image",
    status: "empty",
    page: "about.html",
    src: "media/offer-1.jpg",
    alt: "",
    spec: "Image · 4:3 · min 1200×900 · JPG/WebP · aim < 300 KB. Flagship cultural moments. The three offer images should feel like one series."
  },
  "offer-2": {
    type: "image",
    status: "empty",
    page: "about.html",
    src: "media/offer-2.jpg",
    alt: "",
    spec: "Image · 4:3 · min 1200×900 · JPG/WebP · aim < 300 KB. Embedded experiential partner. Series with offer-1 / offer-3."
  },
  "offer-3": {
    type: "image",
    status: "empty",
    page: "about.html",
    src: "media/offer-3.jpg",
    alt: "",
    spec: "Image · 4:3 · min 1200×900 · JPG/WebP · aim < 300 KB. Artist- and athlete-led platforms. Series with offer-1 / offer-2."
  },

  /* ---- Who we are: 06 Contact -------------------------------------------- */
  "cta": {
    type: "image",
    status: "empty",
    page: "about.html",
    src: "media/cta.jpg",
    alt: "",
    spec: "Image or silent loop · 21:9 wide · min 2400×1030 · sits behind centred text under a dark scrim, so low-detail and moody works best."
  },

  /* ---- Social share card (not shown on the page) ------------------------- */
  "og-image": {
    type: "image",
    status: "empty",
    src: "media/og-image.jpg",
    alt: "",
    spec: "Image · exactly 1200×630 · JPG · < 300 KB. Shown when the site link is shared (iMessage, LinkedIn, X...). Referenced from the <head> of every page, so the filename must stay media/og-image.jpg.",
    offPage: true
  }
};

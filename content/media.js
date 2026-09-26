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

  /* ---- Intro film (home page) -------------------------------------------
     The home page opens on a film: an engineering drawing on a screen becomes
     a 3D build, piece by piece, then the real event. Until a produced film is
     ready, js/intro.js renders it live, and the three slots below feed it. */
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

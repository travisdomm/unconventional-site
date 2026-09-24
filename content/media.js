/* ==========================================================================
   MEDIA SLOTS — what goes in every visual spot on the site.

   Every visual is a named "slot". The HTML only says
   <div data-slot="hero"></div>; this file says what goes in it.

   To fill a slot:
     1. Generate the asset in Higgsfield to the slot's `spec`.
     2. Save the file into media/ at the slot's `src` path (plus `poster` for video).
     3. Set status: "ready" and write real `alt` text.
     4. Log the prompt + settings in brand/shot-list.md (kept out of the public site).

   status: "empty"  -> the site shows a designed placeholder (safe to deploy)
   status: "ready"  -> the site renders the file at `src`
   If a "ready" file is missing, the slot falls back to the placeholder.

   Open the site with ?dev on the URL to see every slot, its spec and status.

   The site never shows client work: every visual here is abstract brand
   imagery, not a project. This file is public; keep prompts and private
   notes in brand/shot-list.md instead.
   ========================================================================== */

window.MEDIA_SLOTS = {

  /* ---- Hero ------------------------------------------------------------ */
  "hero": {
    type: "video",
    status: "empty",
    src: "media/hero.mp4",
    poster: "media/hero-poster.jpg",
    alt: "",
    spec: "Video · 16:9 · 1920×1080 · 6–10s seamless loop · no audio · MP4 (H.264) · aim < 8 MB. Abstract, not a project. Text sits bottom-left, so keep that area calm and dark."
  },

  /* ---- Thesis portrait --------------------------------------------------- */
  "about": {
    type: "image",
    status: "empty",
    src: "media/about.jpg",
    alt: "",
    spec: "Image · 4:5 portrait · min 1200×1500 · JPG/WebP · aim < 400 KB. Sits beside the thesis text; moody, abstract."
  },

  /* ---- What we do (3 cards) --------------------------------------------- */
  "offer-1": {
    type: "image",
    status: "empty",
    src: "media/offer-1.jpg",
    alt: "",
    spec: "Image · 4:3 · min 1200×900 · JPG/WebP · aim < 300 KB. Flagship cultural moments. The three offer images should feel like one series."
  },
  "offer-2": {
    type: "image",
    status: "empty",
    src: "media/offer-2.jpg",
    alt: "",
    spec: "Image · 4:3 · min 1200×900 · JPG/WebP · aim < 300 KB. Embedded experiential partner. Series with offer-1 / offer-3."
  },
  "offer-3": {
    type: "image",
    status: "empty",
    src: "media/offer-3.jpg",
    alt: "",
    spec: "Image · 4:3 · min 1200×900 · JPG/WebP · aim < 300 KB. Artist- and athlete-led platforms. Series with offer-1 / offer-2."
  },

  /* ---- Contact call-to-action ------------------------------------------- */
  "cta": {
    type: "image",
    status: "empty",
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
    spec: "Image · exactly 1200×630 · JPG · < 300 KB. Shown when the site link is shared (iMessage, LinkedIn, X...). Referenced from the <head> of index.html, so the filename must stay media/og-image.jpg.",
    offPage: true
  }
};

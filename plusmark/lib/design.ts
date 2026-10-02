/** Site design variants shown to the client (see ThemeSwitcher and globals.css). */
export type DesignId = "a" | "b" | "c" | "d" | "e";

export const DESIGN_STORAGE_KEY = "plusmark-design";

/** Design D has its own home page (a completely different layout); A–C share the classic one. */
export const EXPERIENCE_PATH = "/experience";
/** Design E: the 3D product showroom home. Shares D's palette. */
export const SHOWROOM_PATH = "/showroom";

/** Designs with their own home page. Everything else uses "/". */
export const DESIGN_HOMES: Partial<Record<DesignId, string>> = { d: EXPERIENCE_PATH, e: SHOWROOM_PATH };
export const homeFor = (id: DesignId) => DESIGN_HOMES[id] ?? "/";
/** Paths that render their own navigation (the site navbar is hidden there). */
export const CUSTOM_HOME_PATHS = Object.values(DESIGN_HOMES) as string[];

export const DESIGNS: { id: DesignId; name: string; note: string; swatch: [string, string] }[] = [
  { id: "a", name: "Studio", note: "Original: neutral aluminium studio look, graphite accents.", swatch: ["#5d636b", "#1d5fa8"] },
  { id: "b", name: "Azure", note: "Bright white & royal blue, rounded cards, Plus Jakarta Sans.", swatch: ["#1a3587", "#1f7ae0"] },
  { id: "c", name: "Chalk & Sun", note: "Warm cream, chalkboard green & orange, editorial serif headings.", swatch: ["#1f5446", "#f07c1a"] },
  {
    id: "d",
    name: "Hyper 3D",
    note: "All-new layout: a scroll-driven 3D showroom with studio-lit boards, close-up annotations and a 360° film. White, lavender & deep indigo.",
    swatch: ["#1b1740", "#4f3fd9"],
  },
  {
    id: "e",
    name: "Showroom",
    note: "One pinned 3D stage: each board is introduced, turned, inspected up close (frame, surface) and handed over to the next. Drag to rotate.",
    swatch: ["#6f63f0", "#2a2380"],
  },
];

/**
 * Runs before first paint (inlined in <head>): applies ?design=… or the stored choice so the
 * page never flashes the wrong variant. Designs with their own home page (D, E) forward "/"
 * there, and each of those homes always renders in its own palette.
 */
export const designBootScript = `(function(){try{var k=${JSON.stringify(DESIGN_STORAGE_KEY)};var H=${JSON.stringify(DESIGN_HOMES)};var p=location.pathname;var q=new URLSearchParams(location.search).get('design');var v=q||localStorage.getItem(k);if(q)localStorage.setItem(k,q);for(var id in H){if(H[id]===p)v=id;}if(p==='/'&&v&&H[v]){location.replace(H[v]+location.search+location.hash);}if(v==='b'||v==='c'||v==='d'||v==='e')document.documentElement.dataset.theme=v;}catch(e){}})();`;

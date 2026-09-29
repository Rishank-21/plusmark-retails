/** Site design variants shown to the client (see ThemeSwitcher and globals.css). */
export type DesignId = "a" | "b" | "c" | "d";

export const DESIGN_STORAGE_KEY = "plusmark-design";

/** Design D has its own home page (a completely different layout); A–C share the classic one. */
export const EXPERIENCE_PATH = "/experience";

export const DESIGNS: { id: DesignId; name: string; note: string; swatch: [string, string] }[] = [
  { id: "a", name: "Studio", note: "Original: neutral aluminium studio look, graphite accents.", swatch: ["#5d636b", "#1d5fa8"] },
  { id: "b", name: "Azure", note: "Bright white & royal blue, rounded cards, Plus Jakarta Sans.", swatch: ["#1a3587", "#1f7ae0"] },
  { id: "c", name: "Chalk & Sun", note: "Warm cream, chalkboard green & orange, editorial serif headings.", swatch: ["#1f5446", "#f07c1a"] },
  {
    id: "d",
    name: "Hyper 3D",
    note: "All-new layout: WebGL boards that move with the scroll, a scroll-scrubbed 3D film, glass UI in violet & cyan.",
    swatch: ["#6d4aff", "#12c2e9"],
  },
];

/**
 * Runs before first paint (inlined in <head>): applies ?design=… or the stored choice so the
 * page never flashes the wrong variant. Design D lives on its own home page, so "/" forwards
 * there, and the D home always renders in the D palette.
 */
export const designBootScript = `(function(){try{var k=${JSON.stringify(DESIGN_STORAGE_KEY)};var X=${JSON.stringify(EXPERIENCE_PATH)};var p=location.pathname;var q=new URLSearchParams(location.search).get('design');var v=q||localStorage.getItem(k);if(q)localStorage.setItem(k,q);if(p===X){v='d';}else if(v==='d'&&p==='/'){location.replace(X+location.search+location.hash);}if(v==='b'||v==='c'||v==='d')document.documentElement.dataset.theme=v;}catch(e){}})();`;

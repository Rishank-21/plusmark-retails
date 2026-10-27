const ORIGIN = "https://plusmarkboards.com";
const URLS = [
  "/", "/products", "/products/eco-premium-white-board", "/products/eco-white-board",
  "/products/magnetic-white-board", "/products/white-boards", "/products/stands-boards",
  "/contact", "/faq", "/quality", "/about", "/blog", "/sitemap.xml", "/robots.txt",
  "/services", "/testimonials",
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  for (let a = 1; a <= 4; a++) {
    const t = Date.now();
    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 25000);
      const r = await fetch(url, { signal: ac.signal, redirect: "manual", headers: { "User-Agent": "Mozilla/5.0 verification" } });
      const body = await r.text();
      clearTimeout(to);
      return { status: r.status, ms: Date.now() - t, h: Object.fromEntries(r.headers.entries()), body, attempts: a };
    } catch (e) {
      if (a === 4) return { status: "ERR " + e.name, ms: Date.now() - t, h: {}, body: "", attempts: a };
      await sleep(3000);
    }
  }
}

let html = 0, err = 0;
for (const u of URLS) {
  const r = await (async () => get(ORIGIN + u))();
  const cc = r.h["cache-control"] || "-";
  const ccs = r.h["cf-cache-status"] || "-";
  const age = r.h["age"] || "-";
  if (typeof r.status === "number" && r.status >= 500) err++;
  else html++;
  console.log(`${String(r.status).padEnd(4)} ${String(r.ms).padStart(5)}ms ${ccs.padEnd(6)} age=${age.padEnd(4)} cc="${cc}" try=${r.attempts} ${u}`);
  await sleep(1500);
}
console.log(`\nOK/non-5xx ${html} | 5xx-or-ERR ${err}`);

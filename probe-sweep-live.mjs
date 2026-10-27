const ORIGIN = "https://plusmarkboards.com";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^(https?:\/\/[^/]+)/, ORIGIN)))];
let fail = 0, hit = 0, miss = 0, slow = 0;
const bad = [];
const times = [];
for (const [i, u] of pages.entries()) {
  const t = Date.now();
  let res;
  try {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 25000);
    res = await fetch(u, { signal: ac.signal });
    await res.text();
    clearTimeout(to);
  } catch (e) {
    fail++;
    bad.push(`ERR ${e.name} ${Date.now() - t}ms ${u}`);
    continue;
  }
  const ms = Date.now() - t;
  times.push(ms);
  if (res.status >= 500) { fail++; bad.push(`${res.status} ${ms}ms ${u}`); continue; }
  if (res.status >= 400) { bad.push(`${res.status} ${ms}ms ${u}`); continue; }
  const c = res.headers.get("x-nextjs-cache");
  if (c === "HIT") hit++;
  else miss++;
  if (ms > 4000) { slow++; bad.push(`SLOW ${res.status} ${ms}ms ${u}`); }
  if (i % 20 === 0) console.log(`… ${i + 1}/${pages.length} fails=${fail}`);
  await sleep(700);
}
times.sort((a, b) => a - b);
const p = (q) => times[Math.floor(times.length * q)] || 0;
console.log(`\nsitemap pages ${pages.length} | 5xx/ERR ${fail} | HIT ${hit} | MISS/other ${miss} | slow>4s ${slow}`);
console.log(`p50 ${p(0.5)}ms p90 ${p(0.9)}ms max ${times[times.length - 1] || 0}ms`);
for (const b of bad) console.log("  " + b);

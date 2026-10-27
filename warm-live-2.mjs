const O = "https://plusmarkboards.com";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const xml = await (await fetch(`${O}/sitemap.xml`)).text();
const pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^(https?:\/\/[^/]+)/, O)))];
const MAX_ATTEMPTS = 6;
let warmed = 0, stuck = 0, attemptsTotal = 0;
const failed = [];
for (const [i, u] of pages.entries()) {
  let done = false;
  for (let a = 1; a <= MAX_ATTEMPTS && !done; a++) {
    attemptsTotal++;
    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 25000);
      const r = await fetch(u, { signal: ac.signal });
      const body = await r.text();
      clearTimeout(to);
      const cpu = /exceeded resource limits|error code: 1102/i.test(body) || r.status >= 500;
      if (!cpu) {
        warmed++;
        if (r.status >= 400) failed.push(`${r.status} ${u}`);
        done = true;
        break;
      }
    } catch (e) { /* network/CPU abort -> retry */ }
    await sleep(1200 * a);
  }
  if (!done) { stuck++; failed.push(`STUCK ${u}`); }
  if (i % 20 === 0) console.log(`… ${i + 1}/${pages.length} warmed=${warmed} stuck=${stuck}`);
  await sleep(150);
}
console.log(`\npages ${pages.length} | warmed ${warmed} | stuck ${stuck} | requests ${attemptsTotal}`);
console.log(`retries/page ${(attemptsTotal / pages.length).toFixed(2)}`);
for (const f of failed) console.log("  " + f);

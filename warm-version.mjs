/*
 * Warm a Worker version's KV incremental cache by walking every sitemap URL once,
 * sequentially, retrying the 1102-prone cold renders. Concurrency stays at 1 because
 * parallel requests against uncached pages is what produced the 503 storm.
 */
const ORIGIN = process.argv[2];
const MAX_ATTEMPTS = Number(process.argv[3] ?? 3);

const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const pages = [...new Set(
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^(https?:\/\/[^/]+)/, ORIGIN))
    .filter((u) => u.startsWith(ORIGIN))
)];
console.log(`warming ${pages.length} pages (first pass renders, later passes should hit KV)`);

const results = [];
for (const u of pages) {
  let status = "ERR", cache = "-", attempts = 0, ms = 0;
  for (let a = 0; a < MAX_ATTEMPTS; a++) {
    attempts++;
    const t = Date.now();
    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 30000);
      const r = await fetch(u, { signal: ac.signal });
      const body = await r.text();
      clearTimeout(to);
      ms = Date.now() - t;
      status = r.status;
      cache = r.headers.get("x-nextjs-cache") ?? "-";
      if (r.ok) break;
      if (/exceeded resource limits|error code: 1102/.test(body)) {
        await new Promise((s) => setTimeout(s, 1500));
      } else break;
    } catch (e) {
      ms = Date.now() - t;
      status = "ERR:" + e.name;
      await new Promise((s) => setTimeout(s, 1500));
    }
  }
  results.push({ status, cache, attempts, ms, u });
  if (!String(status).startsWith("2") || attempts > 1) console.log(`  ${status} ${cache} ${attempts}x ${ms}ms ${u}`);
  await new Promise((s) => setTimeout(s, 300));
}

const fails = results.filter((r) => !String(r.status).startsWith("2"));
const hits = results.filter((r) => r.cache === "HIT");
console.log(`pages ${results.length} | non-2xx ${fails.length} | KV HIT ${hits.length} | retried ${results.filter((r) => r.attempts > 1).length}`);
for (const f of fails) console.log(`  STILL FAILING ${f.status} ${f.u}`);

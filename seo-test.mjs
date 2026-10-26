const B = `http://127.0.0.1:${process.argv[2] ?? 3611}`;
const HOST = "https://plusmarkboards.com";
const dec = (s) => (s || "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

let pass = 0, fail = 0;
const ok = (label, cond, extra = "") => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}${extra ? "  -> " + extra : ""}`); }
};

const attr = (h, re) => dec((h.match(re) || [])[1]);

(async () => {
  // ---------- sitemap ----------
  const xml = await (await fetch(`${B}/sitemap.xml`)).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = locs.map((l) => new URL(l).pathname);
  console.log(`\n=== SITEMAP (${locs.length} URLs) ===`);
  ok("all sitemap URLs are on the apex host, no www", locs.every((l) => l.startsWith(HOST) && !l.includes("//www.")));
  ok("no duplicate sitemap URLs", new Set(locs).size === locs.length);
  ok("/blog is in the sitemap", paths.includes("/blog"));
  const blogPaths = paths.filter((p) => p.startsWith("/blog/"));
  const N = blogPaths.length;
  ok("sitemap carries the full guide corpus (>=38)", N >= 38, `${N} found`);
  const blogLastmod = [...xml.matchAll(/<url>(?:(?!<\/url>)[\s\S])*?\/blog\/[\s\S]*?<\/url>/g)]
    .filter((u) => /<lastmod>/.test(u[0])).length;
  ok("guide entries carry a real lastmod", blogLastmod === N, `${blogLastmod}/${N}`);

  // ---------- crawl every URL ----------
  const pages = new Map();
  for (const p of paths) {
    const r = await fetch(B + p);
    pages.set(p, { status: r.status, html: await r.text() });
  }
  console.log(`\n=== EVERY SITEMAP URL (${paths.length}) ===`);
  const bad = (pred, label) => {
    const hits = [...pages].filter(([, v]) => pred(v));
    ok(`${label} (${paths.length - hits.length}/${paths.length})`, hits.length === 0, hits.slice(0, 6).map(([p]) => p).join(", "));
  };
  bad((v) => v.status !== 200, "HTTP 200");
  bad((v) => { const t = attr(v.html, /<title>([^<]*)<\/title>/); return !t || t.length > 60; }, "title present and <=60 chars");
  bad((v) => { const d = attr(v.html, /<meta name="description" content="([^"]*)"/); return !d || d.length > 170; }, "description present and <=170");
  bad((v) => { const c = attr(v.html, /<link rel="canonical" href="([^"]*)"/); return !c || !c.startsWith(HOST); }, "canonical on apex host");
  bad((v) => !attr(v.html, /<meta property="og:image" content="([^"]*)"/).startsWith("https://"), "og:image absolute");
  bad((v) => /noindex/.test(v.html), "no noindex anywhere in the sitemap");
  bad((v) => (v.html.match(/<h1\b/gi) || []).length !== 1, "exactly one h1");
  bad((v) => {
    const lv = [...v.html.matchAll(/<h([1-6])\b/gi)].map((m) => +m[1]);
    for (let i = 1; i < lv.length; i++) if (lv[i] > lv[i - 1] + 1) return true;
    return false;
  }, "no heading level skips");

  // JSON-LD parses everywhere
  let ldErr = 0, ldBlocks = 0;
  for (const [, v] of pages) {
    for (const m of v.html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
      ldBlocks++;
      try { JSON.parse(m[1]); } catch { ldErr++; }
    }
  }
  ok(`every JSON-LD block parses (${ldBlocks} blocks)`, ldErr === 0, `${ldErr} invalid`);

  // ---------- per-page canonical == own URL ----------
  let canonMismatch = [];
  for (const [p, v] of pages) {
    const c = attr(v.html, /<link rel="canonical" href="([^"]*)"/);
    const want = p === "/" ? HOST : HOST + p;
    if (c !== want) canonMismatch.push(`${p} -> ${c}`);
  }
  ok("canonical equals the page's own sitemap URL", canonMismatch.length === 0, canonMismatch.slice(0, 5).join(" | "));

  // ---------- blog detail checks ----------
  console.log("\n=== BLOG ===");
  const idx = pages.get("/blog");
  ok("/blog has CollectionPage + ItemList", /"@type":"CollectionPage"/.test(idx.html) && /"@type":"ItemList"/.test(idx.html));
  const idxLinks = [...new Set([...idx.html.matchAll(/href="\/blog\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
  const missingFromIndex = blogPaths.map((p) => p.slice("/blog/".length)).filter((s) => !idxLinks.includes(s));
  ok("/blog links to every guide in the sitemap", missingFromIndex.length === 0, `${idxLinks.length} linked, missing: ${missingFromIndex.slice(0, 5).join(", ")}`);

  let artOk = 0, faqOk = 0, crumbOk = 0, relOk = 0, prevnextOk = 0, coverOk = 0;
  const brokenRelated = [];
  for (const p of blogPaths) {
    const v = pages.get(p);
    const types = [...v.html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
      .flatMap((m) => { try { return (Array.isArray(JSON.parse(m[1])) ? JSON.parse(m[1]) : [JSON.parse(m[1])]).map((s) => s["@type"]); } catch { return []; } });
    if (types.includes("Article")) artOk++;
    if (types.includes("FAQPage")) faqOk++;
    if (types.includes("BreadcrumbList")) crumbOk++;
    // Article schema must carry the fields Google validates
    const art = [...v.html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
      .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } })
      .flat().filter(Boolean).find((s) => (s["@type"] === "Article"));
    if (art && art.headline && art.datePublished && art.dateModified && art.image && art.author && art.publisher) coverOk++;
    // every product link on the article must resolve
    for (const l of new Set([...v.html.matchAll(/href="(\/products\/[a-z0-9-]+)"/g)].map((m) => m[1]))) {
      if (!locs.includes(HOST + l)) brokenRelated.push(`${p} -> ${l}`);
    }
    const outLinks = [...v.html.matchAll(/href="(\/blog\/[a-z0-9-]+)"/g)].length;
    if (outLinks >= 2) relOk++;
    if (/Previous guide|Newer guide|All guides/.test(v.html)) prevnextOk++;
  }
  ok("every guide emits Article schema", artOk === N, `${artOk}/${N}`);
  ok("Article schema complete (headline, dates, image, author, publisher)", coverOk === N, `${coverOk}/${N}`);
  ok("every guide emits BreadcrumbList", crumbOk === N, `${crumbOk}/${N}`);
  ok("every guide links to other guides", relOk === N, `${relOk}/${N}`);
  ok("every guide has prev/next navigation", prevnextOk === N, `${prevnextOk}/${N}`);
  ok("no broken product links out of guides", brokenRelated.length === 0, brokenRelated.slice(0, 5).join(" | "));
  console.log(`  INFO  guides carrying FAQPage schema: ${faqOk}/${N}`);

  // ---------- og:image actually loads ----------
  console.log("\n=== ASSETS ===");
  const ogUrls = [...new Set([...pages.values()].map((v) => attr(v.html, /<meta property="og:image" content="([^"]*)"/)).filter((u) => u && u.startsWith("https://")))];
  let ogBad = [];
  for (const u of ogUrls) {
    const r = await fetch(u.replace(HOST, B), { method: "GET" }).catch(() => null);
    if (!r || r.status >= 400) ogBad.push(`${u} ${r ? r.status : "ERR"}`);
  }
  ok(`all ${ogUrls.length} distinct og:image URLs load`, ogBad.length === 0, ogBad.slice(0, 4).join(" | "));

  // ---------- robots + www redirect ----------
  const robots = await (await fetch(`${B}/robots.txt`)).text();
  ok("robots points sitemap at apex host", robots.includes(`${HOST}/sitemap.xml`));
  ok("robots disallows /admin and /api", robots.includes("/admin") && robots.includes("/api/"));

  // ---------- internal links into the blog ----------
  console.log("\n=== INTERNAL LINKS INTO BLOG ===");
  const linkers = [];
  for (const [p, v] of pages) {
    if (p.startsWith("/blog")) continue;
    if (/href="\/blog"/.test(v.html) || /href="\/blog\//.test(v.html)) linkers.push(p);
  }
  ok("non-blog pages link into the blog", linkers.length >= 5, `${linkers.length} pages`);
  console.log(`  INFO  linking from: ${linkers.slice(0, 12).join(", ")}`);

  // every guide must be reachable from somewhere other than the blog index
  const orphanGuides = blogPaths.filter((p) => {
    const slug = p.slice("/blog/".length);
    return ![...pages].some(([lp, lv]) => !lp.startsWith("/blog") && lv.html.includes(`href="/blog/${slug}"`));
  });
  ok("no orphan guides (each linked from a catalog or site page)", orphanGuides.length === 0, orphanGuides.slice(0, 5).join(", "));

  // every category landing page should surface at least one guide
  const landing = paths.filter((p) => /^\/products\/[a-z0-9-]+$/.test(p) && pages.get(p).html.includes('"@type":"CollectionPage"'));
  const noGuides = landing.filter((p) => !/href="\/blog\//.test(pages.get(p).html));
  ok(`category landing pages carry guide links (${landing.length - noGuides.length}/${landing.length})`, noGuides.length <= 4, `without guides: ${noGuides.join(", ")}`);

  // ---------- 404 + soft-404 ----------
  const nf = await fetch(`${B}/blog/this-post-does-not-exist`);
  ok("/blog/{unknown} returns 404, not an empty 200", nf.status === 404, `status ${nf.status}`);

  // ---------- word count per guide ----------
  console.log("\n=== GUIDE DEPTH ===");
  const thin = [];
  for (const p of blogPaths) {
    const words = pages.get(p).html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    if (words < 450) thin.push(`${p} (${words})`);
    console.log(`  ${String(words).padStart(4)} words  ${p}`);
  }
  ok("no thin guides (every guide >= 450 rendered words)", thin.length === 0, thin.join(", "));

  console.log(`\n=================== ${pass} passed, ${fail} failed ===================`);
  process.exit(fail ? 1 : 0);
})();

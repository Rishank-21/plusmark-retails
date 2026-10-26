import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] || ".next";
const slug = process.argv[3] || "metallic-premium-white-board";

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(js|html|txt)$/.test(e.name)) yield p;
  }
}

const needle = `plusmark/products/${slug}`;
const seen = new Map();
for (const file of walk(root)) {
  const s = fs.readFileSync(file, "utf8");
  let i = -1;
  while ((i = s.indexOf(needle, i + 1)) !== -1) {
    // capture the suffix right after the bare slug
    const after = s.slice(i + needle.length, i + needle.length + 4);
    const m = /^\/(\d+)/.exec(after);
    const key = m ? m[1] : "bare";
    if (!seen.has(key)) seen.set(key, { file, at: i });
    if (i > 5_000_000) break;
  }
}
console.log(`slug ${slug}`);
for (const [k, v] of seen) console.log(`  ${k.padEnd(5)} first seen in ${v.file}`);

// print the array literal context where the bare url is followed by indices (gallery definition)
for (const file of walk(root)) {
  const s = fs.readFileSync(file, "utf8");
  const idx = s.indexOf(`\\"${needle}/2\\"`);
  if (idx === -1) continue;
  console.log(`\narray context in ${file}:\n${JSON.stringify(s.slice(Math.max(0, idx - 320), idx + 320))}`);
  break;
}

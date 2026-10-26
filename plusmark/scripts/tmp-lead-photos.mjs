/**
 * One-off: lead these white-board products with the "held to scale" photo (gallery /2).
 * Their studio shot has a white writing surface on a white background, so the card and the page
 * stage read as an empty frame.
 */
import fs from "node:fs";

const slugs = [
  "metallic-premium-white-board",
  "eco-premium-white-board",
  "eco-premium-both-side-board",
  "metallic-premium-magnetic-board",
  "eco-regular-magnetic-board",
];
const P = "data/gallery.ts";
const text = fs.readFileSync(P, "utf8");
const eol = text.includes("\r\n") ? "\r\n" : "\n";
const lines = text.split(/\r?\n/);
let changed = 0;
for (const slug of slugs) {
  const start = lines.findIndex((l) => l.trim().startsWith(`"${slug}": [`));
  if (start < 0) throw new Error(`entry not found: ${slug}`);
  let end = start + 1;
  while (end < lines.length && !lines[end].trim().endsWith("],")) end++;
  const body = lines.slice(start + 1, end);
  const i = body.findIndex((l) => /\/2",\s*$/.test(l));
  if (i < 0) throw new Error(`no /2 photo in ${slug}`);
  const [lead] = body.splice(i, 1);
  lines.splice(start + 1, body.length + 1, ...[lead, ...body], lines[end]);
  console.log(`led ${slug} with ${lead.trim().match(/products\/[^"]+$/)[0]}`);
  changed++;
}
fs.writeFileSync(P, lines.join(eol));
console.log(`reordered ${changed} entries (eol ${JSON.stringify(eol)})`);

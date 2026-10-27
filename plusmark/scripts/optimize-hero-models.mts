/**
 * Recompresses the hero GLBs.
 *
 * The featured models were dropped into public/models/ as raw CAD exports, bypassing the
 * dedup/prune/draco pass in scripts/generate-models.mts. Each one is 3–8 MB of uncompressed
 * float geometry and PNG textures, so decoding them on first paint saturates the main thread
 * and the hero carousel stutters until every model is cached.
 *
 * Run: node scripts/optimize-hero-models.mts            # report only, nothing is written
 *      node scripts/optimize-hero-models.mts --write    # rewrite the GLBs + model hashes
 *
 * Two details in these files are easy to destroy and are preserved deliberately:
 *  - EXT_materials_bump (rail grooves, back sheet, nameplate). gltf-transform does not model this
 *    extension, so it is captured before the transform and re-injected into the JSON chunk after it.
 *  - COLOR_0. three.js switches a material to vertexColors whenever the attribute exists, so the
 *    attribute is load-bearing even though gltf-transform sees no material that asks for it.
 *
 * Originals stay recoverable: public/models/*.glb is tracked in git and untouched until --write.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- this script walks raw glTF JSON, which has no types */
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { BufferUtils, ImageUtils, NodeIO, PropertyType, type Document, type Texture } from "@gltf-transform/core";
import { dedup, draco, listTextureSlots, prune, textureCompress, weld } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { featuredProducts } from "../data/featured.ts";
import { visuals } from "../data/visuals.ts";

const MODELS_DIR = path.resolve("public/models");
const VERSIONS_FILE = path.resolve("data/model-versions.ts");
/** Longest texture edge we keep. The hero renders each board at ~600 px, so 2048 is never visible. */
const MAX_TEXTURE_EDGE = 1024;
const JPEG_QUALITY = 84;
const BUMP_EXT = "EXT_materials_bump";

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + " MB";

interface Bump {
  /** Index into the source json.materials, which is kept in the same order by the writer. */
  materialIndex: number;
  materialName: string;
  /** Unique texture name, used to find the (possibly re-sorted, re-encoded) image after writing. */
  tag: string;
  /** The sampler definition the original texture definition pointed at, if any. */
  sampler?: Record<string, number>;
  /** The whole original extension, with bumpTexture.index patched at inject time. */
  ext: Record<string, unknown>;
}

function jsonChunk(glb: Uint8Array): Record<string, any> {
  const buf = toBuffer(glb);
  const length = buf.readUInt32LE(12);
  return JSON.parse(buf.subarray(20, 20 + length).toString("utf8"));
}

const toBuffer = (data: Uint8Array) => Buffer.from(data.buffer, data.byteOffset, data.byteLength);

/** Replace the JSON chunk of a GLB, re-padding to the 4-byte boundary and fixing all length fields. */
function withJSONChunk(glb: Uint8Array, json: Record<string, any>): Buffer {
  const buf = toBuffer(glb);
  const oldJSONLength = buf.readUInt32LE(12);
  const binLength = buf.readUInt32LE(20 + oldJSONLength);
  const bin = buf.subarray(20 + oldJSONLength + 8, 20 + oldJSONLength + 8 + binLength);
  const body = Buffer.from(JSON.stringify(json, null, 1), "utf8");
  const jsonLength = Math.ceil(body.byteLength / 4) * 4;
  const jsonBuf = Buffer.alloc(jsonLength, 0x20);
  body.copy(jsonBuf);
  const binLengthPadded = Math.ceil(bin.byteLength / 4) * 4;
  const binBuf = binLengthPadded === bin.byteLength ? bin : Buffer.concat([bin, Buffer.alloc(binLengthPadded - bin.byteLength)]);
  const out = Buffer.alloc(12 + 8 + jsonLength + 8 + binBuf.byteLength);
  out.writeUInt32LE(0x46546c67, 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(out.byteLength, 8);
  out.writeUInt32LE(jsonLength, 12);
  out.writeUInt32LE(0x4e4f534a, 16);
  jsonBuf.copy(out, 20);
  out.writeUInt32LE(binBuf.byteLength, 20 + jsonLength);
  out.writeUInt32LE(0x004e4942, 24 + jsonLength);
  binBuf.copy(out, 28 + jsonLength);
  return out;
}

/**
 * Capture every EXT_materials_bump, then name each texture so the compression passes can be
 * filtered by name. Filtering by slot is not enough: a texture no material references (every bump
 * map) has no slots at all, and gltf-transform lets slot-less textures through any slot pattern.
 *  - bump-…  the bump map, re-injected into the JSON after writing
 *  - jpg-…   colour data with nothing in its alpha channel → baseColor/emissive only
 *  - data-…  anything a normal/occlusion/metallicRoughness slot touches, or that needs alpha
 */
async function classify(doc: Document, json: Record<string, any>) {
  const textures = doc.getRoot().listTextures();
  const bumps: Bump[] = [];
  const bumpTags = new Map<Texture, string>();
  (json.materials ?? []).forEach((mat: any, materialIndex: number) => {
    const ext = mat.extensions?.[BUMP_EXT];
    if (!ext) return;
    const textureDef = json.textures[ext.bumpTexture.index];
    // The reader creates one Texture per json.images entry, in order.
    const tex = textures[textureDef.source];
    if (!tex) throw new Error(`${mat.name}: ${BUMP_EXT} points at a missing image`);
    let tag = bumpTags.get(tex);
    if (!tag) {
      tag = `bump-${materialIndex}`;
      tex.setName(tag);
      bumpTags.set(tex, tag);
    }
    bumps.push({
      materialIndex,
      materialName: mat.name,
      tag,
      sampler: textureDef.sampler === undefined ? undefined : json.samplers[textureDef.sampler],
      ext: JSON.parse(JSON.stringify(ext)),
    });
  });

  // Only materials that blend or mask can need a baseColor alpha channel.
  const blended = new Set<Texture>();
  for (const mat of doc.getRoot().listMaterials()) {
    const tex = mat.getBaseColorTexture();
    const mode = mat.getAlphaMode();
    if (tex && (mode === "BLEND" || mode === "MASK")) blended.add(tex);
  }

  let droppedAlpha = 0;
  for (const tex of textures) {
    if (bumpTags.has(tex)) continue;
    const slots = listTextureSlots(tex);
    if (!slots.length) continue; // disposed later
    const image = tex.getImage();
    const colorOnly = slots.every((slot) => slot === "baseColorTexture" || slot === "emissiveTexture");
    let jpegSafe = colorOnly && !blended.has(tex);
    if (jpegSafe && image && /png/i.test(tex.getMimeType())) {
      if (await hasVariedAlpha(image, tex.getMimeType())) jpegSafe = false;
      else {
        // CAD exports ship RGBA PNGs whose alpha is constant 255; JPEG cannot hold that channel.
        const rgb = await sharp(BufferUtils.toView(image)).removeAlpha().png({ compressionLevel: 9 }).toBuffer();
        tex.setImage(new Uint8Array(rgb));
        droppedAlpha++;
      }
    }
    tex.setName(`${jpegSafe ? "jpg" : "data"}-${textures.indexOf(tex)}`);
  }
  return { bumps, droppedAlpha };
}

/** True only when the alpha channel actually varies (CAD exports ship constant-255 alpha in PNGs). */
async function hasVariedAlpha(image: Uint8Array, mime: string): Promise<boolean> {
  if (!/png/i.test(mime)) return false;
  const meta = await sharp(BufferUtils.toView(image)).metadata();
  if ((meta.channels ?? 3) < 4) return false;
  const { data, channels } = await sharp(BufferUtils.toView(image)).raw().toBuffer({ resolveWithObject: true });
  if (channels < 4) return false;
  for (let i = 3; i < data.length; i += channels) if (data[i] !== 255) return true;
  return false;
}

/** Free textures that no material and no captured bump uses; prune() cannot be trusted to do it. */
function disposeOrphanTextures(doc: Document) {
  const dead = doc.getRoot().listTextures().filter((tex) => tex.getName() === "unbound" || !tex.getName());
  for (const tex of dead) tex.dispose();
  return dead.length;
}

async function optimise(io: NodeIO, file: string) {
  const source = await readFile(file);
  const src = jsonChunk(source);
  const doc = await io.read(file);
  const { bumps, droppedAlpha } = await classify(doc, src);
  // Textures and materials are excluded from prune so the bump maps stay in the file until the
  // extension is re-injected; dead textures are removed by disposeOrphanTextures instead.
  // keepAttributes protects COLOR_0, which three.js turns into vertexColors whether the material
  // asks for it or not.
  await doc.transform(
    dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.MESH] }),
    prune({
      propertyTypes: [
        PropertyType.NODE,
        PropertyType.SKIN,
        PropertyType.MESH,
        PropertyType.CAMERA,
        PropertyType.PRIMITIVE,
        PropertyType.PRIMITIVE_TARGET,
        PropertyType.ANIMATION,
        PropertyType.ACCESSOR,
        PropertyType.BUFFER,
      ],
      keepAttributes: true,
    }),
    weld(),
  );
  const orphans = disposeOrphanTextures(doc);
  await doc.transform(
    textureCompress({
      encoder: sharp,
      targetFormat: "jpeg",
      pattern: /^jpg-/,
      resize: [MAX_TEXTURE_EDGE, MAX_TEXTURE_EDGE],
      quality: JPEG_QUALITY,
    }),
    textureCompress({
      encoder: sharp,
      pattern: /^(data-|bump-)/,
      formats: /png|jpeg/i,
      resize: [MAX_TEXTURE_EDGE, MAX_TEXTURE_EDGE],
      effort: 80,
      chromaSubsampling: "4:4:4",
    }),
  );
  try {
    await doc.transform(draco({ method: "edgebreaker" }));
  } catch (e) {
    console.log(`      edgebreaker failed (${(e as Error).message.split("\n")[0]}); using sequential`);
    await doc.transform(draco({ method: "sequential" }));
  }
  const glb = await io.writeBinary(doc);
  const out = withJSONChunk(glb, reinjectBumps(glb, bumps));
  verify(src, out, bumps);
  return { out, bumps, droppedAlpha, orphans };
}

/** Put EXT_materials_bump back into the written JSON, re-pointing each entry at its new index. */
function reinjectBumps(glb: Uint8Array, bumps: Bump[]): Record<string, any> {
  const json = jsonChunk(glb);
  if (!bumps.length) return json;
  for (const bump of bumps) {
    const target = json.materials[bump.materialIndex];
    if (!target || target.name !== bump.materialName) {
      throw new Error(`${bump.materialName}: material ${bump.materialIndex} moved (${target?.name})`);
    }
    const image = json.images.findIndex((img: any) => img.name === bump.tag);
    if (image < 0) throw new Error(`${bump.materialName}: bump texture "${bump.tag}" is gone`);
    const existing = json.textures.findIndex((t: any) => t.source === image);
    let index = existing;
    if (index < 0) {
      let sampler: number | undefined;
      if (bump.sampler) {
        sampler = json.samplers.findIndex((s: any) => JSON.stringify(s) === JSON.stringify(bump.sampler));
        if (sampler < 0) {
          json.samplers.push(bump.sampler);
          sampler = json.samplers.length - 1;
        }
      }
      json.textures.push({ source: image, ...(sampler === undefined ? {} : { sampler }) });
      index = json.textures.length - 1;
    }
    const ext = JSON.parse(JSON.stringify(bump.ext));
    ext.bumpTexture.index = index;
    target.extensions = { ...(target.extensions ?? {}), [BUMP_EXT]: ext };
  }
  const used = json.extensionsUsed ?? (json.extensionsUsed = []);
  if (!used.includes(BUMP_EXT)) used.push(BUMP_EXT);
  return json;
}

interface Report {
  bytes: number;
  textureBytes: number;
  attrBytes: Map<string, number>;
  textures: string[];
  tris: number;
}

async function analyse(io: NodeIO, file: string): Promise<Report> {
  const doc = await io.read(file);
  const attrBytes = new Map<string, number>();
  let tris = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      tris += (prim.getIndices()?.getCount() ?? prim.getAttribute("POSITION")?.getCount() ?? 0) / 3;
      prim.listSemantics().forEach((semantic, i) => {
        const bytes = prim.listAttributes()[i].getArray()!.byteLength;
        attrBytes.set(semantic, (attrBytes.get(semantic) ?? 0) + bytes);
      });
    }
  }
  let textureBytes = 0;
  const textures: string[] = [];
  for (const tex of doc.getRoot().listTextures()) {
    const image = tex.getImage();
    if (!image) continue;
    textureBytes += image.byteLength;
    const size = ImageUtils.getSize(image, tex.getMimeType());
    const alpha = await hasVariedAlpha(image, tex.getMimeType());
    const slots = listTextureSlots(tex);
    textures.push(
      `      ${String(size?.[0] ?? 0)}x${String(size?.[1] ?? 0)}${alpha ? " rgba" : ""} ${mb(image.byteLength)} ${(tex.getName() || path.basename(tex.getURI())).slice(0, 30)} [${slots.join("+") || "unbound"}]`,
    );
  }
  return { bytes: (await readFile(file)).byteLength, textureBytes, attrBytes, textures, tris };
}

/**
 * Fail loudly instead of shipping a broken or visually changed model: every bump map must be
 * reachable through valid indices, and no vertex attribute may disappear (COLOR_0 in particular,
 * which three.js turns into vertexColors just by existing).
 */
function verify(sourceJSON: Record<string, any>, outGLB: Uint8Array, bumps: Bump[]): void {
  const out = jsonChunk(outGLB);
  if (!out.asset || !out.buffers?.[0]) throw new Error("output has no asset/buffer");
  const bufferBytes = out.buffers[0].byteLength;
  const semantics = (json: Record<string, any>) => {
    const counts = new Map<string, number>();
    for (const mesh of json.meshes ?? []) {
      for (const prim of mesh.primitives) {
        for (const key of Object.keys(prim.attributes)) counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return counts;
  };
  const before = semantics(sourceJSON);
  const after = semantics(out);
  for (const key of before.keys()) {
    if (!after.has(key)) throw new Error(`vertex attribute ${key} disappeared (three.js reacts to COLOR_0, NORMAL, …)`);
  }
  if (out.materials.length !== (sourceJSON.materials ?? []).length) {
    throw new Error(`material count changed: ${sourceJSON.materials.length} → ${out.materials.length}`);
  }
  if (out.images.length !== (sourceJSON.images ?? []).length) {
    throw new Error(`image count changed: ${sourceJSON.images.length} → ${out.images.length}`);
  }
  const prims = (json: Record<string, any>) => (json.meshes ?? []).reduce((n: number, m: any) => n + m.primitives.length, 0);
  if (prims(out) < prims(sourceJSON) - 2) {
    throw new Error(`primitive count dropped: ${prims(sourceJSON)} → ${prims(out)}`);
  }
  for (const bump of bumps) {
    const mat = out.materials[bump.materialIndex];
    if (!mat || mat.name !== bump.materialName) {
      throw new Error(`${bump.materialName}: material ${bump.materialIndex} is now "${mat?.name}"`);
    }
    const ext = mat.extensions?.[BUMP_EXT];
    if (!ext) throw new Error(`${mat.name}: ${BUMP_EXT} was not re-injected`);
    const textureDef = out.textures[ext.bumpTexture?.index];
    if (!textureDef) throw new Error(`${mat.name}: bump texture index ${ext.bumpTexture?.index} is missing`);
    const image = out.images[textureDef.source];
    if (!image) throw new Error(`${mat.name}: bump image index ${textureDef.source} is missing`);
    if (textureDef.sampler !== undefined && !out.samplers[textureDef.sampler]) {
      throw new Error(`${mat.name}: bump sampler ${textureDef.sampler} is missing`);
    }
    const view = out.bufferViews[image.bufferView];
    if (!view || view.byteOffset + view.byteLength > bufferBytes) {
      throw new Error(`${mat.name}: bump image bufferView ${image.bufferView} is out of range`);
    }
  }
  if (bumps.length && !(out.extensionsUsed ?? []).includes(BUMP_EXT)) {
    throw new Error(`${BUMP_EXT} missing from extensionsUsed`);
  }
}

/** Keep data/model-versions.ts in sync with the files on disk (immutable cache + ?v= hash). */
async function rewriteVersions() {
  const entries: string[] = [];
  for (const slug of Object.keys(visuals).sort()) {
    const buf = await readFile(path.join(MODELS_DIR, `${slug}.glb`)).catch(() => undefined);
    if (buf) entries.push(`  "${slug}": "${createHash("sha1").update(buf).digest("hex").slice(0, 10)}",`);
  }
  const src = `// Generated by scripts/generate-models.mts — content hashes of /public/models/*.glb. Do not edit.\nexport const modelVersions: Record<string, string> = {\n${entries.join("\n")}\n};\n`;
  await writeFile(VERSIONS_FILE, src);
  console.log(`✓ data/model-versions.ts (${entries.length} hashes)`);
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const only = args.filter((a) => !a.startsWith("--"));
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "draco3d.encoder": await draco3d.createEncoderModule(),
    "draco3d.decoder": await draco3d.createDecoderModule(),
  });

  const slugs = (only.length ? only : featuredProducts.map((f) => f.slug)).filter((s) => visuals[s]);
  let beforeTotal = 0;
  let afterTotal = 0;

  for (const slug of slugs) {
    const file = path.join(MODELS_DIR, `${slug}.glb`);
    if (!(await readFile(file).catch(() => undefined))) {
      console.log(`✗ ${slug} — in data/featured.ts but no GLB in public/models`);
      continue;
    }
    const before = await analyse(io, file);
    beforeTotal += before.bytes;
    console.log(`\n● ${slug}  ${mb(before.bytes)}  ${Math.round(before.tris).toLocaleString()} tris`);
    console.log(`    textures ${mb(before.textureBytes)} | geometry ${mb(before.bytes - before.textureBytes)}`);
    for (const [semantic, bytes] of [...before.attrBytes].sort((a, b) => b[1] - a[1])) {
      console.log(`      ${semantic.padEnd(12)} ${mb(bytes)}`);
    }
    for (const line of before.textures) console.log(line);

    const { out, bumps, droppedAlpha, orphans } = await optimise(io, file);
    afterTotal += out.byteLength;
    const pct = Math.round((1 - out.byteLength / before.bytes) * 100);
    console.log(
      `    → ${mb(out.byteLength)} (−${pct}%) | ${bumps.length} bump map(s) preserved, ${droppedAlpha} dead alpha channel(s) stripped, ${orphans} orphan texture(s) dropped`,
    );
    if (write) await writeFile(file, out);
  }

  console.log(`\n${write ? "wrote" : "would go"}: ${mb(beforeTotal)} → ${mb(afterTotal)}`);
  if (write) await rewriteVersions();
  else console.log("(dry run — add --write to replace the GLBs and regenerate model hashes)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Renders the featured hero models to PNG with the same loader stack the site uses
 * (three.js GLTFLoader + DRACOLoader), so a model rewrite can be compared pixel by pixel.
 *
 * Run: PLAYWRIGHT_PATH=/path/to/playwright node scripts/model-shots.mts <outDir> [slug ...]
 */
import http from "node:http";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { featuredProducts } from "../data/featured.ts";

const require = createRequire(import.meta.url);
const root = path.resolve(".");
const PORT = 4790;
const W = 900;
const H = 700;
/** Two angles: one straight-on for the surface, one low and oblique for the rail bump detail. */
const YAWS = [-0.38, -1.15];

const html = `<!doctype html><html><head><style>html,body{margin:0;background:#f4f6f8}canvas{display:block}</style>
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
</head><body><script type="module">
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setSize(${W}, ${H});
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 1;
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const key = new THREE.DirectionalLight(0xffffff, 1.4);
key.position.set(1.2, 4, 3);
scene.add(key);
const rim = new THREE.DirectionalLight(0xdfe7f2, 0.8);
rim.position.set(0, 2.5, -5);
scene.add(rim);
const camera = new THREE.PerspectiveCamera(26, ${W / H}, 0.1, 50);
const loader = new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath("/public/draco/"));
const cache = new Map();
window.shotError = null;
window.renderModel = async (url, yaw) => {
  if (!cache.has(url)) cache.set(url, await loader.loadAsync(url));
  const obj = cache.get(url).scene.clone(true);
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const s = 2.2 / Math.max(size.x, size.y, size.z * 1.4);
  obj.scale.setScalar(s);
  obj.position.set(-center.x * s, -center.y * s, -center.z * s);
  obj.rotation.y = yaw;
  scene.add(obj);
  camera.position.set(0, 0, 5.9);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  const data = renderer.domElement.toDataURL("image/png");
  scene.remove(obj);
  return data;
};
window.ready = true;
</script></body></html>`;

const MIME: Record<string, string> = {
  ".js": "text/javascript",
  ".wasm": "application/wasm",
  ".glb": "model/gltf-binary",
  ".html": "text/html",
  ".png": "image/png",
  ".json": "application/json",
};

const server = http.createServer(async (req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  if (url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(html);
  }
  const file = path.join(root, url);
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});

async function main() {
  const [outDir, ...slugs] = process.argv.slice(2);
  if (!outDir) throw new Error("usage: node scripts/model-shots.mts <outDir> [slug ...]");
  const targets = (slugs.length ? slugs : featuredProducts.map((f) => f.slug)).filter((s) => s !== "eco-premium-both-side-board");
  await mkdir(outDir, { recursive: true });
  await new Promise<void>((r) => server.listen(PORT, r));
  const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on("pageerror", (e: Error) => console.error("page error:", e.message));
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForFunction(() => (globalThis as unknown as { ready?: boolean }).ready === true);
  for (const slug of targets) {
    for (const [i, yaw] of YAWS.entries()) {
      const dataUrl: string = await page.evaluate(
        ([u, y]: [string, number]) =>
          (globalThis as unknown as { renderModel: (u: string, y: number) => Promise<string> }).renderModel(u, y),
        [`/public/models/${slug}.glb`, yaw] as [string, number],
      );
      await writeFile(path.join(outDir, `${slug}-${i}.png`), Buffer.from(dataUrl.split(",")[1], "base64"));
    }
    console.log(`✓ ${slug}`);
  }
  await browser.close();
  server.close();
}

main().catch((e) => {
  console.error(e);
  server.close();
  process.exit(1);
});

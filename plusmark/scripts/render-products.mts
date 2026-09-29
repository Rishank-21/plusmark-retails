/**
 * Renders a transparent product image (WebP) from each GLB in /public/models using
 * headless Chromium + three.js, so card images and WebGL fallbacks match the 3D models.
 *
 * Requires Playwright + Chromium:  CHROME_PATH=/path/to/chrome npm run assets:renders
 * Replace any output with real catalog photography at /public/images/products/<slug>.webp.
 */
import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";
import { visuals } from "../data/visuals.ts";

const require = createRequire(import.meta.url);
const root = path.resolve(".");
const PORT = 4789;
const W = 1600;
const H = 1200;

const html = `<!doctype html><html><head><style>html,body{margin:0;background:transparent}canvas{display:block}</style>
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
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 1.35;
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(1.2, 7, 2.2);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.radius = 12;
key.shadow.camera.left = -3; key.shadow.camera.right = 3; key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
scene.add(key);
const rim = new THREE.DirectionalLight(0xdfe7f2, 1);
rim.position.set(0, 2.5, -5);
scene.add(rim);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.12 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const camera = new THREE.PerspectiveCamera(24, ${W / H}, 0.1, 50);
const draco = new DRACOLoader().setDecoderPath("/public/draco/");
const loader = new GLTFLoader().setDRACOLoader(draco);
window.renderModel = async (url, yaw, fit) => {
  const gltf = await loader.loadAsync(url);
  const obj = gltf.scene;
  obj.traverse((c) => { if (c.isMesh) { c.castShadow = true; } });
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const s = fit / Math.max(size.x, size.y, size.z * 1.4);
  obj.scale.setScalar(s);
  obj.position.set(-center.x * s, -box.min.y * s + 0.06, -center.z * s);
  const pivot = new THREE.Group();
  pivot.add(obj);
  pivot.rotation.y = yaw;
  scene.add(pivot);
  const h = size.y * s;
  camera.position.set(0.35, h / 2 + 0.45, 6.4);
  camera.lookAt(0, h / 2 + 0.12, 0);
  renderer.render(scene, camera);
  const data = renderer.domElement.toDataURL("image/png");
  scene.remove(pivot);
  return data;
};
window.ready = true;
</script></body></html>`;

const MIME: Record<string, string> = {
  ".js": "text/javascript",
  ".wasm": "application/wasm",
  ".glb": "model/gltf-binary",
  ".html": "text/html",
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
    const buf = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
    res.end(buf);
  } catch {
    res.writeHead(404).end();
  }
});

async function main() {
  await new Promise<void>((r) => server.listen(PORT, r));
  const pwPath = process.env.PLAYWRIGHT_PATH || "playwright";
  const { chromium } = require(pwPath);
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH,
    args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on("pageerror", (e: Error) => console.error("page error:", e.message));
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForFunction(() => (window as unknown as { ready?: boolean }).ready === true);

  const yawFor = (slug: string, kind: string) =>
    kind === "bench" ? -0.75 : kind === "clipboard" ? -0.5 : slug.includes("double-door") ? -0.3 : -0.4;
  const fitFor = (kind: string) => (kind === "bench" ? 1.75 : kind === "clipboard" ? 1.75 : 2.2);

  for (const [slug, v] of Object.entries(visuals)) {
    const dataUrl: string = await page.evaluate(
      ([u, y, f]: [string, number, number]) =>
        (window as unknown as { renderModel: (u: string, y: number, f: number) => Promise<string> }).renderModel(u, y, f),
      [`/public/models/${slug}.glb`, yawFor(slug, v.kind), fitFor(v.kind)] as [string, number, number],
    );
    const png = Buffer.from(dataUrl.split(",")[1], "base64");
    const out = path.join(root, "public/images/products", `${slug}.webp`);
    await writeFile(out, await sharp(png).trim({ threshold: 1 }).extend({ top: 90, bottom: 90, left: 120, right: 120, background: { r: 0, g: 0, b: 0, alpha: 0 } }).resize(W, H, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 84, alphaQuality: 90 }).toBuffer());
    console.log(`✓ ${slug}.webp`);
  }
  await browser.close();
  server.close();
}

main().catch((e) => {
  console.error(e);
  server.close();
  process.exit(1);
});

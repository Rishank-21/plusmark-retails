# Plusmark Display System — website

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · React Three Fiber / drei · GSAP ScrollTrigger · Framer Motion.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

Copy `.env.example` to `.env.local` and set the values you need. On Vercel, add the same values under Project → Settings → Environment Variables.

## Content source

The Plusmark catalog is the only source of product content. All product data lives in `data/`:

| File | Purpose |
| --- | --- |
| `products.ts` | 63 products: specs, features, sizes, colours, variants, SEO fields |
| `categories.ts` | 13 categories (these also get the `/products/<slug>` URLs) |
| `featured.ts` | The 8-product hero sequence, with condensed catalog specs |
| `visuals.ts` | Construction descriptors that drive the GLB and image generators |
| `company.ts`, `industries.ts`, `custom.ts`, `quality.ts` | About, industries, custom solutions and quality copy |

Products that the catalog lists by name only (stands, storage, school benches) are marked `catalogDetail: "listing"`, and their pages ask visitors to enquire for specs. The site contains no prices, ratings, reviews, SKUs or statistics.

## Architecture

- Server components render all copy, specs, breadcrumbs and JSON-LD (Organization, WebSite, Product, BreadcrumbList, ItemList). Client components are used only for 3D, scroll orchestration, filters, the mobile menu and the form.
- The hero (`components/hero`) is one sticky `100svh` stage inside a scroll container. Scroll progress, smoothed by GSAP ScrollTrigger, gives a continuous product index. That index drives the model transforms and opacity, the text crossfades, the image fallbacks and the progress bar. All 8 products' text is in the server HTML.
- 3D loading: a model loads only for the current product and the ones either side. The model after next is preloaded. Rendering pauses when the hero is off-screen. The canvas and pixel ratio scale to the device's capability. If WebGL is missing, the device is very low-end, Save-Data is on or `?no3d` is set, a product image is shown instead. If a model fails to load, an error boundary shows the image in its place.
- `/products/[slug]` handles both category and product slugs, all statically generated.

## 3D models and images

`public/models/*.glb` are Draco-compressed reference models (about 4–12 KB each). They are built by `scripts/generate-models.mts` from the catalog's construction differences: surface, corner type and frame type. **The catalog gives no dimensions, so boards use a nominal 4 × 3 ft proportion. The school bench model is a generic representation** and is labelled that way in the viewer.

To swap in real CAD or photogrammetry models, keep the same file names in `public/models/`. No code changes are needed. To add a model for a new product, add an entry in `data/visuals.ts` (or set `model` directly).

Product images in `public/images/products/<slug>.webp`:
- Products with a model use a transparent render of that model: `npm run assets:renders`, which needs Playwright and Chromium via `PLAYWRIGHT_PATH` and `CHROME_PATH`.
- Other products use a neutral placeholder: `npm run assets:placeholders`.

**Replace these with catalog photography** by overwriting the files with the same names.

## Enquiries

`POST /api/enquiry` validates input with zod and has a honeypot field and a basic rate limit. It delivers to `ENQUIRY_WEBHOOK_URL` and/or through Resend (`RESEND_API_KEY` + `ENQUIRY_TO_EMAIL`). With neither configured, development only logs the enquiry and production returns 503, so leads are never dropped silently. The WhatsApp button appears only when `NEXT_PUBLIC_WHATSAPP_NUMBER` is set.

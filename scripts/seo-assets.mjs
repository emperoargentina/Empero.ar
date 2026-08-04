// Genera assets de SEO/redes. Regenerable: `node scripts/seo-assets.mjs`
// OG image: se optimiza desde public/og-image.png (arte provisto).
// Favicons / iconos PWA: se derivan del logo.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUB = path.join(ROOT, "public");
const LOGO = path.join(PUB, "images", "logo", "Logo.png");
const OG_SRC = path.join(PUB, "og-image.png");

const RED = "#C1121F";

await mkdir(path.join(PUB, "icons"), { recursive: true });

// ---- OG image 1200x630 (recorte centrado, JPG optimizado) ----
await sharp(OG_SRC)
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(PUB, "og-image.jpg"));

// Logo sobre panel blanco cuadrado con padding (iconos legibles)
async function iconOnWhite(size, pad = 0.16) {
  const inner = Math.round(size * (1 - pad * 2));
  const logo = await sharp(LOGO)
    .resize(inner, inner, { fit: "inside" })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: "#FFFFFF" },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png();
}

// ---- Favicons PNG ----
await (await iconOnWhite(32, 0.12)).toFile(path.join(PUB, "favicon-32x32.png"));
await (await iconOnWhite(16, 0.08)).toFile(path.join(PUB, "favicon-16x16.png"));

// ---- Apple touch icon (180x180, sin transparencia) ----
await (await iconOnWhite(180, 0.16)).toFile(path.join(PUB, "apple-touch-icon.png"));

// ---- Iconos PWA ----
await (await iconOnWhite(192, 0.16)).toFile(path.join(PUB, "icons", "icon-192.png"));
await (await iconOnWhite(512, 0.16)).toFile(path.join(PUB, "icons", "icon-512.png"));
await (await iconOnWhite(512, 0.24)).toFile(path.join(PUB, "icons", "maskable-512.png")); // safe-zone

// ---- favicon.svg (vectorial: mark "E" en elipse roja) ----
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#FFFFFF"/>
  <ellipse cx="32" cy="32" rx="27" ry="16.5" fill="none" stroke="${RED}" stroke-width="4.5"/>
  <g fill="#111111">
    <rect x="24" y="20" width="5" height="24"/>
    <rect x="24" y="20" width="16" height="5"/>
    <rect x="24" y="29.5" width="13" height="5"/>
    <rect x="24" y="39" width="16" height="5"/>
  </g>
</svg>`;
await writeFile(path.join(PUB, "favicon.svg"), svgFavicon, "utf8");

console.log("OK: og-image.jpg + favicons + iconos PWA + favicon.svg en /public");

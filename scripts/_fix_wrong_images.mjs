// Sube a Cloudinary las imágenes CORRECTAS (distintas) para los gabinetes y el
// gabinete-inferior que estaban mal cargados, y actualiza el DB por familia.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const cloudinary = require("cloudinary").v2;

const env = Object.fromEntries(
  readFileSync(".env.local", "utf-8").split("\n").filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);
const URL = env.VITE_SUPABASE_URL, KEY = env.SUPABASE_SECRET_KEY;
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET, secure: true,
});
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

// origen (empero) -> public_id destino -> familias a actualizar
const FIXES = [
  { src: "n-4263-2265-21-02-2024.jpg", publicId: "emp-pls-7ts020",
    familias: ["gabinete-bajo-mostrador", "gabinete-bajo-mostrador-900"] },
  { src: "s-9070-2747-21-02-2024.jpg", publicId: "emp-pls-7ts020-k",
    familias: ["gabinete-bajo-mostrador-sin-puerta", "gabinete-bajo-mostrador-sin-puerta-900"] },
  { src: "n-9260-6031-21-02-2024.jpg", publicId: "emp-pkf-40-d",
    familias: ["gabinete-inferior-horno-carbon"] },
];

function upload(buffer, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "empero", public_id: publicId, overwrite: true, invalidate: true, resource_type: "image" },
      (e, r) => (e ? reject(e) : resolve(r))
    ).end(buffer);
  });
}

async function patchFam(famId, url, imgId) {
  const r = await fetch(`${URL}/rest/v1/products?familia_id=eq.${famId}`, {
    method: "PATCH", headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ cloudinary_url: url, cloudinary_image_id: imgId }),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return (await r.json()).length;
}

for (const fix of FIXES) {
  const resp = await fetch(`https://www.empero.com.tr/admin/pages/upload/${fix.src}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  const res = await upload(buf, fix.publicId);
  console.log(`⬆️  ${fix.src} → ${res.public_id}`);
  for (const fam of fix.familias) {
    const n = await patchFam(fam, res.secure_url, res.public_id);
    console.log(`   ✅ ${fam} (${n} var)`);
  }
}
console.log("Listo.");

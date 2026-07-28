// Copia cloudinary_url + cloudinary_image_id desde una familia hermana con imagen
// hacia las familias nuevas sin imagen. No sube nada a Cloudinary (reusa el asset).
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf-8").split("\n").filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);
const URL = env.VITE_SUPABASE_URL, KEY = env.SUPABASE_SECRET_KEY;

// familia nueva  ->  familia hermana de la que reusar la imagen
const REUSE = {
  "bano-maria-electrico-900": "bano-maria-electrico",
  "cucipasta-gas": "cucipasta-electrico",
  "freezer-mostrador": "refrigerador-tipo-mostrador",
  "freidora-electrica-900": "freidora-electrica",
  "freidora-electrica-elevador": "freidora-electrica",
  "freidora-electrica-mueble": "freidora-electrica",
  "freidora-gas": "freidora-gas-gabinete",
  "freidora-gas-900": "freidora-gas-gabinete",
  "gabinete-bajo-mostrador-900": "gabinete-bajo-mostrador",
  "gabinete-bajo-mostrador-sin-puerta-900": "gabinete-bajo-mostrador-sin-puerta",
  "marmita-electrica-700": "marmita-gas",
  "marmita-electrica-900": "marmita-gas",
  "marmita-gas-900": "marmita-gas",
  "parrilla-electrica-vapor": "parrilla-gas-piedra-lavica",
  "parrilla-gas-piedra-lavica-900": "parrilla-gas-piedra-lavica",
  "parrilla-gas-vapor": "parrilla-gas-piedra-lavica",
  "parrilla-gas-vapor-900": "parrilla-gas-piedra-lavica",
  "plancha-electrica-acanalada": "plancha-gas-acanalada",
  "plancha-electrica-acanalada-900": "plancha-gas-acanalada",
  "plancha-electrica-lisa-900": "plancha-electrica-lisa",
  "plancha-electrica-mixta": "plancha-electrica-lisa",
  "plancha-electrica-mixta-900": "plancha-electrica-lisa",
  "plancha-gas-acanalada-900": "plancha-gas-acanalada",
  "plancha-gas-lisa-900": "plancha-gas-lisa",
  "plancha-gas-mixta": "plancha-gas-lisa",
  "plancha-gas-mixta-900": "plancha-gas-lisa",
};

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function getSiblingImage(famId) {
  const r = await fetch(`${URL}/rest/v1/products?select=cloudinary_url,cloudinary_image_id&familia_id=eq.${famId}&cloudinary_url=not.is.null&limit=1`, { headers });
  const rows = await r.json();
  return rows[0] || null;
}

async function patchFamily(famId, img) {
  const r = await fetch(`${URL}/rest/v1/products?familia_id=eq.${famId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ cloudinary_url: img.cloudinary_url, cloudinary_image_id: img.cloudinary_image_id }),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return (await r.json()).length;
}

let ok = 0, fail = 0;
for (const [target, sibling] of Object.entries(REUSE)) {
  try {
    const img = await getSiblingImage(sibling);
    if (!img) { console.log(`⚠️  ${target}: hermana ${sibling} sin imagen`); fail++; continue; }
    const n = await patchFamily(target, img);
    console.log(`✅ ${target} ← ${sibling} (${n} var) · ${img.cloudinary_image_id}`);
    ok++;
  } catch (e) { console.log(`❌ ${target}: ${e.message}`); fail++; }
}
console.log(`\n${ok} familias actualizadas, ${fail} fallidas`);

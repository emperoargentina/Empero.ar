// Rellena cloudinary_url/id en variantes sin imagen copiando la de otra variante
// de la MISMA familia. Fallback explícito para familias sin ninguna imagen.
import { readFileSync } from "node:fs";
const env = Object.fromEntries(
  readFileSync(".env.local", "utf-8").split("\n").filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  })
);
const URL = env.VITE_SUPABASE_URL, KEY = env.SUPABASE_SECRET_KEY;
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

// familia sin ninguna imagen -> familia de la que reusar
const FALLBACK = { "heladera-vidrio-mostrador": "refrigerador-tipo-mostrador" };

const all = await (await fetch(`${URL}/rest/v1/products?select=codigo,familia_id,cloudinary_url,cloudinary_image_id`, { headers })).json();
const imgByFam = {};
for (const r of all) if (r.cloudinary_url && !imgByFam[r.familia_id]) imgByFam[r.familia_id] = { url: r.cloudinary_url, id: r.cloudinary_image_id };

async function patchCode(codigo, img) {
  const r = await fetch(`${URL}/rest/v1/products?codigo=eq.${encodeURIComponent(codigo)}`, {
    method: "PATCH", headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ cloudinary_url: img.url, cloudinary_image_id: img.id }),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return (await r.json()).length;
}

let n = 0;
for (const r of all) {
  if (r.cloudinary_url) continue;
  const img = imgByFam[r.familia_id] || imgByFam[FALLBACK[r.familia_id]];
  if (!img) { console.log(`⚠️  ${r.codigo} (${r.familia_id}): sin fuente`); continue; }
  await patchCode(r.codigo, img);
  console.log(`✅ ${r.codigo} ← ${img.id}`);
  n++;
}
console.log(`\n${n} variantes rellenadas`);

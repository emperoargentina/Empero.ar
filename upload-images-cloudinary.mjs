// scripts/upload-images-cloudinary.mjs
//
// Lee Empero_Web_Mapping.html de la raíz del proyecto (tabla de mapeo generada
// a mano, no JSON), descarga cada imagen principal desde empero.com.tr, la
// sube a Cloudinary y actualiza las filas correspondientes en Supabase (tabla
// `products`), matcheando por `codigo` de variante — no por familia, porque
// el mapeo cubre códigos puntuales, no familias completas (ver columna Notas
// del HTML: a veces una fila cubre solo algunos códigos de la familia).
//
// Uso (PowerShell):
//   $env:CLOUDINARY_CLOUD_NAME="xxx"; $env:CLOUDINARY_API_KEY="xxx"; $env:CLOUDINARY_API_SECRET="xxx"; $env:SUPABASE_SERVICE_KEY="xxx"; node upload-images-cloudinary.mjs

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// ── Config ────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ujfeannqsiatavnarrhf.supabase.co";
const HTML_PATH = "Empero_Web_Mapping.html";
const CLOUDINARY_FOLDER = "empero";
const DELAY_MS = 500;

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  SUPABASE_SERVICE_KEY,
} = process.env;

// ── Validación de env vars ──────────────────────────────────────────────────
const missing = [];
if (!CLOUDINARY_CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
if (!CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
if (!CLOUDINARY_API_SECRET) missing.push("CLOUDINARY_API_SECRET");
if (!SUPABASE_SERVICE_KEY) missing.push("SUPABASE_SERVICE_KEY");
if (missing.length) {
  console.error(`❌ Faltan variables de entorno: ${missing.join(", ")}`);
  process.exit(1);
}

// ── Instalar dependencias si no están ────────────────────────────────────────
function ensureDep(pkg) {
  try {
    require.resolve(pkg);
  } catch {
    console.log(`📦 Instalando '${pkg}' con npm...`);
    execSync(`npm install ${pkg}`, { stdio: "inherit" });
  }
  return require(pkg);
}

const cloudinary = ensureDep("cloudinary").v2;
const { load } = ensureDep("cheerio");

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

// ── Helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(codigo) {
  return codigo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// PATCH products donde codigo esté en la lista dada (matchea variante por variante,
// no familia completa, respetando el mapeo puntual del HTML).
async function updateSupabase(codigos, cloudinaryUrl, cloudinaryImageId) {
  const inList = codigos.map((c) => `"${c.replace(/"/g, '\\"')}"`).join(",");
  const endpoint =
    `${SUPABASE_URL}/rest/v1/products?codigo=in.(${encodeURIComponent(inList).replace(/%2C/g, ",")})`;

  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      cloudinary_url: cloudinaryUrl,
      cloudinary_image_id: cloudinaryImageId,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status}: ${text}`);
  }

  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) ? rows.length : 0;
}

// ── Parseo del HTML ──────────────────────────────────────────────────────────
function parseMapping(html) {
  const $ = load(html);
  const rows = [];

  $("tbody#tbody tr").each((_, el) => {
    const $row = $(el);
    const hasUrl = $row.attr("data-has-url") === "yes";
    if (!hasUrl) return;

    const imageUrl = $row.find(".preview-cell img").attr("src");
    const nombre = $row.find("strong").first().text().trim();
    const codigosRaw = $row.find(".codes").first().text().trim();
    const codigos = codigosRaw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (!imageUrl || codigos.length === 0) return;
    rows.push({ nombre, imageUrl, codigos });
  });

  return rows;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  let html;
  try {
    html = readFileSync(HTML_PATH, "utf-8");
  } catch (err) {
    console.error(`❌ No se pudo leer ${HTML_PATH}: ${err.message}`);
    process.exit(1);
  }

  const rows = parseMapping(html);
  const total = rows.length;
  console.log(`🚀 ${total} filas con imagen para procesar.\n`);

  let exitosas = 0;
  let fallidas = 0;
  let filasActualizadas = 0;
  const errores = [];

  for (let i = 0; i < total; i++) {
    const row = rows[i];
    const n = i + 1;
    const publicId = slugify(row.codigos[0]);

    try {
      // Descargar imagen
      const resp = await fetch(row.imageUrl);
      if (!resp.ok) {
        throw new Error(`descarga HTTP ${resp.status}`);
      }
      const buffer = Buffer.from(await resp.arrayBuffer());

      // Subir a Cloudinary
      const result = await uploadToCloudinary(buffer, publicId);
      const secureUrl = result.secure_url;
      const cloudinaryPublicId = result.public_id;

      // Actualizar Supabase (solo las variantes cubiertas por esta fila)
      const filas = await updateSupabase(row.codigos, secureUrl, cloudinaryPublicId);
      filasActualizadas += filas;

      exitosas++;
      console.log(
        `✅ [${n}/${total}] ${row.nombre} (${row.codigos.join(", ")}) — ${filas} fila(s) actualizada(s) · ${cloudinaryPublicId}`
      );
    } catch (err) {
      fallidas++;
      errores.push({ id: row.nombre, error: err.message });
      console.log(`❌ [${n}/${total}] ${row.nombre} — ERROR: ${err.message}`);
    }

    if (i < total - 1) {
      await sleep(DELAY_MS);
    }
  }

  // ── Resumen ────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(50));
  console.log(`📊 Resumen`);
  console.log(`   ✅ Filas de mapeo procesadas OK: ${exitosas}`);
  console.log(`   ❌ Fallidas: ${fallidas}`);
  console.log(`   🗂️  Filas de Supabase actualizadas: ${filasActualizadas}`);
  console.log(`   📦 Total procesadas: ${total}`);
  if (errores.length) {
    console.log(`\n⚠️  Con error:`);
    for (const e of errores) {
      console.log(`   - ${e.id}: ${e.error}`);
    }
  }
  console.log("─".repeat(50));

  process.exit(fallidas > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(`💥 Error fatal: ${err.message}`);
  process.exit(1);
});

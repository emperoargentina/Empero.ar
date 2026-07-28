// Regenera Products_final.json:
//  - Base: Products_final.json existente (datos limpios, se respetan tal cual).
//  - Suma variantes/familias nuevas (las 76 del Excel) con VALORES desde _excel_map.json.
//  - Agrupamiento (familia_id, categoría, etiqueta) tomado del dump del DB.
//  - Aplica reglas: nueva categoría Acero y Servicio, Hornos por nombre,
//    fixes de categorías mal cargadas, y borra EMP.AS.8.
import { readFileSync, writeFileSync } from "node:fs";

const pf   = JSON.parse(readFileSync("Products_final.json", "utf-8"));
const db    = JSON.parse(readFileSync("_db_dump.json", "utf-8"));
const xmap = JSON.parse(readFileSync("_excel_map.json", "utf-8"));

const pfById = new Map(pf.map((f) => [f.id, f]));
const pfCodes = new Set(pf.flatMap((f) => f.variantes.map((v) => v.codigo)));

// ── Características reutilizadas de familias hermanas ──────────────────────────
const C = {
  freidoraElec: ["Control termostático","Resistencias móviles que facilitan la limpieza","Termostato de seguridad contra sobrecalentamiento","Cuerpo de acero inoxidable","Canastos de acero inoxidable","Fácil de limpiar y mantener higiene","Alimentación eléctrica: 400 V AC – 3N PE"],
  freidoraGas: ["Funciona con GLP o gas natural","Válvula de seguridad magnética para gas y termocupla","Termostato de seguridad contra sobrecalentamiento","Cuerpo de acero inoxidable","Canastos de acero inoxidable","Válvula de seguridad para drenaje del aceite desde el fondo","Fácil de limpiar y mantener higiene"],
  banoMaria: ["Control termostático","Nivel de agua visible","Cuerpo de acero inoxidable","Válvula de drenaje","Fácil de limpiar y mantener higiene","Alimentación eléctrica: 230 V AC – N – PE"],
  gabinete: (serie) => [`Los gabinetes bajo mostrador son aptos para su uso debajo de cualquier equipo de la serie ${serie}`,"Fácil de limpiar y mantener higiene","Cuerpo de acero inoxidable"],
  marmitaGas: ["Válvula de seguridad contra sobrepresión y manómetro","Válvula de drenaje","Tapa articulada con contrapeso","Chaqueta doble (doble camisa) — calentamiento indirecto","Funciona con GLP o gas natural","Termostato","Válvula de entrada de agua","Cuerpo de acero inoxidable","Válvula de seguridad para gas y termocupla"],
  marmitaElec: ["Válvula de seguridad contra sobrepresión y manómetro","Válvula de drenaje","Tapa articulada con contrapeso","Chaqueta doble (doble camisa) — calentamiento indirecto","Funcionamiento eléctrico","Válvula de entrada de agua","Control termostático","Cuerpo de acero inoxidable"],
  planchaGasLisa: ["Funcionamiento a gas licuado (GLP) o gas natural (GN)","Válvula de seguridad magnética con llama piloto","Dos zonas de calentamiento independientes","Cajón recolector de residuos desmontable"],
  planchaGasAcan: ["Funcionamiento a gas licuado (GLP) o gas natural (GN)","Válvula de seguridad magnética con llama piloto","Dos zonas de calentamiento independientes","Cajón recolector de residuos desmontable"],
  planchaElec: ["Control termostático de temperatura","Dos zonas de calentamiento independientes","Cajón recolector de residuos desmontable","Fácil limpieza y máxima higiene","Cuerpo de acero inoxidable"],
  parrillaLava: ["Funcionamiento a gas licuado (GLP) o gas natural (GN)","Válvula de seguridad con llama piloto","Piedra volcánica reemplazable","Dos zonas de calentamiento independientes"],
  parrillaGasVapor: ["Funcionamiento a gas licuado (GLP) o gas natural (GN)","Sistema de agua (vapor) para recolección de grasa","Válvula de seguridad con llama piloto","Parrilla de hierro fundido (pik)","Dos zonas de calentamiento independientes"],
  parrillaElecVapor: ["Funcionamiento eléctrico","Sistema de agua (vapor) para recolección de grasa","Dos zonas de calentamiento independientes","Control termostático","Cuerpo de acero inoxidable"],
  freezer: ["Enfriamiento por aire forzado (ventilado)","Rango de temperatura: -18 / -20 °C","Gas ecológico R-290 (libre de CFC)","Cuerpo de acero inoxidable","Puertas con autocierre a 45°","Alimentación: 220–230 V – 50 Hz","Fácil de limpiar y mantener higiene"],
  heladeraVidrio: ["Puertas de vidrio con iluminación interior","Enfriamiento por aire forzado (ventilado)","Rango de temperatura: 0 / +5 °C","Gas ecológico R-290 (libre de CFC)","Cuerpo de acero inoxidable","Alimentación: 220–230 V – 50 Hz","Fácil de limpiar y mantener higiene"],
};

// nombre lindo + categoría + características para cada FAMILIA NUEVA
const NEWFAM = {
  "freezer-mostrador":                     { nombre: "Freezer Bajo Mostrador", categoria: "Refrigeración", caract: C.freezer },
  "heladera-vidrio-mostrador":             { nombre: "Heladera Mostrador con Puerta de Vidrio", categoria: "Refrigeración", caract: C.heladeraVidrio },
  "freidora-electrica-900":                { nombre: "Freidora Eléctrica (Serie 900)", categoria: "Freidoras", caract: C.freidoraElec },
  "freidora-electrica-elevador":           { nombre: "Freidora Eléctrica con Elevador y Filtro de Aceite", categoria: "Freidoras", caract: ["Elevador automático de canastos","Sistema de filtrado de aceite",...C.freidoraElec] },
  "freidora-electrica-mueble":             { nombre: "Freidora Eléctrica Doble con Mueble", categoria: "Freidoras", caract: C.freidoraElec },
  "freidora-gas":                          { nombre: "Freidora a Gas (sin Mueble)", categoria: "Freidoras", caract: C.freidoraGas },
  "freidora-gas-900":                      { nombre: "Freidora a Gas (Serie 900)", categoria: "Freidoras", caract: C.freidoraGas },
  "bano-maria-electrico-900":              { nombre: "Baño María Eléctrico (Serie 900)", categoria: "Cocinas", caract: C.banoMaria },
  "gabinete-bajo-mostrador-900":           { nombre: "Gabinete Bajo Mostrador con Puertas (Serie 900)", categoria: "Superficies", caract: C.gabinete("900") },
  "gabinete-bajo-mostrador-sin-puerta-900":{ nombre: "Gabinete Bajo Mostrador sin Puerta (Serie 900)", categoria: "Superficies", caract: C.gabinete("900") },
  "marmita-electrica-700":                 { nombre: "Marmita Eléctrica (Calentamiento Indirecto)", categoria: "Cocinas", caract: C.marmitaElec },
  "marmita-electrica-900":                 { nombre: "Marmita Eléctrica (Serie 900)", categoria: "Cocinas", caract: C.marmitaElec },
  "marmita-gas-900":                       { nombre: "Marmita a Gas (Serie 900)", categoria: "Cocinas", caract: C.marmitaGas },
  "parrilla-electrica-vapor":              { nombre: "Parrilla Eléctrica a Vapor", categoria: "Parrillas", caract: C.parrillaElecVapor },
  "parrilla-gas-piedra-lavica-900":        { nombre: "Parrilla a Gas con Piedra Lávica (Serie 900)", categoria: "Parrillas", caract: C.parrillaLava },
  "parrilla-gas-vapor":                    { nombre: "Parrilla a Gas a Vapor", categoria: "Parrillas", caract: C.parrillaGasVapor },
  "parrilla-gas-vapor-900":                { nombre: "Parrilla a Gas a Vapor (Serie 900)", categoria: "Parrillas", caract: C.parrillaGasVapor },
  "plancha-electrica-acanalada":           { nombre: "Plancha Eléctrica Acanalada", categoria: "Planchas", caract: C.planchaElec },
  "plancha-electrica-acanalada-900":       { nombre: "Plancha Eléctrica Acanalada (Serie 900)", categoria: "Planchas", caract: C.planchaElec },
  "plancha-electrica-lisa-900":            { nombre: "Plancha Eléctrica Lisa (Serie 900)", categoria: "Planchas", caract: C.planchaElec },
  "plancha-electrica-mixta":               { nombre: "Plancha Eléctrica Lisa + Acanalada", categoria: "Planchas", caract: C.planchaElec },
  "plancha-electrica-mixta-900":           { nombre: "Plancha Eléctrica Lisa + Acanalada (Serie 900)", categoria: "Planchas", caract: C.planchaElec },
  "plancha-gas-acanalada-900":             { nombre: "Plancha a Gas Acanalada (Serie 900)", categoria: "Planchas", caract: C.planchaGasAcan },
  "plancha-gas-lisa-900":                  { nombre: "Plancha a Gas Lisa (Serie 900)", categoria: "Planchas", caract: C.planchaGasLisa },
  "plancha-gas-mixta":                     { nombre: "Plancha a Gas Lisa + Acanalada", categoria: "Planchas", caract: C.planchaGasLisa },
  "plancha-gas-mixta-900":                 { nombre: "Plancha a Gas Lisa + Acanalada (Serie 900)", categoria: "Planchas", caract: C.planchaGasLisa },
};

// dims de respaldo para códigos sin fila propia en el Excel (255 = 2550mm, 700 lt)
const FALLBACK = {
  "EMP.255.70.03":    { dimensiones_mm: { Ancho: 2550, Profundidad: 700, Alto: 850 }, precio_usd: null, potencia_kw: null, capacidad: "700 lt" },
  "EMP.255.70.01-2C": { dimensiones_mm: { Ancho: 2550, Profundidad: 700, Alto: 850 }, precio_usd: null, potencia_kw: null, capacidad: "700 lt" },
};

function buildVariant(dbRow) {
  const x = xmap[dbRow.codigo] || FALLBACK[dbRow.codigo] || {};
  const dims = x.dimensiones_mm ?? dbRow.dimensiones_mm ?? null;
  const cap  = x.capacidad ?? null;
  const etiqueta = dims
    ? (cap ? `${cap} — ${dims.Ancho}×${dims.Profundidad}×${dims.Alto} mm` : `${dims.Ancho}×${dims.Profundidad}×${dims.Alto} mm`)
    : (dbRow.etiqueta ?? null);
  const v = {
    codigo: dbRow.codigo,
    etiqueta,
    precio_usd: x.precio_usd ?? null,
    stock: 0,
    modo_disponibilidad: "por_encargo",
    dimensiones_mm: dims,
  };
  if (x.potencia_kw != null) v.potencia_kw = x.potencia_kw;
  if (cap != null) v.capacidad = cap;
  return v;
}

// ── Agrupar variantes NUEVAS por familia_id ──────────────────────────────────
const newByFam = new Map();
for (const row of db) {
  if (pfCodes.has(row.codigo)) continue; // ya está en PF, se respeta
  if (!newByFam.has(row.familia_id)) newByFam.set(row.familia_id, []);
  newByFam.get(row.familia_id).push(row);
}

const addedToExisting = [];
const createdFamilies = [];

for (const [famId, rows] of newByFam) {
  const variantes = rows.map(buildVariant);
  if (pfById.has(famId)) {
    pfById.get(famId).variantes.push(...variantes);
    addedToExisting.push(`${famId} (+${variantes.length})`);
  } else {
    const meta = NEWFAM[famId];
    if (!meta) { console.error(`⚠️  Familia nueva sin metadata: ${famId}`); continue; }
    const fam = { id: famId, nombre: meta.nombre, categoria: meta.categoria, caracteristicas_generales: meta.caract, variantes };
    pf.push(fam);
    pfById.set(famId, fam);
    createdFamilies.push(`${famId} → ${meta.categoria}`);
  }
}

// ── Reglas de categorización / borrado ───────────────────────────────────────
// 1) Borrar EMP.AS.8 (familia base-horno-pizzero, única variante)
let out = pf.filter((f) => {
  f.variantes = f.variantes.filter((v) => v.codigo !== "EMP.AS.8");
  return f.variantes.length > 0;
});

// 2) Estanterías / acero inox → categoría "Acero"
const ACERO = new Set(["estantes-acero-inox", "superficie-trabajo", "gabinete-inferior-horno-carbon"]);
// 3) Servicio en el nombre → categoría "Servicio"
const SERVICIO = new Set(["carro-servicio", "carro-servicio-plastico", "unidad-servicio-frio"]);
// 4) Horno en el nombre → categoría "Hornos"
const HORNOS = new Set(["horno-tandoori", "horno-ahumador"]);

for (const f of out) {
  if (ACERO.has(f.id)) f.categoria = "Acero";
  else if (SERVICIO.has(f.id)) f.categoria = "Servicio";
  else if (HORNOS.has(f.id)) f.categoria = "Hornos";
  else if (f.categoria === "Hornos a Gas") f.categoria = "Hornos"; // consolidar
}

writeFileSync("Products_final.json", JSON.stringify(out, null, 2) + "\n");

// ── Reporte ──────────────────────────────────────────────────────────────────
console.log(`✅ Products_final.json regenerado`);
console.log(`   Familias: ${out.length} | Variantes: ${out.reduce((n, f) => n + f.variantes.length, 0)}`);
console.log(`   Familias nuevas creadas: ${createdFamilies.length}`);
createdFamilies.forEach((s) => console.log(`     + ${s}`));
console.log(`   Variantes sumadas a familias existentes:`);
addedToExisting.forEach((s) => console.log(`     ~ ${s}`));
const cats = {};
out.forEach((f) => (cats[f.categoria] = (cats[f.categoria] || 0) + 1));
console.log(`   Categorías:`, JSON.stringify(cats));

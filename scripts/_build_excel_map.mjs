// Construye un mapa código -> valores CORRECTOS desde _excel_full.json.
// Cada hoja tiene distinto orden de columnas; los índices se definen por hoja.
import { readFileSync, writeFileSync } from "node:fs";

const ex = JSON.parse(readFileSync("_excel_full.json", "utf-8"));

// idx: dims, precio, kw, cap  (null = no aplica)
const SHEETS = {
  "Heladeras":            { dims: 2, precio: 4, kw: null, cap: 3, capUnit: "lt" },
  "Freidoras":            { dims: 2, precio: 4, kw: 5,    cap: 3, capUnit: "lt" },
  "Baño María":           { dims: 2, precio: 4, kw: 5,    cap: 3, capUnit: "" },
  "Plancha":              { dims: 2, precio: 3, kw: 4,    cap: null },
  "Parrillas":            { dims: 2, precio: 3, kw: 4,    cap: null },
  "Cocción":              { dims: 2, precio: 4, kw: 5,    cap: 3, capUnit: "" },
  "Undercounter Cabinets":{ dims: 2, precio: 3, kw: null, cap: null },
};

function parseDims(s) {
  if (typeof s !== "string") return null;
  const m = s.match(/(\d+)\s*[x×]\s*(\d+)\s*[x×]\s*(\d+)/i);
  if (!m) return null;
  // Excel: Ancho x Prof x Alto
  return { Ancho: +m[1], Profundidad: +m[2], Alto: +m[3] };
}

function normCap(v, unit) {
  if (v == null) return null;
  if (typeof v === "number") return unit ? `${v} ${unit}`.trim() : `${v}`;
  const s = String(v).trim();
  if (!s || s === "—") return null;
  return s;
}

const map = {};
for (const [sheet, cfg] of Object.entries(SHEETS)) {
  for (const row of ex[sheet].rows) {
    const codigo = row[0];
    if (typeof codigo !== "string" || !/^EMP\./.test(codigo)) continue;
    const desc = row[1];
    if (desc == null) continue; // filas placeholder (código sin datos)
    map[codigo.trim()] = {
      desc: String(desc).trim(),
      dimensiones_mm: parseDims(row[cfg.dims]),
      precio_usd: cfg.precio != null && typeof row[cfg.precio] === "number" ? row[cfg.precio] : null,
      potencia_kw: cfg.kw != null && typeof row[cfg.kw] === "number" ? row[cfg.kw] : null,
      capacidad: cfg.cap != null ? normCap(row[cfg.cap], cfg.capUnit) : null,
    };
  }
}

writeFileSync("_excel_map.json", JSON.stringify(map, null, 2));
console.log(`Mapa construido: ${Object.keys(map).length} códigos`);

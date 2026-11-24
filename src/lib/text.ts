// Minúsculas y sin tildes/diéresis: "Refrigeración" y "refrigeracion" matchean igual.
export function normalizeText(value: string | null | undefined): string {
  if (!value) return ''
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

// Divide la búsqueda en palabras: un producto matchea si contiene TODAS
// ("horno 10" encuentra "Horno convector 10 bandejas").
export function searchTokens(query: string): string[] {
  return normalizeText(query).split(/\s+/).filter(Boolean)
}

export function matchesAllTokens(haystack: string, tokens: string[]): boolean {
  return tokens.every(token => haystack.includes(token))
}

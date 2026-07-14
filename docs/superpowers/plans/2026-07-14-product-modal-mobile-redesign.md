# ProductModal Mobile Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the mobile (`<640px`) layout of the public product modal to a premium B2B look (bigger hero image, icon-per-row spec card, forced 2-col benefits grid, bigger sticky CTAs) while leaving the desktop (`sm:` and up) layout pixel-identical to today.

**Architecture:** Single-file, class-level changes to `src/components/catalog/ProductModal.tsx` and its companion styles in `src/index.css`. No new components, no new files. Desktop parity is achieved by adding explicit `sm:` Tailwind overrides (and a matching `@media (min-width: 640px)` block in CSS) that restore every touched property back to its current desktop value — never by duplicating JSX subtrees.

**Tech Stack:** React 19 + TypeScript, Tailwind CSS 3 (JIT, default breakpoints, `sm` = 640px, confirmed via `tailwind.config.js` — no custom `screens` override), Framer Motion, lucide-react `^0.562.0`, Vite dev server.

## Global Constraints

- Only the mobile view (below the `sm` / 640px breakpoint) may change visually. Every element at `sm:` and above must render exactly as it does today — verify by reading the pre-change class list before adding any `sm:` override and reproducing it verbatim.
- Do not modify business logic: WhatsApp URL generation (`handleWhatsApp`), quote-list add/remove (`handleQuoteToggle`, `handleConfirmRemove`), `ConfirmDialog`, variant selection (`selectedId`/`allVariants`), or the `density`/`specs`/`caracteristicas`/`accesorios` computation logic beyond adding an `icon` field to each spec entry.
- Do not touch `src/pages/admin/modals/ProductModal.tsx` (separate admin component, out of scope).
- Do not rewrite product copy — all text comes from `product` data.
- The CTA buttons (WhatsApp / Agregar-Quitar de lista) must remain outside the scrollable content area (`flex-shrink-0`, sibling of the `overflow-y-auto` div) so they stay visible regardless of content length. Do not change this structural placement.
- lucide-react icons used below (`Ruler`, `Weight`, `Zap`, `Box`, `Gauge`, `ShoppingBasket`, `Power`, `Thermometer`, `ListChecks`) are confirmed present in the installed `lucide-react` version.
- No automated test suite exists in this repo (no vitest/jest configured). Verification is: `npx tsc -b --noEmit` for type safety, `npm run lint` for lint cleanliness, and manual visual verification via the Browser tool at mobile (375×812) and desktop (1280×800) viewports.

---

### Task 1: Close button + hero image panel (mobile-only)

**Files:**
- Modify: `src/components/catalog/ProductModal.tsx:204-256`

**Interfaces:**
- Consumes: existing `product`, `imageLoaded`, `isPlaceholder`, `imageUrl`, `isInQuoteList`, `onClose`, `setImageLoaded` — no signature changes.
- Produces: no new exports; purely JSX/className changes inside the existing component body.

- [ ] **Step 1: Replace the close button markup**

Replace the current block (lines 204-213):

```tsx
              <motion.button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-3 right-3 z-30 w-11 h-11 flex items-center justify-center rounded-lg bg-white shadow-md border border-[#E8E2D9] text-[#6B6159] hover:text-[#C41B2E] hover:bg-[#FFF0F1] hover:border-[#C41B2E]/30 hover:shadow-lg transition-colors duration-150 cursor-pointer outline-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
              >
                <X className="w-5 h-5" strokeWidth={2.25} />
              </motion.button>
```

with:

```tsx
              <motion.button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-3 right-3 z-30 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full sm:rounded-lg bg-white/90 sm:bg-white backdrop-blur-sm sm:backdrop-blur-none shadow-sm sm:shadow-md border border-transparent sm:border-[#E8E2D9] text-[#6B6159] hover:text-[#C41B2E] hover:bg-[#FFF0F1] hover:border-[#C41B2E]/30 hover:shadow-lg transition-colors duration-200 cursor-pointer outline-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
              >
                <X className="w-5 h-5" strokeWidth={2.25} />
              </motion.button>
```

- [ ] **Step 2: Replace the image panel markup**

Replace the current block (lines 219-256):

```tsx
                <div className="relative bg-[#F0EBE2] h-[30dvh] sm:h-auto overflow-hidden flex-shrink-0">
                  {!imageLoaded && <div className="absolute inset-0 bg-[#E6E0D7] animate-pulse" />}
                  <motion.img
                    src={imageUrl}
                    alt={product.nombre}
                    width={420}
                    height={494}
                    className={`absolute inset-0 w-full h-full ${isPlaceholder ? 'object-contain p-8' : 'object-cover'}`}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={imageLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    onLoad={() => setImageLoaded(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3.5 left-3.5">
                    <AvailabilityBadge modo={product.modo_disponibilidad} size="md" />
                  </div>

                  <AnimatePresence>
                    {isInQuoteList && (
                      <motion.div
                        className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold shadow-md"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                      >
                        <Check className="w-3 h-3" />
                        En tu lista
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="modal-product-media-meta">
                    <p className="modal-product-media-category">{product.categoria}</p>
                  </div>
                </div>
```

with:

```tsx
                <div className="relative bg-[var(--warm-50)] sm:bg-[#F0EBE2] h-[38dvh] sm:h-auto overflow-hidden flex-shrink-0">
                  {!imageLoaded && <div className="absolute inset-0 bg-[#E6E0D7] animate-pulse" />}
                  <motion.img
                    src={imageUrl}
                    alt={product.nombre}
                    width={420}
                    height={494}
                    className={`absolute inset-0 w-full h-full ${isPlaceholder ? 'object-contain p-8' : 'object-cover'}`}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={imageLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    onLoad={() => setImageLoaded(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none hidden sm:block" />

                  <div className="absolute top-3.5 left-3.5 shadow-sm sm:shadow-none rounded-md">
                    <AvailabilityBadge modo={product.modo_disponibilidad} size="md" />
                  </div>

                  <AnimatePresence>
                    {isInQuoteList && (
                      <motion.div
                        className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold shadow-md"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                      >
                        <Check className="w-3 h-3" />
                        En tu lista
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="modal-product-media-meta hidden sm:block">
                    <p className="modal-product-media-category">{product.categoria}</p>
                  </div>
                </div>
```

Note: `--warm-50` (`#FAF8F4`) is an existing CSS variable defined in `src/index.css:36` — no new variable needed.

- [ ] **Step 3: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors (this task only touches className strings, no type changes).

- [ ] **Step 4: Visual verification (mobile)**

Using the Browser tool:
1. `preview_start` with url `http://localhost:5173` (start `npm run dev` first if not already running — check `.claude/launch.json`, create it if missing with `{"version":"0.0.1","configurations":[{"name":"dev","runtimeExecutable":"npm","runtimeArgs":["dev"],"port":5173}]}`).
2. `resize_window` to 375×812 (mobile preset).
3. `navigate` to `/`, scroll to `#catalogo`, click a product card to open the modal.
4. `screenshot` — confirm: image panel is taller (~38% of viewport height), background is a light neutral tone (not beige `#F0EBE2`), no dark gradient over the image, no category text overlaid at the bottom of the image, close button is a small circular translucent button top-right.

- [ ] **Step 5: Visual verification (desktop parity)**

1. `resize_window` to 1280×800.
2. Open the same modal.
3. `screenshot` — confirm: image panel background is the original beige (`#F0EBE2`), dark gradient is present, category text is overlaid bottom-left on the image, close button is the original square-ish `rounded-lg` white button with visible border — i.e. pixel-equivalent to the pre-change screenshot.

- [ ] **Step 6: Commit**

```bash
git add src/components/catalog/ProductModal.tsx
git commit -m "Restyle mobile close button and hero image panel in ProductModal"
```

---

### Task 2: Header title size + variant chip radius (mobile-only)

**Files:**
- Modify: `src/index.css:252-263`
- Modify: `src/components/catalog/ProductModal.tsx:268-284`

**Interfaces:**
- Consumes: `.modal-product-header-title` CSS class (unchanged selector name), `allVariants`, `variantLabel`, `setSelectedId`, `setImageLoaded`, `product.id` — no signature changes.
- Produces: none new.

- [ ] **Step 1: Update the header title CSS**

In `src/index.css`, replace:

```css
  .modal-product-header-title {
    @apply pr-8 break-words whitespace-normal;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 1.22rem;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
    color: var(--warm-950);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
```

with:

```css
  .modal-product-header-title {
    @apply pr-8 break-words whitespace-normal;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1.22;
    letter-spacing: -0.01em;
    color: var(--warm-950);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  @media (min-width: 640px) {
    .modal-product-header-title {
      font-size: 1.22rem;
      line-height: 1.25;
    }
  }
```

- [ ] **Step 2: Update the variant chip radius**

In `src/components/catalog/ProductModal.tsx`, replace:

```tsx
                    {allVariants.length > 1 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {allVariants.map(v => (
                          <button
                            key={v.id}
                            onClick={() => { setImageLoaded(false); setSelectedId(v.id); }}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                              v.id === product.id
                                ? 'bg-[#C41B2E] text-white border-[#C41B2E]'
                                : 'bg-white text-[#7B7064] border-[#E8E2D9] hover:border-[#C41B2E]/40 hover:text-[#1A1613]'
                            }`}
                          >
                            {variantLabel(v)}
                          </button>
                        ))}
                      </div>
                    )}
```

with:

```tsx
                    {allVariants.length > 1 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {allVariants.map(v => (
                          <button
                            key={v.id}
                            onClick={() => { setImageLoaded(false); setSelectedId(v.id); }}
                            className={`px-2.5 py-1 rounded-full sm:rounded text-[11px] font-semibold border transition-colors duration-200 cursor-pointer ${
                              v.id === product.id
                                ? 'bg-[#C41B2E] text-white border-[#C41B2E]'
                                : 'bg-white text-[#7B7064] border-[#E8E2D9] hover:border-[#C41B2E]/40 hover:text-[#1A1613]'
                            }`}
                          >
                            {variantLabel(v)}
                          </button>
                        ))}
                      </div>
                    )}
```

- [ ] **Step 3: Visual verification**

1. Mobile (375×812): open a product with 2+ variants (check `src/data/products.ts` or the catalog UI for a grouped product). Confirm: title text is visibly larger than the description below it and fully readable in 1-2 lines; variant chips are pill-shaped (fully rounded).
2. Desktop (1280×800): same product. Confirm: title size and variant chip shape look exactly as before (slightly-rounded rectangular chips, smaller title).

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/components/catalog/ProductModal.tsx
git commit -m "Enlarge mobile header title and round variant chips"
```

---

### Task 3: Spec card with icon-per-row (mobile-only)

**Files:**
- Modify: `src/components/catalog/ProductModal.tsx:1-2` (imports)
- Modify: `src/components/catalog/ProductModal.tsx:114-133` (specs array construction)
- Modify: `src/components/catalog/ProductModal.tsx:296-311` (specs render block)

**Interfaces:**
- Consumes: `product.dimensiones_mm`, `product.capacidad`, `product.voltaje`, `product.peso_kg`, `product.volumen_m3`, `product.motor_rpm`, `product.dimensiones_canasto_mm`, `product.potencias_kw`, `product.temperaturas_c`, `product.programas` — unchanged.
- Produces: `specs` now has shape `{ label: string; value: string; icon: LucideIcon }[]` instead of `{ label: string; value: string }[]`. This is a local variable, not exported — no other task or file depends on it.

- [ ] **Step 1: Extend the lucide-react import**

Replace line 2:

```tsx
import { Check, Plus, X, Settings, Package, Layers } from 'lucide-react';
```

with:

```tsx
import { Check, Plus, X, Settings, Package, Layers, Ruler, Weight, Zap, Box, Gauge, ShoppingBasket, Power, Thermometer, ListChecks, type LucideIcon } from 'lucide-react';
```

- [ ] **Step 2: Add an `icon` field to every spec entry**

Replace the block (lines 114-133):

```tsx
  // Specs
  const specs: { label: string; value: string }[] = [];
  const dim = product.dimensiones_mm as Record<string, number> | null;
  if (dim && (dim.Ancho || dim.Profundidad || dim.Alto))
    specs.push({ label: 'Dimensiones', value: `${dim.Ancho ?? '—'} × ${dim.Profundidad ?? '—'} × ${dim.Alto ?? '—'} mm` });
  if (product.capacidad)          specs.push({ label: 'Capacidad',   value: product.capacidad });
  if (product.voltaje)            specs.push({ label: 'Voltaje',     value: product.voltaje });
  if (product.peso_kg != null)    specs.push({ label: 'Peso',        value: `${product.peso_kg} kg` });
  if (product.volumen_m3 != null) specs.push({ label: 'Volumen',     value: `${product.volumen_m3} m³` });
  if (product.motor_rpm != null)  specs.push({ label: 'Motor',       value: `${product.motor_rpm} RPM` });
  if (product.dimensiones_canasto_mm) specs.push({ label: 'Canasto', value: product.dimensiones_canasto_mm });
  const pot = product.potencias_kw as Record<string, number> | null;
  if (pot?.Total != null)         specs.push({ label: 'Potencia',    value: `${pot.Total} kW` });
  if (pot?.Motor != null)         specs.push({ label: 'Pot. motor',  value: `${pot.Motor} kW` });
  const temp = product.temperaturas_c as Record<string, number> | null;
  if (temp?.Lavado != null)       specs.push({ label: 'T. lavado',   value: `${temp.Lavado} °C` });
  if (temp?.Enjuague != null)     specs.push({ label: 'T. enjuague', value: `${temp.Enjuague} °C` });
  const prog = product.programas as Record<string, number> | null;
  if (prog?.Cantidad != null)     specs.push({ label: 'Programas',   value: `${prog.Cantidad}` });
```

with:

```tsx
  // Specs
  const specs: { label: string; value: string; icon: LucideIcon }[] = [];
  const dim = product.dimensiones_mm as Record<string, number> | null;
  if (dim && (dim.Ancho || dim.Profundidad || dim.Alto))
    specs.push({ label: 'Dimensiones', value: `${dim.Ancho ?? '—'} × ${dim.Profundidad ?? '—'} × ${dim.Alto ?? '—'} mm`, icon: Ruler });
  if (product.capacidad)          specs.push({ label: 'Capacidad',   value: product.capacidad, icon: Layers });
  if (product.voltaje)            specs.push({ label: 'Voltaje',     value: product.voltaje, icon: Zap });
  if (product.peso_kg != null)    specs.push({ label: 'Peso',        value: `${product.peso_kg} kg`, icon: Weight });
  if (product.volumen_m3 != null) specs.push({ label: 'Volumen',     value: `${product.volumen_m3} m³`, icon: Box });
  if (product.motor_rpm != null)  specs.push({ label: 'Motor',       value: `${product.motor_rpm} RPM`, icon: Gauge });
  if (product.dimensiones_canasto_mm) specs.push({ label: 'Canasto', value: product.dimensiones_canasto_mm, icon: ShoppingBasket });
  const pot = product.potencias_kw as Record<string, number> | null;
  if (pot?.Total != null)         specs.push({ label: 'Potencia',    value: `${pot.Total} kW`, icon: Power });
  if (pot?.Motor != null)         specs.push({ label: 'Pot. motor',  value: `${pot.Motor} kW`, icon: Power });
  const temp = product.temperaturas_c as Record<string, number> | null;
  if (temp?.Lavado != null)       specs.push({ label: 'T. lavado',   value: `${temp.Lavado} °C`, icon: Thermometer });
  if (temp?.Enjuague != null)     specs.push({ label: 'T. enjuague', value: `${temp.Enjuague} °C`, icon: Thermometer });
  const prog = product.programas as Record<string, number> | null;
  if (prog?.Cantidad != null)     specs.push({ label: 'Programas',   value: `${prog.Cantidad}`, icon: ListChecks });
```

- [ ] **Step 3: Render the icon per row, card radius, subtler dividers (mobile-only)**

Replace the block (lines 296-311):

```tsx
                    {hasSpecs && (
                      <div>
                        <div className={`flex items-center gap-1.5 ${d.mb2}`}>
                          <Settings className={`${d.iconSz} text-[#C41B2E]`} />
                          <span className={`modal-product-section-label ${d.sectionLbl}`}>Especificaciones técnicas</span>
                        </div>
                        <div className="divide-y divide-[#F0EAE2] rounded-lg overflow-hidden border border-[#EBE5DC]">
                          {specs.map((s, i) => (
                            <div key={s.label} className={`flex items-center justify-between px-3 ${d.specRowPy} ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}`}>
                              <span className={`text-[#9A8E82] font-medium ${d.labelTxt}`}>{s.label}</span>
                              <span className={`font-semibold text-[#1A1613] text-right ml-3 ${d.valueTxt}`}>{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
```

with:

```tsx
                    {hasSpecs && (
                      <div>
                        <div className={`flex items-center gap-1.5 ${d.mb2}`}>
                          <Settings className={`${d.iconSz} text-[#C41B2E]`} />
                          <span className={`modal-product-section-label ${d.sectionLbl}`}>Especificaciones técnicas</span>
                        </div>
                        <div className="divide-y divide-[#F5F1EB] sm:divide-[#F0EAE2] rounded-2xl sm:rounded-lg overflow-hidden border border-[#EBE5DC]">
                          {specs.map((s, i) => (
                            <div key={s.label} className={`flex items-center justify-between gap-2 px-3 ${d.specRowPy} ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}`}>
                              <span className="flex items-center gap-2 min-w-0">
                                <s.icon className="w-3.5 h-3.5 text-[#C41B2E]/70 flex-shrink-0 sm:hidden" />
                                <span className={`text-[#9A8E82] font-medium truncate ${d.labelTxt}`}>{s.label}</span>
                              </span>
                              <span className={`font-semibold text-[#1A1613] text-right ml-3 flex-shrink-0 ${d.valueTxt}`}>{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors. If `s.icon` errors as not callable as a component, confirm the import used `type LucideIcon` (type-only) and that each pushed object literal includes a real icon component reference (not a string).

- [ ] **Step 5: Visual verification**

1. Mobile (375×812): open a product with several specs (e.g. a dishwasher/oven-type product with dimensions, capacity, voltage, power). Confirm: each spec row shows a small red-tinted icon to the left of the label, card corners are more rounded than before, row separators are barely visible.
2. Desktop (1280×800): same product. Confirm: no icons are visible in the spec rows (icons are `sm:hidden`), card corners and divider color look exactly as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/catalog/ProductModal.tsx
git commit -m "Add per-row icons to the mobile spec card"
```

---

### Task 4: Características / Accesorios — forced 2-column grid + bigger check icon (mobile-only)

**Files:**
- Modify: `src/components/catalog/ProductModal.tsx:143-155` (density tokens `d`)
- Modify: `src/components/catalog/ProductModal.tsx:313-347` (características + accesorios render blocks)

**Interfaces:**
- Consumes: `caractTwoCols`, `accTwoCols`, `d.listGap`, `product.caracteristicas_generales`, `product.accesorios_incluidos` — unchanged.
- Produces: `d` gains a new token `listGapSm` (string), used only inside this task's render blocks.

- [ ] **Step 1: Add the `listGapSm` token**

In the `d` object (lines 143-155), the current block is:

```tsx
  const d = {
    padX:       density === 'dense'  ? 'px-4'         : 'px-5',
    padY:       density === 'sparse' ? 'py-5'          : density === 'normal' ? 'py-4' : 'py-3',
    spaceY:     density === 'sparse' ? 'space-y-5'     : density === 'normal' ? 'space-y-4' : 'space-y-3',
    specRowPy:  density === 'sparse' ? 'py-2.5'        : density === 'normal' ? 'py-2' : 'py-1.5',
    labelTxt:   density === 'sparse' ? 'text-[12.5px]' : density === 'normal' ? 'text-[11.5px]' : 'text-[10.5px]',
    valueTxt:   density === 'sparse' ? 'text-[13px]'   : density === 'normal' ? 'text-[12px]'   : 'text-[11px]',
    listTxt:    density === 'sparse' ? 'text-[13px]'   : density === 'normal' ? 'text-[12px]'   : 'text-[11.5px]',
    listGap:    density === 'sparse' ? 'space-y-2'     : density === 'normal' ? 'space-y-1.5'   : 'space-y-1',
    sectionLbl: density === 'sparse' ? 'text-[11px]'   : density === 'normal' ? 'text-[10.5px]' : 'text-[10px]',
    iconSz:     density === 'dense'  ? 'w-3 h-3'       : 'w-3.5 h-3.5',
    mb2:        density === 'sparse' ? 'mb-2.5'         : 'mb-1.5',
  } as const;
```

Add one line after `listGap`:

```tsx
  const d = {
    padX:       density === 'dense'  ? 'px-4'         : 'px-5',
    padY:       density === 'sparse' ? 'py-5'          : density === 'normal' ? 'py-4' : 'py-3',
    spaceY:     density === 'sparse' ? 'space-y-5'     : density === 'normal' ? 'space-y-4' : 'space-y-3',
    specRowPy:  density === 'sparse' ? 'py-2.5'        : density === 'normal' ? 'py-2' : 'py-1.5',
    labelTxt:   density === 'sparse' ? 'text-[12.5px]' : density === 'normal' ? 'text-[11.5px]' : 'text-[10.5px]',
    valueTxt:   density === 'sparse' ? 'text-[13px]'   : density === 'normal' ? 'text-[12px]'   : 'text-[11px]',
    listTxt:    density === 'sparse' ? 'text-[13px]'   : density === 'normal' ? 'text-[12px]'   : 'text-[11.5px]',
    listGap:    density === 'sparse' ? 'space-y-2'     : density === 'normal' ? 'space-y-1.5'   : 'space-y-1',
    listGapSm:  density === 'sparse' ? 'sm:space-y-2'  : density === 'normal' ? 'sm:space-y-1.5' : 'sm:space-y-1',
    sectionLbl: density === 'sparse' ? 'text-[11px]'   : density === 'normal' ? 'text-[10.5px]' : 'text-[10px]',
    iconSz:     density === 'dense'  ? 'w-3 h-3'       : 'w-3.5 h-3.5',
    mb2:        density === 'sparse' ? 'mb-2.5'         : 'mb-1.5',
  } as const;
```

- [ ] **Step 2: Force 2 columns on mobile for características**

Replace the block (lines 313-330):

```tsx
                    {hasCaract && (
                      <div>
                        <div className={`flex items-center gap-1.5 ${d.mb2}`}>
                          <Layers className={`${d.iconSz} text-[#C41B2E]`} />
                          <span className={`modal-product-section-label ${d.sectionLbl}`}>Características</span>
                        </div>
                        <ul className={caractTwoCols ? 'grid grid-cols-2 gap-x-3 gap-y-1' : d.listGap}>
                          {product.caracteristicas_generales!.map((f, i) => (
                            <li key={i} className={`flex items-start gap-2 text-[#3A3530] leading-snug ${d.listTxt}`}>
                              <span className="w-3.5 h-3.5 rounded-full bg-[#FFF0F1] border border-[#F5C5C9] flex items-center justify-center flex-shrink-0 mt-[1px]">
                                <Check className="w-2 h-2 text-[#C41B2E]" strokeWidth={2.5} />
                              </span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
```

with:

```tsx
                    {hasCaract && (
                      <div>
                        <div className={`flex items-center gap-1.5 ${d.mb2}`}>
                          <Layers className={`${d.iconSz} text-[#C41B2E]`} />
                          <span className={`modal-product-section-label ${d.sectionLbl}`}>Características</span>
                        </div>
                        <ul className={`grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-y-1 ${caractTwoCols ? 'sm:grid-cols-2' : `sm:grid-cols-1 sm:gap-x-0 ${d.listGapSm}`}`}>
                          {product.caracteristicas_generales!.map((f, i) => (
                            <li key={i} className={`flex items-start gap-2 text-[#3A3530] leading-snug ${d.listTxt}`}>
                              <span className="w-4 h-4 sm:w-3.5 sm:h-3.5 rounded-full bg-[#FFF0F1] border border-[#F5C5C9] flex items-center justify-center flex-shrink-0 mt-[1px]">
                                <Check className="w-2.5 h-2.5 sm:w-2 sm:h-2 text-[#C41B2E]" strokeWidth={2.5} />
                              </span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
```

- [ ] **Step 3: Force 2 columns on mobile for accesorios**

Replace the block (lines 332-347):

```tsx
                    {hasAccesorios && (
                      <div>
                        <div className={`flex items-center gap-1.5 ${d.mb2}`}>
                          <Package className={`${d.iconSz} text-[#C41B2E]`} />
                          <span className={`modal-product-section-label ${d.sectionLbl}`}>Accesorios incluidos</span>
                        </div>
                        <ul className={accTwoCols ? 'grid grid-cols-2 gap-x-3 gap-y-1' : d.listGap}>
                          {product.accesorios_incluidos!.map((a, i) => (
                            <li key={i} className={`flex items-start gap-2 text-[#3A3530] leading-snug ${d.listTxt}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C41B2E] flex-shrink-0 mt-[4px]" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
```

with:

```tsx
                    {hasAccesorios && (
                      <div>
                        <div className={`flex items-center gap-1.5 ${d.mb2}`}>
                          <Package className={`${d.iconSz} text-[#C41B2E]`} />
                          <span className={`modal-product-section-label ${d.sectionLbl}`}>Accesorios incluidos</span>
                        </div>
                        <ul className={`grid grid-cols-2 gap-x-3 gap-y-2 sm:gap-y-1 ${accTwoCols ? 'sm:grid-cols-2' : `sm:grid-cols-1 sm:gap-x-0 ${d.listGapSm}`}`}>
                          {product.accesorios_incluidos!.map((a, i) => (
                            <li key={i} className={`flex items-start gap-2 text-[#3A3530] leading-snug ${d.listTxt}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C41B2E] flex-shrink-0 mt-[4px]" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 5: Visual verification**

1. Mobile (375×812): open a product with 3-4 características (fewer than the current `>5` two-column threshold). Confirm: they now render in 2 columns (previously would have been 1 column). Check icon circles are visibly a bit bigger. Repeat with a product that has >5 características — still 2 columns, same as before.
2. Desktop (1280×800): open the same low-count product (≤5 características). Confirm: it renders in a single column exactly as before (this is the case most likely to regress, since desktop must fall back to `d.listGap` while mobile always forces the grid).
3. Desktop: open the >5-característica product. Confirm: still 2 columns, unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/components/catalog/ProductModal.tsx
git commit -m "Force 2-column mobile grid for caracteristicas and accesorios"
```

---

### Task 5: CTA buttons — bigger, more rounded (mobile-only)

**Files:**
- Modify: `src/components/catalog/ProductModal.tsx:357-386`

**Interfaces:**
- Consumes: `handleWhatsApp`, `handleQuoteToggle`, `isInQuoteList` — unchanged.
- Produces: none new.

- [ ] **Step 1: Update the WhatsApp button**

Replace (within the CTA block, lines 359-368):

```tsx
                      <motion.button
                        className="flex-1 h-10 rounded-lg text-[12.5px] font-semibold flex items-center justify-center gap-2 text-white cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #25d366 0%, #1da851 100%)', boxShadow: '0 4px 14px rgba(37,211,102,0.28)' }}
                        onClick={handleWhatsApp}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <WhatsAppSVG />
                        WhatsApp
                      </motion.button>
```

with:

```tsx
                      <motion.button
                        className="flex-1 h-12 sm:h-10 rounded-xl sm:rounded-lg text-[13px] sm:text-[12.5px] font-semibold flex items-center justify-center gap-2 text-white cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #25d366 0%, #1da851 100%)', boxShadow: '0 4px 14px rgba(37,211,102,0.28)' }}
                        onClick={handleWhatsApp}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <WhatsAppSVG />
                        WhatsApp
                      </motion.button>
```

- [ ] **Step 2: Update the Agregar/Quitar de lista button**

Replace (lines 370-384):

```tsx
                      <motion.button
                        className={`flex-1 h-10 rounded-lg text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer border ${
                          isInQuoteList
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'
                            : 'bg-[#C41B2E] text-white border-[#C41B2E] hover:bg-[#B51426] shadow-sm shadow-red-900/20'
                        }`}
                        onClick={handleQuoteToggle}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {isInQuoteList
                          ? <><X className="w-3.5 h-3.5" /> Quitar de la lista</>
                          : <><Plus className="w-3.5 h-3.5" /> Agregar a lista</>
                        }
                      </motion.button>
```

with:

```tsx
                      <motion.button
                        className={`flex-1 h-12 sm:h-10 rounded-xl sm:rounded-lg text-[13px] sm:text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer border ${
                          isInQuoteList
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'
                            : 'bg-[#C41B2E] text-white border-[#C41B2E] hover:bg-[#B51426] shadow-sm shadow-red-900/20'
                        }`}
                        onClick={handleQuoteToggle}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {isInQuoteList
                          ? <><X className="w-3.5 h-3.5" /> Quitar de la lista</>
                          : <><Plus className="w-3.5 h-3.5" /> Agregar a lista</>
                        }
                      </motion.button>
```

- [ ] **Step 3: Visual verification**

1. Mobile (375×812): confirm both buttons are visibly taller (~48px) with more rounded corners, still side-by-side, still pinned to the bottom of the modal regardless of scroll position in the content area above.
2. Desktop (1280×800): confirm both buttons are back to the original ~40px height and `rounded-lg` corners.

- [ ] **Step 4: Commit**

```bash
git add src/components/catalog/ProductModal.tsx
git commit -m "Enlarge mobile CTA buttons in ProductModal"
```

---

### Task 6: Full regression pass — lint, dense/sparse products, desktop parity

**Files:**
- None (verification-only task; fixes go back into the relevant task's file if something regresses).

**Interfaces:**
- Consumes: the fully-updated `ProductModal.tsx` and `index.css` from Tasks 1-5.
- Produces: nothing new — this is the acceptance gate for the whole plan.

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no new errors/warnings attributable to `ProductModal.tsx` (pre-existing unrelated warnings elsewhere in the repo, if any, are not this task's concern).

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Identify a dense and a sparse product**

Open `src/data/products.ts` (or query the running app) and note the `id`/`nombre` of:
- A "dense" product: one with specs + características + accesorios totalling more than 10 items (`density === 'dense'` per the existing logic at line 141).
- A "sparse" product: one with 4 or fewer total items (`density === 'sparse'`).

If unsure which products qualify, temporarily add `console.log(totalItems, density)` after line 141, open a few products in the browser, check the terminal/console output via `preview_logs` or `read_console_messages`, then remove the log line before committing.

- [ ] **Step 4: Mobile pass — dense product**

1. `resize_window` to 375×812.
2. Open the dense product's modal.
3. `screenshot`, then `scroll` the content area to the bottom.
4. Confirm: WhatsApp and Agregar/Quitar buttons are visible in the screenshot at every scroll position (never scroll out of view); spec card shows icons; características/accesorios render in 2 columns; no layout overflow or clipped text.

- [ ] **Step 5: Mobile pass — sparse product**

1. Same viewport, open the sparse product's modal.
2. `screenshot`.
3. Confirm: no awkward empty space, buttons visible, spec card (if present) still shows icons, image hero still ~38dvh tall.

- [ ] **Step 6: Desktop pass — both products**

1. `resize_window` to 1280×800.
2. Open both the dense and sparse product modals.
3. `screenshot` each.
4. Confirm both look pixel-equivalent to the pre-Task-1 baseline: beige image background, dark gradient + category overlay text on the image, `rounded-lg` close button with border, smaller header title, rectangular-ish variant chips, non-icon spec table, características/accesorios only 2-column when originally `>5` items, `h-10`/`rounded-lg` CTA buttons.

- [ ] **Step 7: Fix any regressions found**

If any check in Steps 4-6 fails, go back to the relevant task (1-5), fix the specific class/token, re-run that task's Step 3-ish type-check, and re-verify here. Do not proceed to Step 8 until all checks pass.

- [ ] **Step 8: Commit (only if fixes were made in Step 7)**

```bash
git add src/components/catalog/ProductModal.tsx src/index.css
git commit -m "Fix mobile/desktop parity regressions found in ProductModal review pass"
```

If no fixes were needed, skip this commit — Task 6 is verification-only.

---

## Notes on trimmed spec items

Two nice-to-have items from the design spec were intentionally left out, per its own optional/"se puede" phrasing (YAGNI — no functional or visual regression from omitting them):
- Eyebrow letter-spacing/margin tweak on the category label above the title.
- `active:scale-[0.99]` tactile feedback on the spec card when tapped on mobile.

Neither affects the goals of the redesign (hero image, spec-card icons, 2-col benefits grid, bigger sticky CTAs) and both can be added later as a trivial follow-up if desired.

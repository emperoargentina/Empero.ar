import { getLenis } from '@/hooks/useLenis';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Alto real de la navbar fija — las secciones quedan justo debajo, no tapadas.
function headerOffset(): number {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  return (header?.getBoundingClientRect().height ?? 64) + 12;
}

/** Scroll suave a un elemento, respetando la navbar fija y prefers-reduced-motion. */
export function scrollToElement(el: Element, extraOffset = 0): void {
  const offset = headerOffset() + extraOffset;
  const lenis = getLenis();
  if (lenis) {
    // Lenis ya resta el scroll-margin-top del elemento (ver index.css):
    // se compensa para que el resultado sea exactamente `offset`.
    const scrollMargin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    lenis.scrollTo(el as HTMLElement, { offset: scrollMargin - offset, duration: 1.0, force: true });
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

export function scrollToId(id: string, extraOffset = 0): void {
  const el = document.getElementById(id);
  if (el) scrollToElement(el, extraOffset);
}

export function scrollToTop(): void {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.0, force: true });
    return;
  }
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/**
 * Handler para <a href="#seccion">: mantiene el link real (funciona sin JS,
 * con click medio y en lectores de pantalla) y le suma el scroll suave.
 */
export function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, onDone?: () => void): void {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const hash = e.currentTarget.hash;
  e.preventDefault();
  if (!hash || hash === '#' || hash === '#inicio') scrollToTop();
  else scrollToId(decodeURIComponent(hash.slice(1)));
  onDone?.();
}

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { getLenis } from '@/hooks/useLenis';

// Barra de desplazamiento propia de la página, solo con mouse (computadoras):
// una píldora fina que aparece al desplazarse, se ensancha al pasar el mouse
// y se puede arrastrar o tocar el riel para saltar. La barra nativa se oculta
// solo mientras esta está montada (html.has-page-scrollbar); si el JS falla,
// queda la del navegador. Es decorativa para lectores de pantalla: el teclado,
// la rueda y el touchpad siguen desplazando la página como siempre.

const QUERY = '(hover: hover) and (pointer: fine)';
const MIN_THUMB = 48;
const IDLE_MS = 1100;

function useFinePointer(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(QUERY);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

function scrollToY(y: number, immediate: boolean) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { immediate });
  else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
}

export function PageScrollbar() {
  const fine = useFinePointer();
  if (!fine) return null;
  return <Rail />;
}

function Rail() {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const geo = useRef({ thumbH: 0, maxScroll: 0, maxTop: 0 });
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);

  // La nativa se oculta antes de pintar, mientras esta exista
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.classList.add('has-page-scrollbar');
    return () => html.classList.remove('has-page-scrollbar');
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    const thumb = thumbRef.current;
    if (!rail || !thumb) return;
    let frame = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      const view = window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const maxScroll = Math.max(0, total - view);
      const thumbH = maxScroll > 0 ? Math.max(MIN_THUMB, (view / total) * view) : 0;
      geo.current = { thumbH, maxScroll, maxTop: view - thumbH };
      thumb.style.height = `${thumbH}px`;
      rail.toggleAttribute('data-empty', maxScroll <= 0);
      place();
    };

    const place = () => {
      const { maxScroll, maxTop } = geo.current;
      const t = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      thumb.style.transform = `translateY(${Math.round(t * maxTop)}px)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
      rail.setAttribute('data-active', '');
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (!drag.current) rail.removeAttribute('data-active');
      }, IDLE_MS);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    measure();

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idle);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const onThumbDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startScroll: window.scrollY };
    railRef.current?.setAttribute('data-dragging', '');
    document.documentElement.classList.add('is-dragging-scrollbar');
  };

  const onThumbMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const { maxScroll, maxTop } = geo.current;
    if (maxTop <= 0) return;
    const y = d.startScroll + ((e.clientY - d.startY) / maxTop) * maxScroll;
    scrollToY(Math.min(maxScroll, Math.max(0, y)), true);
  };

  const onThumbUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    railRef.current?.removeAttribute('data-dragging');
    document.documentElement.classList.remove('is-dragging-scrollbar');
  };

  // Clic en el riel: la página va hasta ahí (centrando la píldora en el clic)
  const onRailDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    const { thumbH, maxScroll, maxTop } = geo.current;
    if (maxTop <= 0) return;
    const t = (e.clientY - thumbH / 2) / maxTop;
    scrollToY(Math.min(maxScroll, Math.max(0, t * maxScroll)), false);
  };

  return (
    <div ref={railRef} className="page-scrollbar" aria-hidden="true" onPointerDown={onRailDown}>
      <div
        ref={thumbRef}
        className="page-scrollbar__thumb"
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={onThumbUp}
        onPointerCancel={onThumbUp}
      />
    </div>
  );
}

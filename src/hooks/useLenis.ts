import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let _lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return _lenis;
}

// Scroll suave con inercia — solo para quien no pidió reducir movimiento.
// Con prefers-reduced-motion queda el scroll nativo del navegador.
export function useLenis() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const start = () => {
      if (_lenis || media.matches) return;
      _lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        autoRaf: true,
      });
    };
    const stop = () => {
      _lenis?.destroy();
      _lenis = null;
    };
    const onChange = () => (media.matches ? stop() : start());

    start();
    media.addEventListener('change', onChange);
    return () => {
      media.removeEventListener('change', onChange);
      stop();
    };
  }, []);
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
  isDataReady: boolean;
}

type Phase = 'loading' | 'finishing' | 'opening';

const MIN_MS = 1300;
const FINISH_MS = 250; // la línea de progreso llega al 100 %
const SEAM_MS = 480;   // la línea cruza la pantalla
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
const EASE_CURTAIN = [0.76, 0, 0.24, 1] as const;

// Secuencia (todo se abre desde el centro, como el logo):
//  1. El logo se revela de adentro hacia afuera; debajo, el progreso.
//  2. Al cargar, el progreso se completa, la marca se desvanece y la línea
//     roja cruza toda la pantalla.
//  3. La pantalla se abre en dos hojas desde esa línea y deja ver el hero,
//     cuyo contenido (centrado) entra mientras se abren.
// Con "reducir movimiento", MotionConfig (App.tsx) anula los desplazamientos.
export function Preloader({ onComplete, isDataReady }: PreloaderProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const resolved = useRef({ minDone: false, dataReady: false, exited: false });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const tryExit = useCallback(() => {
    const r = resolved.current;
    if (!r.minDone || !r.dataReady || r.exited) return;
    r.exited = true;
    // Todo por timers: tryExit se llama desde efectos y un setState
    // sincrónico ahí provoca renders en cascada.
    timers.current.push(
      setTimeout(() => setPhase('finishing'), 0),
      setTimeout(() => setPhase('opening'), FINISH_MS),
      // Al desmontarse corren los exit: las hojas se abren
      setTimeout(onComplete, FINISH_MS + SEAM_MS),
    );
  }, [onComplete]);

  useEffect(() => {
    const t = setTimeout(() => {
      resolved.current.minDone = true;
      tryExit();
    }, MIN_MS);
    const pending = timers.current;
    return () => {
      clearTimeout(t);
      pending.forEach(clearTimeout);
    };
  }, [tryExit]);

  useEffect(() => {
    resolved.current.dataReady = isDataReady;
    if (isDataReady) tryExit();
  }, [isDataReady, tryExit]);

  const opening = phase === 'opening';

  return (
    <motion.div
      role="status"
      aria-label="Cargando Empero Argentina"
      className="fixed inset-0 z-[9999] select-none"
    >
      {/* Hojas: un mismo resplandor tenue centrado, partido en dos */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[calc(50%+1px)] bg-[radial-gradient(ellipse_55%_90%_at_50%_100%,rgb(34_28_24)_0%,rgb(13_11_9)_100%)]"
        exit={{ y: '-100%' }}
        transition={{ duration: 0.8, ease: EASE_CURTAIN }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[calc(50%+1px)] bg-[radial-gradient(ellipse_55%_90%_at_50%_0%,rgb(34_28_24)_0%,rgb(13_11_9)_100%)]"
        exit={{ y: '100%' }}
        transition={{ duration: 0.8, ease: EASE_CURTAIN }}
      />

      {/* Marca: logo arriba de la línea central, leyenda abajo */}
      <motion.div
        className="absolute inset-0"
        animate={opening ? { opacity: 0, scale: 0.97 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeIn' }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-x-0 bottom-[calc(50%+2rem)] flex justify-center">
          <motion.img
            src="/images/logo/Logo.png"
            alt=""
            width={480}
            height={333}
            // Interior transparente y texto negro: en blanco monocromo se lee
            // sobre el fondo oscuro.
            className="w-[clamp(170px,20vw,240px)] h-auto object-contain brightness-0 invert"
            initial={{ opacity: 0, clipPath: 'inset(0% 50% 0% 50%)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
          />
        </div>

        {/* Progreso, centrado sobre la línea media */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[calc(50%-0.5px)] h-px w-36 -translate-x-1/2 bg-white/[0.12]"
        >
          <motion.div
            className="h-full origin-left bg-brand"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: phase === 'loading' ? 0.85 : 1 }}
            transition={
              phase === 'loading'
                ? { duration: MIN_MS / 1000, delay: 0.2, ease: [0.2, 0, 0.3, 1] }
                : { duration: FINISH_MS / 1000, ease: 'easeOut' }
            }
          />
        </div>

        <motion.p
          className="absolute inset-x-0 top-[calc(50%+1.6rem)] px-6 text-center text-[0.6562rem] sm:text-[0.6875rem] font-semibold uppercase tracking-[0.32em] text-white/45"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: EASE_OUT }}
        >
          Distribuidor oficial · Argentina
        </motion.p>
      </motion.div>

      {/* Línea de corte: crece desde el centro y se apaga al abrirse */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(50%-0.5px)] h-px origin-center bg-brand shadow-[0_0_14px_2px_rgb(195_21_27/0.45)]"
        // Oculta hasta usarse: con scaleX 0 el resplandor igual dejaba una marca
        initial={{ scaleX: 0, opacity: 0 }}
        animate={opening ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: SEAM_MS / 1000, ease: EASE_IN_OUT, opacity: { duration: 0.12 } }}
        exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
      />
    </motion.div>
  );
}

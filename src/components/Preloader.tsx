import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
  isDataReady: boolean;
}

const MIN_MS = 1900;

export function Preloader({ onComplete, isDataReady }: PreloaderProps) {
  const [progressDone, setProgressDone] = useState(false);
  const resolved = useRef({ minDone: false, dataReady: false, exited: false });

  const tryExit = useCallback(() => {
    const r = resolved.current;
    if (r.minDone && r.dataReady && !r.exited) {
      r.exited = true;
      setProgressDone(true);
      setTimeout(onComplete, 280);
    }
  }, [onComplete]);

  useEffect(() => {
    const t = setTimeout(() => {
      resolved.current.minDone = true;
      tryExit();
    }, MIN_MS);
    return () => clearTimeout(t);
  }, [tryExit]);

  useEffect(() => {
    resolved.current.dataReady = isDataReady;
    if (isDataReady) tryExit();
  }, [isDataReady, tryExit]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] overflow-hidden select-none flex flex-col"
      style={{ backgroundColor: '#000000' }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Heating element sweep — funciona igual sobre blanco */}
      <motion.div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: '50%',
          height: '1px',
          transformOrigin: 'left',
          background: 'linear-gradient(to right, transparent 0%, #C41B2E 15%, #ff4d5e 50%, #C41B2E 85%, transparent 100%)',
          boxShadow: '0 0 10px 2px rgba(196,27,46,0.5), 0 0 30px 6px rgba(196,27,46,0.15)',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.5, delay: 0, ease: 'easeInOut', times: [0, 0.4, 0.7, 1] }}
      />

      {/* Contenido central */}
      <div className="flex-1 flex flex-col items-center justify-center">

        {/* Círculo + logo */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 'clamp(320px, 48vw, 520px)', height: 'clamp(320px, 48vw, 520px)' }}
        >
          {/* SVG ring — empieza desde arriba (rotate -90deg), se dibuja en sentido horario */}
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            style={{ rotate: '-90deg' }}
          >
            <motion.circle
              cx="50" cy="50" r="45"
              stroke="#C41B2E"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{
                pathLength: { duration: 0.65, delay: 0.55, ease: [0.16, 1, 0.3, 1] },
                opacity:   { duration: 0.15, delay: 0.55 },
              }}
            />
            {/* Punto en el cierre del círculo */}
            <motion.circle
              cx="50" cy="5"
              r="2.4"
              fill="#C41B2E"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              transition={{ duration: 0.2, delay: 1.15 }}
            />
          </motion.svg>

          {/* Logo */}
          <motion.img
            src="/images/logo/Logo.png"
            alt="Empero"
            className="brightness-0 invert relative z-10"
            style={{ width: 'clamp(230px, 32vw, 360px)', objectFit: 'contain' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Línea roja bajo el logo */}
        <motion.div
          style={{
            marginTop: '1.75rem',
            height: '2px',
            background: 'linear-gradient(to right, transparent, rgba(196,27,46,0.85) 30%, rgba(196,27,46,0.85) 70%, transparent)',
            transformOrigin: 'center',
          }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 160, opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Tagline */}
        <motion.p
          className="font-sans font-light uppercase tracking-[0.18em] text-center mt-6 px-6"
          style={{ fontSize: 'clamp(1.3rem, 2.8vw, 1.7rem)', color: 'rgba(255,255,255,1)' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
        >
          Equipamiento gastronómico profesional
        </motion.p>

        {/* Sub-label */}
        <motion.p
          className="font-sans font-light uppercase text-center mt-3 px-6"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 1.42 }}
        >
          <span className="block sm:inline">Distribuidores oficiales</span>
          <span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">Argentina</span>
        </motion.p>

      </div>

      {/* Barra de progreso */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}>
        <motion.div
          style={{
            height: '100%',
            background: '#C41B2E',
            transformOrigin: 'left',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progressDone ? 1 : 0.88 }}
          transition={
            progressDone
              ? { duration: 0.2, ease: 'easeOut' }
              : { duration: (MIN_MS / 1000) - 0.2, delay: 0.1, ease: [0.2, 0, 0.4, 1] }
          }
        />
      </div>
    </motion.div>
  );
}

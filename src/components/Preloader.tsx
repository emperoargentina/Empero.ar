import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
  isDataReady: boolean;
}

const MIN_MS = 3200;

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
      style={{ backgroundColor: '#FAFAF9' }}
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
        transition={{ duration: 1.0, delay: 0.1, ease: 'easeInOut', times: [0, 0.45, 0.75, 1] }}
      />

      {/* Contenido central */}
      <div className="flex-1 flex flex-col items-center justify-center">

        {/* Círculo + logo */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 'clamp(240px, 28vw, 310px)', height: 'clamp(240px, 28vw, 310px)' }}
        >
          {/* SVG ring — empieza desde arriba (rotate -90deg), se dibuja en sentido horario */}
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            style={{ rotate: '-90deg' }}
          >
            <motion.circle
              cx="50" cy="50" r="46"
              stroke="#C41B2E"
              strokeWidth="0.55"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.75 }}
              transition={{
                pathLength: { duration: 1.4, delay: 0.95, ease: [0.16, 1, 0.3, 1] },
                opacity:   { duration: 0.2, delay: 0.95 },
              }}
            />
            {/* Punto en el cierre del círculo */}
            <motion.circle
              cx="50" cy="4"
              r="1.4"
              fill="#C41B2E"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.75 }}
              transition={{ duration: 0.25, delay: 2.35 }}
            />
          </motion.svg>

          {/* Logo */}
          <motion.img
            src="/images/logo/Logo.png"
            alt="Empero"
            className="brightness-0 relative z-10"
            style={{ width: 'clamp(150px, 17vw, 195px)', objectFit: 'contain' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Línea roja bajo el logo */}
        <motion.div
          style={{
            marginTop: '1.75rem',
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(196,27,46,0.85) 30%, rgba(196,27,46,0.85) 70%, transparent)',
            transformOrigin: 'center',
          }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 140, opacity: 1 }}
          transition={{ duration: 0.55, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Tagline */}
        <motion.p
          className="font-sans font-light uppercase tracking-[0.28em] text-center mt-5"
          style={{ fontSize: '0.66rem', color: 'rgba(26,22,19,0.55)' }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.45, ease: [0.16, 1, 0.3, 1] }}
        >
          Equipamiento gastronómico profesional
        </motion.p>

        {/* Sub-label */}
        <motion.p
          className="font-sans font-light uppercase text-center mt-2"
          style={{ fontSize: '0.53rem', letterSpacing: '0.32em', color: 'rgba(26,22,19,0.3)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 2.75 }}
        >
          Distribuidores oficiales · Argentina
        </motion.p>

      </div>

      {/* Barra de progreso */}
      <div style={{ height: '1px', background: 'rgba(0,0,0,0.07)' }}>
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

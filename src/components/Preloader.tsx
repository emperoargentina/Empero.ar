// =============================================================================
// Preloader Component - Pantalla de carga
// =============================================================================

import { useState, useEffect } from 'react';
import { ChefHat } from 'lucide-react';
import { companyConfig } from '@/data/company';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [phase, setPhase] = useState<'loading' | 'fading'>('loading');

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase('fading'), 2000);
    const completeTimer = setTimeout(() => onComplete(), 2600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-gray-950 flex flex-col items-center justify-center transition-opacity duration-600 ${
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d32f2f]/8 rounded-full blur-[120px]" />
      </div>

      {/* Logo with spinning ring */}
      <div className="preloader-text mb-8 relative">
        <div className="relative w-24 h-24">
          {/* Outer static ring */}
          <div className="absolute inset-0 rounded-full border border-white/8" />
          {/* Spinning accent ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#d32f2f] border-r-[#d32f2f]/30 animate-spin" style={{ animationDuration: '1.4s' }} />
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full border border-white/5" />
          {/* Icon container */}
          <div className="absolute inset-3 bg-gradient-to-br from-[#e53935] to-[#b71c1c] rounded-full flex items-center justify-center shadow-lg shadow-red-900/50">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Brand Name */}
      <div className="preloader-text text-center" style={{ animationDelay: '0.2s' }}>
        <h1 className="font-bold text-3xl md:text-4xl text-white tracking-widest mb-1">
          {companyConfig.name}
        </h1>
        <p className="text-sm text-[#ef5350] font-medium tracking-[0.25em] uppercase">
          Equipamiento Industrial
        </p>
      </div>

      {/* Loading bar */}
      <div className="mt-10 w-40 h-px bg-white/8 overflow-hidden rounded-full">
        <div className="preloader-line h-full bg-gradient-to-r from-transparent via-[#d32f2f] to-transparent rounded-full" />
      </div>

      {/* Tagline */}
      <p
        className="preloader-text mt-4 text-[10px] text-white/25 uppercase tracking-[0.4em]"
        style={{ animationDelay: '0.4s' }}
      >
        Cargando catálogo...
      </p>
    </div>
  );
}

import { useState, useEffect } from 'react';
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
      className={`fixed inset-0 z-[9999] bg-[#0B0A09] flex flex-col items-center justify-center transition-opacity duration-600 ${
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Ambient gold glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C41B2E]/[0.04] rounded-full blur-[140px]" />
      </div>

      {/* Logo with ring */}
      <div className="preloader-text mb-8 relative">
        <div className="relative w-24 h-24">
          {/* Outer static ring */}
          <div className="absolute inset-0 rounded-full border border-[rgba(196,27,46,0.08)]" />
          {/* Spinning gold ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: '#C41B2E',
              borderRightColor: 'rgba(196,27,46,0.2)',
              animationDuration: '1.4s',
            }}
          />
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full border border-[rgba(196,27,46,0.05)]" />
          {/* Logo */}
          <div className="absolute inset-3 bg-[#141210] rounded-full flex items-center justify-center shadow-lg overflow-hidden p-1">
            <img
              src="/images/logo/Logo.png"
              alt={companyConfig.name}
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>
        </div>
      </div>

      {/* Brand Name */}
      <div className="preloader-text text-center" style={{ animationDelay: '0.2s' }}>
        <h1 className="font-serif font-normal text-3xl md:text-4xl text-[#F0EDE8] tracking-widest mb-1">
          {companyConfig.name}
        </h1>
        <p className="text-sm text-[#C41B2E] font-medium tracking-[0.25em] uppercase opacity-70">
          Equipamiento Industrial
        </p>
      </div>

      {/* Loading bar */}
      <div className="mt-10 w-40 h-px bg-[rgba(196,27,46,0.06)] overflow-hidden rounded-full">
        <div className="preloader-line h-full bg-gradient-to-r from-transparent via-[#C41B2E] to-transparent rounded-full" />
      </div>

      {/* Tagline */}
      <p
        className="preloader-text mt-4 text-[10px] text-[#4D4540] uppercase tracking-[0.4em]"
        style={{ animationDelay: '0.4s' }}
      >
        Cargando catálogo...
      </p>
    </div>
  );
}

import { ArrowDown, Package, Award, Users, Shield, Zap, Star } from 'lucide-react';
import { handleAnchorClick } from '@/lib/scroll';

export const HERO_IMAGE_SRC = '/images/Visuales/heroteo.webp';

interface HeroProps {
  isReady?: boolean;
}

const STATS = [
  { key: 'years',     display: '40+',    label: 'Años de marca',      icon: Award },
  { key: 'products',  display: '3.000+', label: 'Tipos de productos', icon: Package },
  { key: 'countries', display: '90+',    label: 'Países',             icon: Users },
];

// Animaciones 100% CSS (ver .hero en index.css):
//  - Entrada escalonada cuando termina el preloader (data-ready).
//  - Parallax del fondo y fade del contenido con scroll-driven animations
//    (animation-timeline: view()), en el compositor, sin listeners de scroll.
//  - Todo dentro de prefers-reduced-motion: no-preference.
export function Hero({ isReady = false }: HeroProps) {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      data-ready={isReady || undefined}
      className="hero relative min-h-svh flex items-center justify-center overflow-clip pt-16 lg:pt-0"
    >
      {/* Background */}
      <div className="hero-bg absolute inset-0 z-0" aria-hidden="true">
        <div className="hero-kenburns absolute inset-0">
          <img
            src={HERO_IMAGE_SRC}
            alt=""
            className="w-full h-full object-cover"
            width={1600}
            height={837}
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black/90" />
        {/* Brillo rojo sutil — blur grande es caro en GPUs móviles, solo desktop */}
        <div className="hidden lg:block absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#C41B2E]/[0.06] rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#C41B2E]/[0.04] rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Content */}
      <div className="hero-content relative z-10 w-full container-custom py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">

          <div className="hero-step mb-5 lg:mb-6" style={{ '--step': 0 } as React.CSSProperties}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#C41B2E]/50" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E0485A]">
                Distribuidor oficial &bull; Argentina
              </p>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#C41B2E]/50" />
            </div>
          </div>

          <div className="hero-step mb-5 lg:mb-6" style={{ '--step': 1 } as React.CSSProperties}>
            <h1
              id="hero-title"
              className="text-[clamp(2.8rem,1.6rem+5vw,6.5rem)] leading-[1.0] font-serif font-[560] text-white tracking-[-0.025em]"
            >
              Equipamiento
              <br />
              <em className="not-italic text-[#E0283D]">gastronómico</em>
              <br />
              profesional
            </h1>
          </div>

          <div className="hero-step mb-6 lg:mb-7" style={{ '--step': 2 } as React.CSSProperties}>
            <p className="text-base md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed font-light px-2 text-pretty">
              Distribuidores oficiales de Empero en Argentina &mdash; marca turca con más de 40 años,
              más de 3.000 productos y presencia en 90+ países.
            </p>
          </div>

          <div className="hero-step mb-7 lg:mb-10" style={{ '--step': 3 } as React.CSSProperties}>
            <a
              href="#catalogo"
              onClick={handleAnchorClick}
              className="group inline-flex items-center gap-3 px-9 py-[15px] text-base font-semibold rounded-full transition-colors duration-300 bg-[#C41B2E] text-white hover:bg-[#E02035] shadow-[0_0_0_1px_rgba(196,27,46,0.4),0_8px_32px_rgba(196,27,46,0.35)]"
            >
              <Package className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              Ver catálogo
              <ArrowDown className="w-4 h-4 opacity-60 transition-transform duration-300 motion-safe:group-hover:translate-y-0.5" aria-hidden="true" />
            </a>

            <ul className="flex items-center justify-center gap-5 mt-7">
              <li className="flex items-center gap-2 text-white/65 text-xs font-medium">
                <Shield className="w-3.5 h-3.5 text-white/40" aria-hidden="true" />
                Garantía certificada
              </li>
              <li aria-hidden="true" className="w-px h-3.5 bg-white/10" />
              <li className="flex items-center gap-2 text-white/65 text-xs font-medium">
                <Zap className="w-3.5 h-3.5 text-white/40" aria-hidden="true" />
                Respuesta en 24h
              </li>
              <li aria-hidden="true" className="w-px h-3.5 bg-white/10 hidden sm:block" />
              <li className="hidden sm:flex items-center gap-2 text-white/65 text-xs font-medium">
                <Star className="w-3.5 h-3.5 text-white/40" aria-hidden="true" />
                +5000 clientes
              </li>
            </ul>
          </div>

          <div className="hero-step [@media(max-height:900px)]:hidden" style={{ '--step': 4 } as React.CSSProperties}>
            <dl className="grid grid-cols-3 gap-3 sm:gap-5 max-w-sm sm:max-w-xl mx-auto">
              {STATS.map(({ key, display, label, icon: Icon }) => (
                <div
                  key={key}
                  className="flex flex-col-reverse items-center text-center px-3 py-4 sm:px-4 sm:py-5 rounded-2xl border border-[rgba(196,27,46,0.14)] bg-[rgba(21,17,14,0.55)]"
                >
                  <dt className="text-[11px] sm:text-xs text-white/60 mt-1.5 font-medium">{label}</dt>
                  <dd className="flex flex-col items-center">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 bg-[rgba(196,27,46,0.1)] rounded-lg flex items-center justify-center mb-2.5" aria-hidden="true">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C41B2E]" />
                    </span>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
                      {display}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

        </div>
      </div>
    </section>
  );
}

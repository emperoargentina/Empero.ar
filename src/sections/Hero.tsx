import { handleAnchorClick } from '@/lib/scroll';

export const HERO_IMAGE_SRC = '/images/Visuales/heroteo.webp';

interface HeroProps {
  isReady?: boolean;
}

const STATS = [
  { value: '40+', label: 'años de marca' },
  { value: '3.000+', label: 'productos' },
  { value: '90+', label: 'países' },
];

// Hero centrado y liviano: eyebrow, título, una línea de apoyo y las cifras
// en una fila fina; abajo, una invitación a bajar al catálogo. Animaciones 100% CSS
// (ver .hero en index.css):
//  - Entrada escalonada cuando termina el preloader (data-ready).
//  - Parallax del fondo y fade del contenido con scroll-driven animations.
//  - Todo dentro de prefers-reduced-motion: no-preference.
export function Hero({ isReady = false }: HeroProps) {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      data-ready={isReady || undefined}
      className="hero relative min-h-svh flex items-center justify-center overflow-clip bg-ink-950"
    >
      {/* Fondo */}
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
        {/* Centro más oscuro para el texto; bordes con algo de foto */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgb(13_11_9/0.88)_0%,rgb(13_11_9/0.68)_55%,rgb(13_11_9/0.88)_100%)]" />
        {/* Fundido hacia la sección siguiente */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="hero-content relative z-10 w-full container-custom pt-28 pb-28 lg:pt-28 lg:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="hero-step inline-flex items-center gap-3 whitespace-nowrap text-[0.6875rem] sm:text-xs font-semibold uppercase tracking-[0.16em] sm:tracking-[0.22em] text-white/60"
            style={{ '--step': 0 } as React.CSSProperties}
          >
            <span aria-hidden="true" className="h-px w-5 sm:w-8 bg-brand" />
            Distribuidor oficial · Argentina
            <span aria-hidden="true" className="h-px w-5 sm:w-8 bg-brand" />
          </p>

          <h1
            id="hero-title"
            className="hero-step mt-6 font-display font-[560] text-[clamp(2.6rem,1.5rem+3.6vw,5rem)] leading-[1.02] tracking-[-0.03em] text-white"
            style={{ '--step': 1 } as React.CSSProperties}
          >
            Equipamiento <em className="not-italic text-brand">gastronómico</em>
            <br />
            profesional
          </h1>

          <p
            className="hero-step mx-auto mt-6 max-w-lg text-[0.9375rem] sm:text-[1.0625rem] leading-relaxed text-white/70 text-pretty"
            style={{ '--step': 2 } as React.CSSProperties}
          >
            Cocinas, hornos, freidoras, refrigeración y lavado de la marca turca Empero,
            para restaurantes, hoteles y cocinas de producción.
          </p>

          <dl
            className="hero-step hero-stats mx-auto mt-12 lg:mt-14"
            style={{ '--step': 4 } as React.CSSProperties}
          >
            {STATS.map(({ value, label }) => (
              <div key={label} className="hero-stats__item">
                <dt className="hero-stats__label">{label}</dt>
                <dd className="hero-stats__value">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Sin botones: la barra ya tiene "Catálogo" y WhatsApp flota siempre.
          Solo una invitación discreta a bajar. */}
      <a
        href="#catalogo"
        onClick={handleAnchorClick}
        className="hero-step hero-scroll"
        style={{ '--step': 5 } as React.CSSProperties}
      >
        Explorá el catálogo
        <span aria-hidden="true" className="hero-scroll__line" />
      </a>
    </section>
  );
}

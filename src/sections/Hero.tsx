import { ArrowDown, Package, Award, Users, Shield, Zap, Star } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { companyConfig } from '@/data/company';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface HeroProps {
  isReady?: boolean;
}

export function Hero({ isReady = false }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef      = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const countRefs  = useRef<{ products: number; years: number; clients: number }>({
    products: 0, years: 0, clients: 0,
  });
  const statsAnimated = useRef(false);

  useEffect(() => {
    if (!isReady) return;

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('.hero-badge',  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 })
        .fromTo('.hero-tag',    { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35 }, '-=0.2')
        .fromTo('.hero-title',  { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.2')
        .fromTo('.hero-desc',   { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35 }, '-=0.2')
        .fromTo('.hero-cta',    { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35 }, '-=0.2')
        .fromTo('.hero-stats',  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 },  '-=0.15')
        .fromTo('.hero-scroll', { opacity: 0 },        { opacity: 1, duration: 0.3 },         '-=0.1');
    }, sectionRef);

    return () => ctx.revert();
  }, [isReady]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.94,
        filter: 'blur(6px)',
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '40% top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statsRef.current || statsAnimated.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || statsAnimated.current) return;
      statsAnimated.current = true;

      const targets = {
        products: companyConfig.stats.products,
        years: companyConfig.stats.years,
        clients: companyConfig.stats.clients,
      };
      const duration = 2000;
      const start = Date.now();

      const tick = () => {
        const progress = Math.min((Date.now() - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        countRefs.current = {
          products: Math.floor(targets.products * ease),
          years: Math.floor(targets.years * ease),
          clients: Math.floor(targets.clients * ease),
        };
        document.querySelectorAll('[data-count]').forEach(el => {
          const key = el.getAttribute('data-count') as keyof typeof countRefs.current;
          el.textContent = String(countRefs.current[key]);
        });
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });

    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToCatalog = () => {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-0"
    >
      {/* Background */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div className="absolute inset-0 hero-kenburns">
          <picture>
            <source srcSet="/images/Visuales/HeroImage.webp" type="image/webp" />
            <img
              src="/images/Visuales/HeroImage.jpg"
              alt="Cocina industrial profesional Empero"
              className="w-full h-full object-cover"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black/90" />
        {/* Subtle red glow */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#C41B2E]/[0.06] rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#C41B2E]/[0.04] rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative z-10 w-full container-custom py-10 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">

          {/* Ornament + tagline */}
          <div className="hero-entrance hero-tag mb-7 lg:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#C41B2E]/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C41B2E]/80">
                Distribuidor oficial &bull; Argentina
              </span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#C41B2E]/50" />
            </div>
            <p className="text-[#C8BFB5]/85 text-base md:text-lg font-light tracking-wide">
              Marca turca. Presencia en más de 90 países.
            </p>
          </div>

          {/* Title */}
          <div className="hero-entrance hero-title mb-7 lg:mb-9">
            <h1 className="text-5xl leading-[1.0] sm:text-6xl md:text-[6.5rem] lg:text-[8rem] font-serif font-normal text-white tracking-[-0.025em]">
              Equipamiento
              <br />
              <em className="not-italic" style={{ color: '#C41B2E' }}>gastronómico</em>
              <br />
              profesional
            </h1>
          </div>

          {/* Description */}
          <div className="hero-entrance hero-desc mb-9 lg:mb-12">
            <p className="text-base md:text-xl text-white/65 max-w-2xl mx-auto leading-relaxed font-light px-2">
              Distribuidores oficiales de Empero en Argentina &mdash; marca turca con más de 40 años,
              más de 3.000 productos y presencia en 90+ países.
            </p>
          </div>

          {/* CTA */}
          <div className="hero-entrance hero-cta mb-12 lg:mb-20">
            <button
              onClick={scrollToCatalog}
              className="group inline-flex items-center gap-3 px-9 text-base font-semibold rounded-full cursor-pointer transition-all duration-300 bg-[#C41B2E] text-white hover:bg-[#E02035]"
              style={{ paddingTop: '15px', paddingBottom: '15px', boxShadow: '0 0 0 1px rgba(196,27,46,0.4), 0 8px 32px rgba(196,27,46,0.35)' }}
            >
              <Package className="w-5 h-5 flex-shrink-0" />
              Ver catálogo
              <ArrowDown className="w-4 h-4 opacity-60 transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-5 mt-7">
              <span className="flex items-center gap-2 text-white/35 text-xs font-medium">
                <Shield className="w-3.5 h-3.5 text-white/25" />
                Garantía certificada
              </span>
              <span className="w-px h-3.5 bg-white/10" />
              <span className="flex items-center gap-2 text-white/35 text-xs font-medium">
                <Zap className="w-3.5 h-3.5 text-white/25" />
                Respuesta en 24h
              </span>
              <span className="w-px h-3.5 bg-white/10 hidden sm:block" />
              <span className="hidden sm:flex items-center gap-2 text-white/35 text-xs font-medium">
                <Star className="w-3.5 h-3.5 text-white/25" />
                +5000 clientes
              </span>
            </div>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="hero-entrance hero-stats">
            <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-sm sm:max-w-xl mx-auto">
              {[
                { key: 'years',    display: '40+',    label: 'Años de marca',       icon: Award },
                { key: 'products', display: '3.000+', label: 'Tipos de productos',  icon: Package },
                { key: 'countries', display: '90+',   label: 'Países',              icon: Users },
              ].map(({ key, display, label, icon: Icon }) => (
                <div
                  key={key}
                  className="text-center px-3 py-4 sm:px-4 sm:py-5 backdrop-blur-md rounded-2xl border border-[rgba(196,27,46,0.12)]"
                  style={{ background: 'rgba(196,27,46,0.04)' }}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[rgba(196,27,46,0.1)] rounded-lg flex items-center justify-center mx-auto mb-2.5">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C41B2E]" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
                    {display}
                  </div>
                  <div className="text-[11px] sm:text-xs text-white/35 mt-1.5 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator — oculto en mobile chico */}
      <div className="hero-entrance hero-scroll absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block">
        <button
          onClick={scrollToCatalog}
          className="flex flex-col items-center gap-2 text-white/35 hover:text-[#C41B2E] transition-colors group"
        >
          <span className="text-xs font-medium tracking-widest uppercase">Explorar</span>
          <div className="w-6 h-9 rounded-full border border-white/15 flex items-start justify-center pt-1.5 group-hover:border-[rgba(196,27,46,0.4)] transition-colors">
            <ArrowDown className="w-2.5 h-2.5 animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
}

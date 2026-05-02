import { ArrowDown, MessageCircle, ChefHat, Package, Award, Users, Shield, Zap, Star } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { companyConfig, whatsappConfig } from '@/data/company';
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

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappConfig.phoneNumber}?text=${encodeURIComponent(whatsappConfig.defaultMessage)}`;
    window.open(url, '_blank');
  };

  const scrollToCatalog = () => {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div className="absolute inset-0 hero-kenburns">
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1920&h=1080&fit=crop"
            alt="Cocina industrial profesional"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/90" />
        {/* Subtle gold glow at top-left */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#C41B2E]/[0.06] rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#C41B2E]/[0.04] rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative z-10 container-custom py-20">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="hero-entrance hero-badge mb-7">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/[0.07] backdrop-blur-md rounded-full border border-white/[0.1]">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <ChefHat className="w-4 h-4 text-[#C41B2E]" />
              <span className="text-white font-medium text-sm tracking-tight">{companyConfig.name}</span>
              <span className="w-px h-3.5 bg-white/20" />
              <span className="text-white/50 text-xs font-medium">Disponible ahora</span>
            </div>
          </div>

          {/* Tagline */}
          <div className="hero-entrance hero-tag mb-5">
            <p className="text-[#C8BFB5]/70 text-base md:text-lg font-light tracking-wide">
              {companyConfig.tagline}
            </p>
          </div>

          {/* Title — Instrument Serif for editorial feel */}
          <div className="hero-entrance hero-title mb-7">
            <h1 className="text-5xl md:text-[5.5rem] lg:text-[6.5rem] font-serif font-normal text-white leading-[1.0] tracking-[-0.025em]">
              Equipamiento
              <br />
              <em className="not-italic" style={{ color: '#C41B2E' }}>gastronómico</em>
              <br />
              profesional
            </h1>
          </div>

          {/* Description */}
          <div className="hero-entrance hero-desc mb-10">
            <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto leading-relaxed font-light">
              Más de {companyConfig.stats.products} productos de las mejores marcas para restaurantes,
              hoteles y negocios gastronómicos.
            </p>
          </div>

          {/* CTAs */}
          <div className="hero-entrance hero-cta mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={scrollToCatalog}
                className="flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl w-full sm:w-auto cursor-pointer transition-all duration-200 border border-[rgba(196,27,46,0.3)] text-[#C41B2E] bg-[rgba(196,27,46,0.07)] hover:bg-[rgba(196,27,46,0.12)] hover:border-[rgba(196,27,46,0.5)]"
              >
                <Package className="w-4 h-4" />
                Ver catálogo
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl w-full sm:w-auto btn-whatsapp cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Cotizar ahora
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6">
              <span className="flex items-center gap-1.5 text-white/35 text-xs font-medium">
                <Shield className="w-3.5 h-3.5 text-white/25" />
                Garantía certificada
              </span>
              <span className="w-px h-3 bg-white/10 hidden sm:block" />
              <span className="flex items-center gap-1.5 text-white/35 text-xs font-medium">
                <Zap className="w-3.5 h-3.5 text-white/25" />
                Respuesta inmediata
              </span>
              <span className="w-px h-3 bg-white/10 hidden sm:block" />
              <span className="flex items-center gap-1.5 text-white/35 text-xs font-medium">
                <Star className="w-3.5 h-3.5 text-white/25" />
                +5000 clientes satisfechos
              </span>
            </div>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="hero-entrance hero-stats">
            <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-lg mx-auto">
              {[
                { key: 'products', suffix: '+', label: 'Productos', icon: Package },
                { key: 'years',    suffix: '+', label: 'Años',      icon: Award },
                { key: 'clients',  suffix: '+', label: 'Clientes',  icon: Users },
              ].map(({ key, suffix, label, icon: Icon }) => (
                <div
                  key={key}
                  className="text-center px-3 py-4 md:py-5 backdrop-blur-md rounded-2xl border border-[rgba(196,27,46,0.12)]"
                  style={{ background: 'rgba(196,27,46,0.04)' }}
                >
                  <div className="w-7 h-7 bg-[rgba(196,27,46,0.1)] rounded-lg flex items-center justify-center mx-auto mb-2.5">
                    <Icon className="w-3.5 h-3.5 text-[#C41B2E]" />
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">
                    <span data-count={key}>0</span>
                    <span className="text-[#C41B2E]">{suffix}</span>
                  </div>
                  <div className="text-[11px] text-white/35 mt-1.5 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-entrance hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2">
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

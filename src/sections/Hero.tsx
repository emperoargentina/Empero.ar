// =============================================================================
// Hero Section - Sección principal con CTA
// =============================================================================

import { ArrowDown, MessageCircle, ChefHat, Package, Award, Users, Shield, Zap, Star } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { companyConfig, whatsappConfig } from '@/data/company';

interface HeroProps {
  isReady?: boolean;
}

// Reveal animation component
function Reveal({ 
  children, 
  direction = 'up', 
  delay = 0, 
  className = '' 
}: { 
  children: React.ReactNode; 
  direction?: 'up' | 'down' | 'left' | 'right'; 
  delay?: number; 
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(80px)';
      case 'down': return 'translateY(-80px)';
      case 'left': return 'translateX(80px)';
      case 'right': return 'translateX(-80px)';
      default: return 'translateY(80px)';
    }
  };

  return (
    <div
      className={`transition-all duration-1000 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0)' : getTransform(),
      }}
    >
      {children}
    </div>
  );
}

export function Hero(_props: HeroProps) {
  const [counts, setCounts] = useState({ products: 0, years: 0, clients: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // Animate counters when stats are visible
  useEffect(() => {
    if (!statsRef.current || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const animateCounters = () => {
    const duration = 2000;
    const targets = { 
      products: companyConfig.stats.products, 
      years: companyConfig.stats.years, 
      clients: companyConfig.stats.clients 
    };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCounts({
        products: Math.floor(targets.products * easeOut),
        years: Math.floor(targets.years * easeOut),
        clients: Math.floor(targets.clients * easeOut),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(whatsappConfig.defaultMessage);
    const url = `https://wa.me/${whatsappConfig.phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const scrollToCatalog = () => {
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stats = [
    { value: counts.products, suffix: '+', label: 'Productos', icon: Package },
    { value: counts.years, suffix: '+', label: 'Años de experiencia', icon: Award },
    { value: counts.clients, suffix: '+', label: 'Clientes satisfechos', icon: Users },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Ken Burns effect - Chefs cooking */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 hero-kenburns">
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1920&h=1080&fit=crop"
            alt="Chefs cocinando en cocina industrial"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
        {/* Ambient color orbs */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#d32f2f]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#d32f2f]/15 rounded-full blur-[100px]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Company Name */}
          <Reveal direction="up" delay={100} className="mb-6">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 shadow-lg shadow-black/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <ChefHat className="w-5 h-5 text-[#ffcdd2]" />
              <span className="text-white font-semibold tracking-wide">{companyConfig.name}</span>
              <span className="text-white/40 text-sm">·</span>
              <span className="text-white/70 text-xs font-medium">Disponibles ahora</span>
            </div>
          </Reveal>

          {/* Tagline */}
          <Reveal direction="up" delay={200} className="mb-4">
            <p className="text-[#ffebee] text-lg md:text-xl font-medium">
              {companyConfig.tagline}
            </p>
          </Reveal>

          {/* Main Title */}
          <Reveal direction="up" delay={400} className="mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              Equipamiento
              <br />
              <span className="text-[#ffebee]">gastronómico</span>
              <br />
              profesional
            </h1>
          </Reveal>

          {/* Description */}
          <Reveal direction="up" delay={600} className="mb-10">
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              Más de {companyConfig.stats.products} productos de las mejores marcas para restaurantes, 
              hoteles y negocios gastronómicos. Calidad garantizada.
            </p>
          </Reveal>

          {/* CTA Buttons */}
          <Reveal direction="up" delay={800} className="mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={scrollToCatalog}
                className="btn-primary px-8 py-4 text-base w-full sm:w-auto"
              >
                <Package className="w-5 h-5 mr-2" />
                Ver catálogo
              </Button>
              <Button
                size="lg"
                onClick={handleWhatsAppClick}
                className="btn-whatsapp px-8 py-4 text-base w-full sm:w-auto"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Cotizar
              </Button>
            </div>
            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5">
              <span className="flex items-center gap-1.5 text-white/50 text-xs">
                <Shield className="w-3.5 h-3.5 text-white/40" />
                Garantía certificada
              </span>
              <span className="w-px h-3 bg-white/20 hidden sm:block" />
              <span className="flex items-center gap-1.5 text-white/50 text-xs">
                <Zap className="w-3.5 h-3.5 text-white/40" />
                Respuesta inmediata
              </span>
              <span className="w-px h-3 bg-white/20 hidden sm:block" />
              <span className="flex items-center gap-1.5 text-white/50 text-xs">
                <Star className="w-3.5 h-3.5 text-white/40" />
                +5000 clientes
              </span>
            </div>
          </Reveal>

          {/* Stats */}
          <div ref={statsRef}>
            <Reveal direction="up" delay={1000}>
              <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center p-4 md:p-6 bg-white/8 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg shadow-black/10"
                  >
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <stat.icon className="w-4 h-4 text-[#ffcdd2]" />
                    </div>
                    <div className="text-2xl md:text-4xl font-bold text-white tracking-tight">
                      {stat.value}
                      <span className="text-[#ef9a9a]">{stat.suffix}</span>
                    </div>
                    <div className="text-xs text-white/50 mt-1.5 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <Reveal direction="up" delay={1200} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={scrollToCatalog}
          className="flex flex-col items-center gap-2 text-white/50 hover:text-white/90 transition-colors group"
        >
          <span className="text-xs font-medium tracking-widest uppercase">Explorar</span>
          <div className="w-6 h-9 rounded-full border border-white/20 flex items-start justify-center pt-1.5 group-hover:border-white/40 transition-colors">
            <ArrowDown className="w-2.5 h-2.5 animate-bounce" />
          </div>
        </button>
      </Reveal>
    </section>
  );
}

import { Check, Award, Users, Shield, Zap } from 'lucide-react';
import { companyConfig } from '@/data/company';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { motion } from 'framer-motion';

const IMAGES = {
  main:    'https://images.unsplash.com/photo-1581349485608-9469926a8e5e?w=900&h=1100&fit=crop',
  topRight:'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=500&fit=crop',
  botRight:'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&h=500&fit=crop',
  gal1:    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=700&h=500&fit=crop',
  gal2:    'https://images.unsplash.com/photo-1544025162-d76694265947?w=700&h=500&fit=crop',
  gal3:    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=700&h=500&fit=crop',
};

const stats = [
  { value: `${companyConfig.stats.years}+`, label: 'Años de experiencia', icon: Award },
  { value: `${companyConfig.stats.products}+`, label: 'Productos', icon: Zap },
  { value: `${companyConfig.stats.clients}+`, label: 'Clientes', icon: Users },
  { value: '100%', label: 'Compromiso', icon: Shield },
];

export function Nosotros() {
  return (
    <section id="nosotros" className="py-20 lg:py-28 bg-white relative">
      <div className="absolute top-0 inset-x-0 h-px divider-gradient" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">

        {/* Header */}
        <div className="text-center mb-14">
          <AnimatedSection direction="up">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#fff5f5] text-[#d32f2f] text-[11px] font-bold uppercase tracking-[0.1em] rounded-full mb-5 border border-[#fecaca]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d32f2f] inline-block" />
              Nosotros
            </span>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.08}>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight">
              Quiénes <span className="text-[#d32f2f]">somos</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.14}>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-base leading-relaxed">
              Más de {companyConfig.stats.years} años equipando restaurantes, hoteles y negocios gastronómicos de Argentina.
            </p>
          </AnimatedSection>
        </div>

        {/* Main split: mosaic + story */}
        <div className="grid lg:grid-cols-2 gap-8 xl:gap-14 mb-12 items-start">

          {/* Image mosaic */}
          <AnimatedSection direction="left">
            <div className="grid grid-cols-2 gap-3 h-[480px] sm:h-[540px]">
              {/* Tall left */}
              <div className="row-span-2 overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={IMAGES.main}
                  alt="Cocina industrial Empero"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              {/* Top right */}
              <div className="overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={IMAGES.topRight}
                  alt="Horno industrial"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              {/* Bottom right */}
              <div className="overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={IMAGES.botRight}
                  alt="Equipamiento profesional"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            </div>
          </AnimatedSection>

          {/* Story */}
          <AnimatedSection direction="right" delay={0.1}>
            <div className="flex flex-col justify-center lg:pt-4">
              <p className="text-[10px] font-black text-[#d32f2f] uppercase tracking-[0.18em] mb-4">
                Nuestra historia
              </p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight leading-tight mb-6">
                Líderes en equipamiento gastronómico profesional
              </h3>
              <p className="text-gray-500 leading-relaxed mb-5 text-[15px]">
                {companyConfig.description}
              </p>
              <p className="text-gray-500 leading-relaxed mb-8 text-[15px]">
                {companyConfig.mission}
              </p>

              {/* Values grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {companyConfig.values.map((val) => (
                  <div key={val} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-[#d32f2f]" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium leading-snug">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Gallery strip */}
        <AnimatedSection direction="up" delay={0.1}>
          <div className="grid grid-cols-3 gap-3 h-52 sm:h-64 mb-14">
            {[IMAGES.gal1, IMAGES.gal2, IMAGES.gal3].map((src, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={src}
                  alt={`Imagen ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Stats dark banner */}
        <AnimatedSection direction="up">
          <div className="bg-gray-950 rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute -top-20 right-0 w-96 h-96 bg-[#d32f2f]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-0 w-72 h-72 bg-[#d32f2f]/7 rounded-full blur-3xl pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * i, duration: 0.4 }}
                >
                  <div className="w-10 h-10 bg-white/[0.07] border border-white/[0.1] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-4.5 h-4.5 text-red-400" />
                  </div>
                  <div className="text-4xl font-black text-white tracking-tight leading-none mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/45 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
}

import { Check, Award, Users, Shield, Zap } from 'lucide-react';
import { companyConfig } from '@/data/company';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { motion } from 'framer-motion';

// srcSet chico + grande por imagen — en mobile el mosaico muestra cada foto a
// ~45vw, no tiene sentido bajar el archivo de escritorio (900px) para eso.
function unsplashSrcSet(id: string, w: number, h: number) {
  const half = { w: Math.round(w / 2), h: Math.round(h / 2) };
  const base = `https://images.unsplash.com/${id}?fit=crop&auto=format&q=75`;
  return {
    src: `${base}&w=${w}&h=${h}`,
    srcSet: `${base}&w=${half.w}&h=${half.h} ${half.w}w, ${base}&w=${w}&h=${h} ${w}w`,
  };
}

const IMAGES = {
  main:     unsplashSrcSet('photo-1581349485608-9469926a8e5e', 900, 1100),
  topRight: unsplashSrcSet('photo-1556910103-1c02745aae4d', 600, 500),
  botRight: unsplashSrcSet('photo-1565538810643-b5bdb714032a', 600, 500),
  gal1:     unsplashSrcSet('photo-1577219491135-ce391730fb2c', 700, 500),
  gal2:     unsplashSrcSet('photo-1544025162-d76694265947', 700, 500),
  gal3:     unsplashSrcSet('photo-1590794056226-79ef3a8147e1', 700, 500),
};

const stats = [
  { value: '1983', label: 'Año de fundación', icon: Award },
  { value: '3.000+', label: 'Tipos de productos', icon: Zap },
  { value: '90+', label: 'Países de exportación', icon: Users },
  { value: '60K m²', label: 'Planta de producción', icon: Shield },
];

export function Nosotros() {
  return (
    <section id="nosotros" className="py-20 lg:py-28 bg-white relative">
      <div className="absolute top-0 inset-x-0 h-px divider-gradient" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">

        {/* Header */}
        <div className="text-center mb-14">
          <AnimatedSection direction="up">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C41B2E]/40" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C41B2E]">
                Nosotros
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C41B2E]/40" />
            </div>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.08}>
            <h2 className="text-4xl md:text-5xl font-serif font-[560] text-[#1A1613]">
              Quiénes <em className="not-italic text-[#C41B2E]">somos</em>
            </h2>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.14}>
            <p className="text-[#7B7064] mt-4 max-w-2xl mx-auto text-base leading-relaxed">
              Somos distribuidores oficiales de <strong className="text-[#1A1613]">Empero</strong> en Argentina &mdash;
              una de las marcas líder en equipamiento gastronómico industrial a nivel mundial, con más de 40 años de historia y presencia en más de 90 países.
            </p>
          </AnimatedSection>
        </div>

        {/* Split: mosaic + story */}
        <div className="grid lg:grid-cols-2 gap-8 xl:gap-14 mb-12 items-start">

          {/* Mosaic */}
          <AnimatedSection direction="left">
            <div className="grid grid-cols-2 gap-3 h-[480px] sm:h-[540px]">
              <div className="row-span-2 overflow-hidden rounded-2xl bg-[#F4F0E8]">
                <img src={IMAGES.main.src} srcSet={IMAGES.main.srcSet} sizes="(min-width: 1024px) 380px, 45vw" alt="Cocina industrial Empero" width={900} height={1100} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
              </div>
              <div className="overflow-hidden rounded-2xl bg-[#F4F0E8]">
                <img src={IMAGES.topRight.src} srcSet={IMAGES.topRight.srcSet} sizes="(min-width: 1024px) 280px, 45vw" alt="Horno industrial" width={600} height={500} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
              </div>
              <div className="overflow-hidden rounded-2xl bg-[#F4F0E8]">
                <img src={IMAGES.botRight.src} srcSet={IMAGES.botRight.srcSet} sizes="(min-width: 1024px) 280px, 45vw" alt="Equipamiento profesional" width={600} height={500} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
              </div>
            </div>
          </AnimatedSection>

          {/* Story */}
          <AnimatedSection direction="right" delay={0.1}>
            <div className="flex flex-col justify-center lg:pt-4">
              <p className="text-[11px] font-semibold text-[#C41B2E] uppercase tracking-[0.12em] mb-4">
                Historia de la marca
              </p>
              <h3 className="text-2xl md:text-3xl font-serif font-[560] text-[#1A1613] leading-tight mb-6">
                40 años fabricando equipamiento gastronómico de clase mundial
              </h3>
              <p className="text-[#7B7064] leading-relaxed mb-5 text-[15px] text-justify">
                Empero nació en <strong className="text-[#4A4540]">1983</strong> en Turquía bajo el nombre <em>Ersöz Mutfak Makineleri</em>, fabricando equipos de preparación de alimentos. En <strong className="text-[#4A4540]">2005</strong>, unificó cinco empresas productoras bajo el nombre <strong className="text-[#4A4540]">Empero Group</strong>, consolidando una planta de producción de más de <strong className="text-[#4A4540]">60.000 m²</strong> en Konya, Turquía.
              </p>
              <p className="text-[#7B7064] leading-relaxed mb-8 text-[15px] text-justify">
                Hoy Empero fabrica más de <strong className="text-[#4A4540]">3.000 tipos de productos</strong> &mdash; desde hornos y cocinas hasta lavavajillas, equipos de refrigeración y módulos de cafetería &mdash; y exporta el 60% de su producción a más de <strong className="text-[#4A4540]">90 países</strong>. <strong className="text-[#1A1613]">Empero Argentina</strong> es el distribuidor oficial autorizado de la marca en el país.
              </p>

              {/* Values */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {companyConfig.values.map((val) => (
                  <div key={val} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 bg-[rgba(196,27,46,0.1)] rounded-full flex items-center justify-center flex-shrink-0 border border-[rgba(196,27,46,0.25)]">
                      <Check className="w-2.5 h-2.5 text-[#C41B2E]" />
                    </div>
                    <span className="text-sm text-[#4A4540] font-medium leading-snug">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Gallery strip */}
        <AnimatedSection direction="up" delay={0.1}>
          <div className="grid grid-cols-3 gap-3 h-52 sm:h-64 mb-14">
            {[IMAGES.gal1, IMAGES.gal2, IMAGES.gal3].map((img, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-[#F4F0E8]">
                <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 350px, 30vw" alt={`Imagen ${i + 1}`} width={700} height={500} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Stats banner — brand red block */}
        <AnimatedSection direction="up">
          <div
            className="rounded-3xl p-10 md:p-14 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #D32638 0%, #C41B2E 45%, #97121F 100%)',
              boxShadow: '0 20px 60px rgba(196,27,46,0.25), 0 1px 0 rgba(255,255,255,0.08) inset',
            }}
          >
            <div className="absolute -top-24 -left-10 w-80 h-80 bg-white/[0.06] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 right-0 w-96 h-96 bg-black/[0.12] rounded-full blur-3xl pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
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
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)' }}
                  >
                    <stat.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="text-4xl font-serif font-[560] text-white tracking-tight leading-none mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/90 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
}

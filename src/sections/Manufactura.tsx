import { Check } from 'lucide-react';
import { companyConfig } from '@/data/company';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { SectionHeader } from '@/components/SectionHeader';

// Fotos oficiales de Empero (planta de Konya y sede), optimizadas en WebP en
// dos tamaños: en mobile el mosaico muestra cada foto a ~45vw, no hace falta
// bajar la versión de escritorio para eso.
function localSrcSet(name: string, w: number) {
  const base = `/images/nosotros/${name}`;
  return {
    src: `${base}.webp`,
    srcSet: `${base}-sm.webp ${Math.round(w / 2)}w, ${base}.webp ${w}w`,
  };
}

const IMAGES = {
  main:     localSrcSet('produccion-hornos', 900),
  topRight: localSrcSet('equipo-empero', 600),
  botRight: localSrcSet('linea-heladeras', 600),
};

const GALLERY = [
  { ...localSrcSet('plegado-chapa', 700), alt: 'Operarios en las plegadoras de chapa de la planta de Empero' },
  { ...localSrcSet('corte-laser', 700), alt: 'Corte láser de chapa de acero inoxidable' },
  { ...localSrcSet('deposito', 700), alt: 'Depósito de producto terminado de Empero' },
];

const stats = [
  { value: '1983', unit: '', label: 'Año de fundación, en Turquía' },
  { value: '3.000', unit: '+', label: 'Tipos de productos' },
  { value: '90', unit: '+', label: 'Países de exportación' },
  { value: '60.000', unit: 'm²', label: 'Planta de producción en Konya' },
];

export function Nosotros() {
  return (
    <section id="nosotros" aria-labelledby="nosotros-title" className="py-16 lg:py-24 bg-white relative">
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px divider-gradient" />

      <div className="container-custom">
        <SectionHeader
          eyebrow="Nosotros"
          titleId="nosotros-title"
          title="Quiénes"
          accent="somos"
          description={
            <p>
              Somos distribuidores oficiales de <strong className="font-semibold text-ink-900">Empero</strong> en Argentina &mdash;
              una de las marcas líder en equipamiento gastronómico industrial a nivel mundial, con más de 40 años de historia y presencia en más de 90 países.
            </p>
          }
          className="mb-12 lg:mb-14"
        />

        {/* Mosaico + historia */}
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 mb-14 items-center">

          <AnimatedSection direction="left">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 h-[25rem] sm:h-[28.75rem]">
              <figure className="row-span-2 photo-frame">
                <img src={IMAGES.main.src} srcSet={IMAGES.main.srcSet} sizes="(min-width: 1024px) 380px, 45vw" alt="Operario armando hornos en la línea de producción de Empero, en Konya" width={900} height={1100} className="zoom-on-hover w-full h-full object-cover" loading="lazy" decoding="async" />
              </figure>
              <figure className="photo-frame">
                <img src={IMAGES.topRight.src} srcSet={IMAGES.topRight.srcSet} sizes="(min-width: 1024px) 280px, 45vw" alt="El equipo de Empero frente a la sede de la empresa" width={600} height={500} className="zoom-on-hover w-full h-full object-cover" loading="lazy" decoding="async" />
              </figure>
              <figure className="photo-frame">
                <img src={IMAGES.botRight.src} srcSet={IMAGES.botRight.srcSet} sizes="(min-width: 1024px) 280px, 45vw" alt="Heladeras industriales en la línea de producción de Empero" width={600} height={500} className="zoom-on-hover w-full h-full object-cover" loading="lazy" decoding="async" />
              </figure>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.1}>
            <div className="flex flex-col justify-center">
              <p className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold text-brand uppercase tracking-[0.14em] mb-4">
                <span aria-hidden="true" className="h-px w-6 bg-brand" />
                Historia de la marca
              </p>
              <h3 className="font-display font-[560] text-[1.5rem] md:text-[1.75rem] text-ink-900 leading-[1.18] mb-5">
                40 años fabricando equipamiento gastronómico de <em className="not-italic text-brand">clase mundial</em>
              </h3>
              <div className="space-y-5 mb-8 max-w-[62ch] text-[0.9375rem] leading-relaxed text-ink-600 text-pretty">
                <p>
                  Empero nació en <strong className="font-semibold text-ink-800">1983</strong> en Turquía bajo el nombre <em>Ersöz Mutfak Makineleri</em>, fabricando equipos de preparación de alimentos. En <strong className="font-semibold text-ink-800">2005</strong>, unificó cinco empresas productoras bajo el nombre <strong className="font-semibold text-ink-800">Empero Group</strong>, consolidando una planta de producción de más de <strong className="font-semibold text-ink-800">60.000 m²</strong> en Konya, Turquía.
                </p>
                <p>
                  Hoy Empero fabrica más de <strong className="font-semibold text-ink-800">3.000 tipos de productos</strong> &mdash; desde hornos y cocinas hasta lavavajillas, equipos de refrigeración y módulos de cafetería &mdash; y exporta el 60% de su producción a más de <strong className="font-semibold text-ink-800">90 países</strong>. <strong className="font-semibold text-ink-900">Empero Argentina</strong> es el distribuidor oficial autorizado de la marca en el país.
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-6 border-t border-ink-150">
                {companyConfig.values.map((val) => (
                  <li key={val} className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-0.5 w-5 h-5 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0 border border-brand-200">
                      <Check className="w-2.5 h-2.5 text-brand" strokeWidth={3} />
                    </span>
                    <span className="text-[0.875rem] text-ink-700 font-medium leading-snug">{val}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>

        {/* Galería */}
        <AnimatedSection direction="up" delay={0.1}>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 h-40 sm:h-56 mb-12 lg:mb-14">
            {GALLERY.map((img) => (
              <figure key={img.src} className="photo-frame">
                <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 350px, 30vw" alt={img.alt} width={700} height={500} className="zoom-on-hover w-full h-full object-cover" loading="lazy" decoding="async" />
              </figure>
            ))}
          </div>
        </AnimatedSection>

        {/* Cifras de la marca: como una ficha técnica — filete fuerte arriba,
            separadores finos, números en serif y la unidad en rojo. */}
        <AnimatedSection direction="up">
          <dl className="brand-figures">
            {stats.map((stat) => (
              <div key={stat.label} className="brand-figures__item">
                <dt className="brand-figures__label">{stat.label}</dt>
                <dd className="brand-figures__value">
                  {stat.value}
                  {stat.unit && <span className="brand-figures__unit">{stat.unit}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </AnimatedSection>

      </div>
    </section>
  );
}

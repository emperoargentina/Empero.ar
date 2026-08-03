import { Truck, Wrench, MapPin, ArrowRight } from 'lucide-react';
import { whatsappConfig } from '@/data/company';
import { AnimatedSection } from '@/components/animations/AnimatedSection';

interface SpecRow {
  zone: string;
  value: string;
  included: boolean;
}

interface InfoCard {
  key: string;
  icon: typeof Truck;
  title: string;
  description: string;
  rows: SpecRow[];
  cta: { label: string; message: string } | null;
}

const cards: InfoCard[] = [
  {
    key: 'envios',
    icon: Truck,
    title: 'Envíos',
    description: 'Despachamos desde nuestro depósito en CABA a cualquier punto del país.',
    rows: [
      { zone: 'CABA', value: 'Sin cargo', included: true },
      { zone: 'Interior del país', value: 'A cargo del comprador', included: false },
    ],
    cta: {
      label: 'Consultar por WhatsApp',
      message: 'Hola, quería consultar por el envío de un producto fuera de CABA.',
    },
  },
  {
    key: 'postventa',
    icon: Wrench,
    title: 'Servicio postventa',
    description: 'Respaldamos cada compra con soporte técnico propio y especializado en la marca.',
    rows: [
      { zone: 'CABA', value: 'Sin cargo', included: true },
      { zone: 'Interior del país', value: 'Sin cobertura', included: false },
    ],
    cta: null,
  },
];

export function EnviosPostventa() {
  const handleWhatsAppClick = (message: string) => {
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="envios-postventa" className="py-20 lg:py-28 bg-[#FAFAF8] relative">
      <div className="absolute top-0 inset-x-0 h-px divider-gradient" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">

        {/* Header */}
        <div className="text-center mb-14">
          <AnimatedSection direction="up">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C41B2E]/40" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C41B2E]">
                Envíos &amp; Postventa
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C41B2E]/40" />
            </div>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.08}>
            <h2 className="text-4xl md:text-5xl font-serif font-[560] text-[#1A1613]">
              Te acompañamos <em className="not-italic text-[#C41B2E]">después de la compra</em>
            </h2>
          </AnimatedSection>
          <AnimatedSection direction="up" delay={0.14}>
            <p className="text-[#7B7064] mt-4 max-w-2xl mx-auto text-base leading-relaxed">
              Enviamos a <strong className="text-[#1A1613]">todo el país</strong> y brindamos servicio técnico
              propio en Buenos Aires.
            </p>
          </AnimatedSection>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-2 gap-6 xl:gap-8 items-stretch max-w-4xl mx-auto">
          {cards.map((card, i) => (
            <AnimatedSection key={card.key} direction="up" delay={0.08 * i} className="h-full">
              <div className="h-full flex flex-col rounded-2xl bg-white border border-[#EBE5DC] shadow-sm">

                <div className="p-7 sm:p-8 pb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: 'linear-gradient(135deg, #C41B2E 0%, #9E1424 100%)',
                      boxShadow: '0 6px 18px rgba(196,27,46,0.28)',
                    }}
                  >
                    <card.icon className="w-5.5 h-5.5 text-white" />
                  </div>
                  <h3 className="font-serif font-[560] text-2xl text-[#1A1613] mb-2">
                    {card.title}
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-[#7B7064]">
                    {card.description}
                  </p>
                </div>

                <div className="px-7 sm:px-8">
                  <div className="rounded-2xl border border-[#EBE5DC] overflow-hidden bg-[#FBF9F5] divide-y divide-[#F0EAE2]">
                    {card.rows.map((row) => (
                      <div key={row.zone} className="flex items-center justify-between gap-3 px-5 py-3.5">
                        <span className="flex items-center gap-2.5 min-w-0">
                          <MapPin
                            className="w-[15px] h-[15px] flex-shrink-0"
                            style={{ color: row.included ? '#C41B2E' : '#B0A498' }}
                          />
                          <span className="text-[13px] text-[#6B6159] font-medium truncate">{row.zone}</span>
                        </span>
                        <span
                          className="font-semibold text-right ml-3 flex-shrink-0 text-[13.5px]"
                          style={{ color: row.included ? '#1A1613' : '#9A8E82' }}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-7 sm:p-8 pt-5 mt-auto">
                  {card.cta ? (
                    <button
                      type="button"
                      onClick={() => handleWhatsAppClick(card.cta!.message)}
                      className="group w-full inline-flex items-center justify-center gap-2 h-11 rounded-full text-[13px] font-semibold text-white cursor-pointer transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, #C41B2E 0%, #9e1424 100%)',
                        boxShadow: '0 4px 16px rgba(196,27,46,0.25)',
                      }}
                    >
                      {card.cta.label}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <p className="text-[12.5px] text-[#B0A498] text-center">
                      Estamos ampliando la cobertura a otras provincias.
                    </p>
                  )}
                </div>

              </div>
            </AnimatedSection>
          ))}
        </div>

      </div>
    </section>
  );
}

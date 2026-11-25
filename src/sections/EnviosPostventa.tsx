import type { ComponentType } from 'react';
import { MapPin } from 'lucide-react';
import { getWhatsAppURL } from '@/lib/whatsapp';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { SectionHeader } from '@/components/SectionHeader';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { ShippingTrackerDemo } from '@/components/illustrations/ShippingTrackerDemo';
import { SupportChatDemo } from '@/components/illustrations/SupportChatDemo';

interface SpecRow {
  zone: string;
  value: string;
  included: boolean;
}

interface InfoCard {
  key: string;
  /** Ilustración animada (Stageshow) que cuenta el servicio */
  Demo: ComponentType;
  title: string;
  description: string;
  rows: SpecRow[];
  cta: { label: string; message: string } | null;
  note?: string;
}

const cards: InfoCard[] = [
  {
    key: 'envios',
    Demo: ShippingTrackerDemo,
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
    Demo: SupportChatDemo,
    title: 'Servicio postventa',
    description: 'Respaldamos cada compra con soporte técnico propio y especializado en la marca.',
    rows: [
      { zone: 'CABA', value: 'Sin cargo', included: true },
      { zone: 'Interior del país', value: 'Sin cobertura', included: false },
    ],
    cta: null,
    note: 'Estamos ampliando la cobertura a otras provincias.',
  },
];

export function EnviosPostventa() {
  return (
    <section id="envios-postventa" aria-labelledby="envios-title" className="py-16 lg:py-24 bg-[var(--page-bg)] relative">
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px divider-gradient" />

      <div className="container-custom">
        <SectionHeader
          eyebrow="Envíos & Postventa"
          titleId="envios-title"
          title="Te acompañamos"
          accent="después de la compra"
          description={
            <p>
              Enviamos a <strong className="font-semibold text-ink-900">todo el país</strong> y brindamos servicio
              técnico propio en Buenos Aires.
            </p>
          }
          className="mb-12"
        />

        <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 gap-5 sm:gap-6 xl:gap-8 items-stretch max-w-5xl mx-auto">
          {cards.map((card, i) => (
            <AnimatedSection key={card.key} direction="up" delay={0.08 * i} className="h-full">
              <article className="info-card">
                <div className="info-card__media">
                  <card.Demo />
                </div>
                <div className="p-5 sm:p-7 pb-5 sm:pb-6">
                  <h3 className="font-display font-[560] text-[1.35rem] text-ink-900 mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-[0.9375rem] leading-relaxed text-ink-600 text-pretty">
                    {card.description}
                  </p>
                </div>

                <div className="px-5 sm:px-7">
                  <dl className="rounded-2xl border border-ink-200 overflow-hidden bg-ink-50 divide-y divide-ink-150">
                    {card.rows.map((row) => (
                      <div key={row.zone} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5">
                        <dt className="flex items-center gap-2.5 min-w-0">
                          <MapPin
                            aria-hidden="true"
                            className={`w-4 h-4 flex-shrink-0 ${row.included ? 'text-brand' : 'text-ink-400'}`}
                          />
                          <span className="text-[0.8438rem] sm:text-[0.875rem] leading-snug text-ink-600 font-medium">{row.zone}</span>
                        </dt>
                        <dd className={`flex items-center justify-end gap-2 max-w-[55%] font-semibold text-right leading-snug text-[0.8438rem] sm:text-[0.875rem] ${row.included ? 'text-ink-900' : 'text-ink-500'}`}>
                          {row.included && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="p-5 sm:p-7 pt-5 sm:pt-6 mt-auto">
                  {card.cta ? (
                    <a
                      href={getWhatsAppURL(card.cta.message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full whitespace-normal"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      {card.cta.label}
                    </a>
                  ) : (
                    <p className="text-[0.8438rem] text-ink-500 text-center">{card.note}</p>
                  )}
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

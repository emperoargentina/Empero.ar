import { useState } from 'react';
import { Phone, Mail, ArrowRight, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { companyConfig, whatsappConfig } from '@/data/company';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { motion, AnimatePresence } from 'framer-motion';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// ── Input ────────────────────────────────────────────────────────────────────

function InputField({
  id, name, label, type = 'text', required, value, onChange, placeholder,
}: {
  id: string; name: string; label: string; type?: string;
  required?: boolean; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-200"
        style={{ color: focused ? '#C41B2E' : '#9A8E82' }}
      >
        {label}{required && <span className="ml-1 text-[#C41B2E]/60">*</span>}
      </label>
      <input
        id={id} name={name} type={type} required={required}
        value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 text-[13.5px] focus:outline-none transition-all duration-200"
        style={{
          height: '48px',
          color: '#1A1613',
          background: focused ? '#fff' : '#F9F6F2',
          border: `1px solid ${focused ? 'rgba(196,27,46,0.45)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: '10px',
          boxShadow: focused
            ? '0 0 0 3px rgba(196,27,46,0.08)'
            : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      />
    </div>
  );
}

function TextareaField({
  id, name, label, required, value, onChange, placeholder, rows = 5,
}: {
  id: string; name: string; label: string; required?: boolean;
  value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-200"
        style={{ color: focused ? '#C41B2E' : '#9A8E82' }}
      >
        {label}{required && <span className="ml-1 text-[#C41B2E]/60">*</span>}
      </label>
      <textarea
        id={id} name={name} required={required} rows={rows}
        value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 py-3.5 text-[13.5px] focus:outline-none transition-all duration-200 resize-none leading-relaxed"
        style={{
          color: '#1A1613',
          background: focused ? '#fff' : '#F9F6F2',
          border: `1px solid ${focused ? 'rgba(196,27,46,0.45)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: '10px',
          boxShadow: focused
            ? '0 0 0 3px rgba(196,27,46,0.08)'
            : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      />
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    }, 4000);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(whatsappConfig.defaultMessage);
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${message}`, '_blank');
  };

  const channels = [
    {
      key: 'phone', label: 'Teléfono', value: companyConfig.contact.phone,
      sub: 'Lun – Vie · 9 a 18 hs', icon: <Phone className="w-3.5 h-3.5" />,
      href: `tel:${companyConfig.contact.phone}`, color: '#C41B2E',
    },
    {
      key: 'email', label: 'Email', value: companyConfig.contact.email,
      sub: 'Respuesta en < 24 hs', icon: <Mail className="w-3.5 h-3.5" />,
      href: `mailto:${companyConfig.contact.email}`, color: '#C41B2E',
    },
    {
      key: 'whatsapp', label: 'WhatsApp', value: 'Escribinos ahora',
      sub: 'Respuesta inmediata', icon: <WhatsAppIcon className="w-3.5 h-3.5" />,
      href: null as string | null, color: '#25D366',
    },
  ];

  return (
    <section id="contacto" className="relative overflow-hidden" style={{ background: '#F4F0E8' }}>
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-24 lg:py-36">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-14 lg:gap-24 items-start">

          {/* ── LEFT ── */}
          <AnimatedSection direction="up">
            <div className="lg:sticky lg:top-28">

              <div className="flex items-center gap-3 mb-10">
                <div className="h-px w-8 bg-[#C41B2E]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C41B2E]">
                  Contacto
                </span>
              </div>

              <h2
                className="font-serif font-[560] leading-none mb-6"
                style={{ fontSize: 'clamp(3.2rem, 6.5vw, 5.5rem)', letterSpacing: '-0.02em', color: '#1A1613' }}
              >
                Hablemos.
              </h2>

              <p className="text-base leading-relaxed mb-14 max-w-[340px]" style={{ color: '#7A6E65' }}>
                Consultas sobre equipamiento, precios y disponibilidad. Respondemos en menos de 24&nbsp;hs.
              </p>

              {/* Channels */}
              <ul>
                {channels.map((ch, i) => {
                  const content = (
                    <>
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                        style={{ color: ch.color, background: '#EBE5DA', border: '1px solid rgba(0,0,0,0.07)' }}
                      >
                        {ch.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] mb-0.5" style={{ color: '#B0A498' }}>
                          {ch.label}
                        </p>
                        <p className="text-sm font-medium truncate transition-colors duration-200" style={{ color: '#1A1613' }}>
                          {ch.value}
                        </p>
                        <p className="text-[11.5px] mt-0.5" style={{ color: '#B0A498' }}>
                          {ch.sub}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        style={{ color: ch.color, opacity: 0.6 }}
                      />
                    </>
                  );

                  return (
                    <li
                      key={ch.key}
                      className={`border-t ${i === channels.length - 1 ? 'border-b' : ''}`}
                      style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                    >
                      {ch.href ? (
                        <a href={ch.href} className="group flex items-center gap-4 py-[18px] cursor-pointer">
                          {content}
                        </a>
                      ) : (
                        <button type="button" onClick={handleWhatsAppClick} className="group w-full text-left flex items-center gap-4 py-[18px] cursor-pointer">
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </AnimatedSection>

          {/* ── RIGHT: Form card ── */}
          <AnimatedSection direction="up" delay={0.1}>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
              }}
            >
              {/* Red top accent */}
              <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #C41B2E 0%, rgba(196,27,46,0.2) 70%, transparent 100%)' }} />

              {/* Header */}
              <div className="px-8 sm:px-10 py-7" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C41B2E] mb-2">
                  Consulta
                </p>
                <h3 className="font-serif font-[560]" style={{ fontSize: '1.3rem', color: '#1A1613' }}>
                  Envianos tu mensaje
                </h3>
              </div>

              {/* Body */}
              <div className="px-8 sm:px-10 py-9">
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      key="success"
                      className="flex flex-col items-center justify-center py-16 text-center"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                        style={{ background: 'rgba(196,27,46,0.06)', border: '1px solid rgba(196,27,46,0.15)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 16, delay: 0.1 }}
                      >
                        <CheckCircle2 className="w-7 h-7 text-[#C41B2E]" />
                      </motion.div>
                      <h4 className="font-serif font-[560] mb-2" style={{ fontSize: '1.2rem', color: '#1A1613' }}>
                        Mensaje enviado
                      </h4>
                      <p className="text-sm" style={{ color: '#9A8E82' }}>
                        Te responderemos en menos de 24&nbsp;hs.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <InputField
                        id="name" name="name" label="Nombre" required
                        value={formData.name} onChange={handleChange} placeholder="Juan Pérez"
                      />

                      <div className="grid sm:grid-cols-2 gap-5">
                        <InputField
                          id="email" name="email" label="Email" type="email" required
                          value={formData.email} onChange={handleChange} placeholder="juan@empresa.com"
                        />
                        <InputField
                          id="phone" name="phone" label="Teléfono" type="tel"
                          value={formData.phone} onChange={handleChange} placeholder="+54 11 1234-5678"
                        />
                      </div>

                      <InputField
                        id="company" name="company" label="Empresa"
                        value={formData.company} onChange={handleChange} placeholder="Nombre de tu empresa (opcional)"
                      />

                      <TextareaField
                        id="message" name="message" label="Mensaje" required rows={5}
                        value={formData.message} onChange={handleChange}
                        placeholder="Contanos qué equipamiento te interesa, cantidad, o cualquier consulta…"
                      />

                      <div className="pt-1">
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          className="relative w-full h-[52px] rounded-xl text-[13px] font-semibold text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2.5"
                          style={{
                            background: 'linear-gradient(135deg, #C41B2E 0%, #9e1424 100%)',
                            boxShadow: '0 4px 20px rgba(196,27,46,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                          }}
                          whileHover={!isSubmitting ? {
                            boxShadow: '0 8px 32px rgba(196,27,46,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
                          } : {}}
                          whileTap={!isSubmitting ? { scale: 0.99 } : {}}
                          transition={{ duration: 0.15 }}
                        >
                          {/* Shimmer */}
                          <motion.div
                            className="absolute inset-y-0 left-0 w-1/2 pointer-events-none"
                            style={{
                              background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.14) 50%, transparent 100%)',
                            }}
                            animate={{ x: ['-100%', '250%'] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                          />

                          {isSubmitting ? (
                            <>
                              <motion.span
                                className="block w-4 h-4 border-2 rounded-full"
                                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                              />
                              Enviando…
                            </>
                          ) : (
                            <>
                              Enviar mensaje
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </motion.button>

                        <p className="text-center mt-4 text-[11.5px]" style={{ color: '#B0A498' }}>
                          También podés escribirnos por{' '}
                          <button
                            type="button"
                            onClick={handleWhatsAppClick}
                            className="underline underline-offset-2 cursor-pointer transition-colors duration-150 hover:text-[#1A1613]"
                            style={{ color: '#9A8E82' }}
                          >
                            WhatsApp
                          </button>
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}

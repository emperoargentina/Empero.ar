import { useState } from 'react';
import { Phone, Mail, Send, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';
import { companyConfig, whatsappConfig } from '@/data/company';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { motion } from 'framer-motion';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const inputBase =
  'w-full bg-white border border-[#E2DBD3] rounded-xl px-4 py-3.5 text-sm text-[#1A1613] placeholder:text-[#C8BFC0] focus:outline-none focus:border-[#C41B2E] focus:ring-2 focus:ring-[#C41B2E]/10 transition-all duration-200';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '', company: '', email: '', phone: '', message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', company: '', email: '', phone: '', message: '' });
    }, 4000);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(whatsappConfig.defaultMessage);
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <section id="contacto" className="py-16 lg:py-28 bg-[#F7F5F2] relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px divider-gradient" />

      {/* Dot texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #C41B2E 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 relative">

        {/* Section header */}
        <AnimatedSection direction="up" className="text-center mb-10 lg:mb-14">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C41B2E]/40" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C41B2E]">
              Contacto
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C41B2E]/40" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-normal text-[#1A1613]">
            Contactanos
          </h2>
          <p className="text-[#9E9080] mt-3 text-[15px] max-w-md mx-auto leading-relaxed">
            Completá el formulario o escribinos directamente.&nbsp;Respondemos en menos de 24&nbsp;horas.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-[5fr_7fr] gap-6 lg:gap-14 items-start">

          {/* ── Left: info + WhatsApp ─────────────────────────── */}
          <AnimatedSection direction="left">
            <div className="lg:sticky lg:top-28 space-y-3">

              {/* Intro text */}
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C41B2E] mb-1">
                  Canales de contacto
                </p>
                <p className="text-sm text-[#6B6159] leading-relaxed">
                  Elegí el medio que prefieras. Estamos disponibles para responder tus consultas sobre equipamiento, precios y disponibilidad.
                </p>
              </div>

              {/* Phone card */}
              <a
                href={`tel:${companyConfig.contact.phone}`}
                className="flex items-center gap-4 p-4 bg-white border border-[#EBE5DC] rounded-2xl hover:border-[rgba(196,27,46,0.3)] hover:shadow-sm transition-all duration-200 group"
              >
                <div className="w-11 h-11 bg-[rgba(196,27,46,0.06)] border border-[rgba(196,27,46,0.12)] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[rgba(196,27,46,0.1)] transition-colors">
                  <Phone className="w-4.5 h-4.5 text-[#C41B2E]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C0B5A8] mb-0.5">Teléfono</p>
                  <p className="text-sm font-semibold text-[#1A1613] group-hover:text-[#C41B2E] transition-colors truncate">
                    {companyConfig.contact.phone}
                  </p>
                  <p className="text-[11px] text-[#9E9080] mt-0.5">Lun–Vie 9 a 18&thinsp;hs</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C0B5A8] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* Email card */}
              <a
                href={`mailto:${companyConfig.contact.email}`}
                className="flex items-center gap-4 p-4 bg-white border border-[#EBE5DC] rounded-2xl hover:border-[rgba(196,27,46,0.3)] hover:shadow-sm transition-all duration-200 group"
              >
                <div className="w-11 h-11 bg-[rgba(196,27,46,0.06)] border border-[rgba(196,27,46,0.12)] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[rgba(196,27,46,0.1)] transition-colors">
                  <Mail className="w-4.5 h-4.5 text-[#C41B2E]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C0B5A8] mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-[#1A1613] group-hover:text-[#C41B2E] transition-colors truncate">
                    {companyConfig.contact.email}
                  </p>
                  <p className="text-[11px] text-[#9E9080] mt-0.5">Respondemos en &lt;&thinsp;24&thinsp;hs</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C0B5A8] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* ── WhatsApp — gradiente verde + shine, mismo alto que cards ── */}
              <motion.button
                onClick={handleWhatsAppClick}
                className="relative w-full overflow-hidden flex items-center gap-4 p-4 rounded-2xl cursor-pointer text-white text-left"
                style={{
                  background: 'linear-gradient(135deg, #25d366 0%, #128C7E 100%)',
                  boxShadow: '0 4px 20px rgba(37,211,102,0.28)',
                }}
                whileHover={{ scale: 1.015, boxShadow: '0 8px 32px rgba(37,211,102,0.40)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {/* Shine sweep */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none"
                  initial={{ x: '-120%' }}
                  animate={{ x: '220%' }}
                  transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.85, ease: 'easeInOut' }}
                />

                {/* Icon */}
                <div className="relative z-10 w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/25">
                  <WhatsAppIcon />
                </div>

                {/* Text */}
                <div className="relative z-10 min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/60 mb-0.5">WhatsApp</p>
                  <p className="text-sm font-semibold text-white truncate">
                    Escribinos por WhatsApp
                  </p>
                  <p className="text-[11px] text-white/65 mt-0.5">{companyConfig.contact.phone}</p>
                </div>

                {/* Arrow */}
                <ArrowRight className="relative z-10 w-4 h-4 text-white/60 flex-shrink-0" />
              </motion.button>

            </div>
          </AnimatedSection>

          {/* ── Right: form ──────────────────────────────────── */}
          <AnimatedSection direction="right" delay={0.1}>
            <div className="bg-white border border-[#EBE5DC] rounded-3xl p-5 sm:p-8 lg:p-10 shadow-sm">
              {isSubmitted ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <motion.div
                    className="w-20 h-20 bg-[rgba(196,27,46,0.08)] border border-[rgba(196,27,46,0.2)] rounded-full flex items-center justify-center mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                  >
                    <CheckCircle2 className="w-9 h-9 text-[#C41B2E]" />
                  </motion.div>
                  <h3 className="text-2xl font-serif font-normal text-[#1A1613] mb-2">¡Mensaje enviado!</h3>
                  <p className="text-[#9E9080] text-sm">Gracias por contactarnos. Te responderemos pronto.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9E9080] mb-1.5">
                        Nombre *
                      </label>
                      <input id="name" name="name" type="text" required
                        value={formData.name} onChange={handleChange}
                        placeholder="Juan Pérez" className={inputBase} />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9E9080] mb-1.5">
                        Empresa
                      </label>
                      <input id="company" name="company" type="text"
                        value={formData.company} onChange={handleChange}
                        placeholder="Opcional" className={inputBase} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9E9080] mb-1.5">
                        Email *
                      </label>
                      <input id="email" name="email" type="email" required
                        value={formData.email} onChange={handleChange}
                        placeholder="juan@empresa.com" className={inputBase} />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9E9080] mb-1.5">
                        Teléfono
                      </label>
                      <input id="phone" name="phone" type="tel"
                        value={formData.phone} onChange={handleChange}
                        placeholder="+54 11 1234-5678" className={inputBase} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9E9080] mb-1.5">
                      Mensaje *
                    </label>
                    <textarea id="message" name="message" required rows={5}
                      value={formData.message} onChange={handleChange}
                      placeholder="Contanos qué productos te interesan, cantidades estimadas o cualquier consulta..."
                      className={`${inputBase} resize-none`} />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-xl cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{ background: '#C41B2E', boxShadow: '0 4px 16px rgba(196,27,46,0.25)' }}
                      whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.97 } : {}}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                          />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Enviar mensaje
                        </>
                      )}
                    </motion.button>
                    <p className="text-xs text-[#C0B5A8] leading-relaxed">
                      No compartimos tus datos con terceros.
                    </p>
                  </div>

                </form>
              )}
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}

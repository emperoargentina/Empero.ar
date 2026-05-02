import { useState } from 'react';
import { Phone, Mail, Send, CheckCircle2, MessageCircle, ArrowUpRight } from 'lucide-react';
import { companyConfig, whatsappConfig } from '@/data/company';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { motion } from 'framer-motion';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
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
    <section id="contacto" className="py-20 lg:py-28 bg-[#F7F5F2] relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px divider-gradient" />

      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #C41B2E 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 relative">

        <div className="grid lg:grid-cols-[5fr_7fr] gap-12 xl:gap-20 items-start">

          {/* Left — info column */}
          <AnimatedSection direction="left">
            <div className="lg:sticky lg:top-28">

              {/* Ornament label */}
              <div className="flex items-center gap-4 mb-7">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#C41B2E]/40" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C41B2E]">
                  Contacto
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-serif font-normal text-[#1A1613] leading-tight mb-5">
                ¿Hablemos<em className="not-italic text-[#C41B2E]">?</em>
              </h2>

              <p className="text-[#9E9080] text-[15px] leading-relaxed mb-10 max-w-xs">
                Completá el formulario o escribinos directamente por WhatsApp. Te respondemos en menos de 24 horas.
              </p>

              {/* Contact info — minimal typography */}
              <div className="space-y-5 mb-10">
                <a
                  href={`tel:${companyConfig.contact.phone}`}
                  className="flex items-center gap-3.5 group"
                >
                  <div className="w-8 h-8 bg-white border border-[#EBE5DC] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-[rgba(196,27,46,0.4)] transition-colors">
                    <Phone className="w-3.5 h-3.5 text-[#C41B2E]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C0B5A8] mb-0.5">Teléfono</p>
                    <p className="text-sm text-[#4A4540] font-medium group-hover:text-[#1A1613] transition-colors">
                      {companyConfig.contact.phone}
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${companyConfig.contact.email}`}
                  className="flex items-center gap-3.5 group"
                >
                  <div className="w-8 h-8 bg-white border border-[#EBE5DC] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-[rgba(196,27,46,0.4)] transition-colors">
                    <Mail className="w-3.5 h-3.5 text-[#C41B2E]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C0B5A8] mb-0.5">Email</p>
                    <p className="text-sm text-[#4A4540] font-medium group-hover:text-[#1A1613] transition-colors">
                      {companyConfig.contact.email}
                    </p>
                  </div>
                </a>
              </div>

              {/* WhatsApp CTA */}
              <motion.button
                onClick={handleWhatsAppClick}
                className="w-full max-w-xs p-5 bg-gradient-to-br from-[#25d366] to-[#1aaf57] rounded-2xl text-white text-left relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-6 translate-x-6 transition-transform duration-500 group-hover:scale-150 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-4.5 h-4.5" />
                    </div>
                    <span className="flex items-center gap-1 text-white/75 text-xs font-medium">
                      Respuesta inmediata
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="font-semibold text-base">Cotizar por WhatsApp</p>
                  <p className="text-white/70 text-xs mt-0.5">Te respondemos en minutos</p>
                </div>
              </motion.button>

            </div>
          </AnimatedSection>

          {/* Right — form */}
          <AnimatedSection direction="right" delay={0.1}>
            {isSubmitted ? (
              <motion.div
                className="flex flex-col items-center justify-center py-24 text-center"
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
                <h3 className="text-2xl font-serif font-normal text-[#1A1613] mb-2">
                  ¡Mensaje enviado!
                </h3>
                <p className="text-[#9E9080] text-sm">
                  Gracias por contactarnos. Te responderemos pronto.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-0">

                {/* Name + Company */}
                <div className="grid sm:grid-cols-2 gap-x-8">
                  <div className="border-b border-[#D8D0C6] pb-0 mb-8 focus-within:border-[#C41B2E] transition-colors">
                    <label htmlFor="name" className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C0B5A8] mb-2">
                      Nombre completo *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Juan Pérez"
                      className="w-full bg-transparent text-sm text-[#1A1613] placeholder:text-[#D0C8BE] focus:outline-none pb-2.5"
                    />
                  </div>

                  <div className="border-b border-[#D8D0C6] pb-0 mb-8 focus-within:border-[#C41B2E] transition-colors">
                    <label htmlFor="company" className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C0B5A8] mb-2">
                      Empresa
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Opcional"
                      className="w-full bg-transparent text-sm text-[#1A1613] placeholder:text-[#D0C8BE] focus:outline-none pb-2.5"
                    />
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="grid sm:grid-cols-2 gap-x-8">
                  <div className="border-b border-[#D8D0C6] pb-0 mb-8 focus-within:border-[#C41B2E] transition-colors">
                    <label htmlFor="email" className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C0B5A8] mb-2">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="juan@empresa.com"
                      className="w-full bg-transparent text-sm text-[#1A1613] placeholder:text-[#D0C8BE] focus:outline-none pb-2.5"
                    />
                  </div>

                  <div className="border-b border-[#D8D0C6] pb-0 mb-8 focus-within:border-[#C41B2E] transition-colors">
                    <label htmlFor="phone" className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C0B5A8] mb-2">
                      Teléfono
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+54 11 1234-5678"
                      className="w-full bg-transparent text-sm text-[#1A1613] placeholder:text-[#D0C8BE] focus:outline-none pb-2.5"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="border-b border-[#D8D0C6] pb-0 mb-10 focus-within:border-[#C41B2E] transition-colors">
                  <label htmlFor="message" className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C0B5A8] mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Contanos qué productos te interesan, cantidades estimadas o cualquier consulta..."
                    rows={4}
                    className="w-full bg-transparent text-sm text-[#1A1613] placeholder:text-[#D0C8BE] focus:outline-none resize-none pb-2.5"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center gap-5">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: '#C41B2E' }}
                    whileHover={!isSubmitting ? { scale: 1.02, backgroundColor: '#B8945E' } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
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
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}

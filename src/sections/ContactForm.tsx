// =============================================================================
// ContactForm Section - Rediseñado con estilo senior premium
// =============================================================================

import { useState } from 'react';
import {
  Phone,
  Mail,
  Send,
  CheckCircle2,
  MessageCircle,
  User,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import { companyConfig, whatsappConfig } from '@/data/company';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/animations/AnimatedSection';
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
    const url = `https://wa.me/${whatsappConfig.phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const contactInfo = [
    {
      icon: Phone,
      label: 'Teléfono',
      value: companyConfig.contact.phone,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Mail,
      label: 'Email',
      value: companyConfig.contact.email,
      color: 'bg-amber-50 text-amber-600'
    },
  ];

  return (
    <section id="contacto" className="py-20 lg:py-28 bg-gray-50/60 overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-px divider-gradient" />
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <AnimatedSection direction="up" className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#fff5f5] text-[#d32f2f] text-[11px] font-bold uppercase tracking-[0.1em] rounded-full mb-5 border border-[#fecaca]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d32f2f] inline-block" />
            Contacto
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight">
            ¿Necesitas una <span className="text-[#d32f2f]">cotización?</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto text-base leading-relaxed">
            Completá el formulario y te respondemos en menos de 24 horas.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Contact Info - Left Side */}
          <div className="lg:col-span-5">
            <StaggerContainer className="space-y-3" staggerDelay={0.1}>
              {contactInfo.map((item) => (
                <StaggerItem key={item.label}>
                  <motion.div
                    className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100/80 group cursor-default"
                    whileHover={{ x: 3, borderColor: 'rgba(211,47,47,0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                  >
                    <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-0.5">{item.label}</p>
                      <p className="text-gray-900 font-semibold text-sm leading-relaxed">{item.value}</p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* WhatsApp CTA Card */}
            <AnimatedSection direction="up" delay={0.4} className="mt-6">
              <motion.button
                onClick={handleWhatsAppClick}
                className="w-full p-6 bg-gradient-to-br from-[#25d366] to-[#128c7e] rounded-2xl text-white text-left relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 transition-transform duration-500 group-hover:scale-150" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1 text-white/80 text-sm">
                      Respuesta inmediata
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg">Cotizar por WhatsApp</h4>
                  <p className="text-white/80 text-sm mt-1">Te respondemos en minutos</p>
                </div>
              </motion.button>
            </AnimatedSection>
          </div>

          {/* Form - Right Side */}
          <AnimatedSection direction="right" delay={0.2} className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100/80" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)' }}>
              {isSubmitted ? (
                <motion.div 
                  className="text-center py-16"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <motion.div 
                    className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    ¡Mensaje enviado!
                  </h3>
                  <p className="text-gray-500">
                    Gracias por contactarnos. Te responderemos pronto.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Nombre completo
                      </Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Juan Pérez"
                          className="input-premium pl-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                        Empresa
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Tu empresa (opcional)"
                          className="input-premium pl-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="juan@empresa.com"
                          className="input-premium pl-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Teléfono
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+54 11 1234-5678"
                          className="input-premium pl-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                      Mensaje
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Cuéntanos qué productos te interesan..."
                      rows={5}
                      className="input-premium resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-150 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: '#d32f2f',
                      boxShadow: '0 1px 2px rgba(211,47,47,0.2), 0 4px 16px rgba(211,47,47,0.2)',
                    }}
                    whileHover={!isSubmitting ? { scale: 1.005, background: '#c62828' } : {}}
                    whileTap={!isSubmitting ? { scale: 0.995 } : {}}
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
                        <Send className="w-4 h-4" />
                        Enviar mensaje
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-gray-400">
                    Al enviar, aceptas nuestra política de privacidad. No compartimos tus datos.
                  </p>
                </form>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

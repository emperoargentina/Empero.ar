// =============================================================================
// Footer Component - Estilo senior premium
// =============================================================================

import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Linkedin, ArrowUp } from 'lucide-react';
import { categories } from '@/data/products';
import { companyConfig } from '@/data/company';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { motion } from 'framer-motion';

export function Footer() {
  const quickLinks = [
    { name: 'Inicio', href: '#' },
    { name: 'Catálogo', href: '#catalogo' },
    { name: 'Manufactura', href: '#manufactura' },
    { name: 'Contacto', href: '#contacto' },
  ];

  const contactInfo = [
    { icon: MapPin, text: companyConfig.contact.address },
    { icon: Phone, text: companyConfig.contact.phone },
    { icon: Mail, text: companyConfig.contact.email },
    { icon: Clock, text: companyConfig.contact.hours },
  ];

  const socialLinks = [
    { icon: Instagram, href: companyConfig.social.instagram, label: 'Instagram' },
    { icon: Facebook, href: companyConfig.social.facebook, label: 'Facebook' },
    { icon: Linkedin, href: companyConfig.social.linkedin, label: 'LinkedIn' },
  ];

  const scrollToSection = (href: string) => {
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-950 text-white relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

      <div className="container-custom py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column */}
          <AnimatedSection direction="up" className="lg:col-span-5">
            <div className="space-y-6">
              <div className="flex items-center">
                <img
                  src="/images/logo/Logo.png"
                  alt={companyConfig.name}
                  className="h-12 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                Líderes en equipamiento gastronómico industrial. Más de {companyConfig.stats.years} años
                brindando soluciones profesionales para restaurantes, hoteles y negocios gastronómicos.
              </p>
              {/* Social Links */}
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 bg-white/[0.06] hover:bg-[#d32f2f] border border-white/[0.08] hover:border-[#d32f2f] rounded-xl flex items-center justify-center transition-colors duration-200 cursor-pointer"
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Quick Links */}
          <AnimatedSection direction="up" delay={0.1} className="lg:col-span-2 lg:col-start-7">
            <h4 className="font-bold text-[11px] uppercase tracking-[0.1em] text-gray-500 mb-5">Enlaces</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <motion.button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium cursor-pointer"
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 25 }}
                  >
                    {link.name}
                  </motion.button>
                </li>
              ))}
            </ul>
          </AnimatedSection>

          {/* Categories */}
          <AnimatedSection direction="up" delay={0.2} className="lg:col-span-2">
            <h4 className="font-bold text-[11px] uppercase tracking-[0.1em] text-gray-500 mb-5">Categorías</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <motion.button
                    onClick={() => scrollToSection('#catalogo')}
                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium cursor-pointer"
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 25 }}
                  >
                    {category.name}
                  </motion.button>
                </li>
              ))}
            </ul>
          </AnimatedSection>

          {/* Contact Info */}
          <AnimatedSection direction="up" delay={0.3} className="lg:col-span-3">
            <h4 className="font-bold text-[11px] uppercase tracking-[0.1em] text-gray-500 mb-5">Contacto</h4>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-[#d32f2f] mt-0.5 flex-shrink-0 opacity-70" />
                  <span className="text-gray-400 text-sm leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm font-medium">
            © {new Date().getFullYear()} {companyConfig.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-5">
            <button className="text-gray-600 hover:text-gray-400 text-sm font-medium transition-colors cursor-pointer">
              Privacidad
            </button>
            <button className="text-gray-600 hover:text-gray-400 text-sm font-medium transition-colors cursor-pointer">
              Términos
            </button>
            <motion.button
              onClick={scrollToTop}
              aria-label="Volver arriba"
              className="w-9 h-9 bg-white/[0.06] hover:bg-[#d32f2f] border border-white/[0.08] hover:border-[#d32f2f] rounded-xl flex items-center justify-center transition-colors duration-200 cursor-pointer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.93 }}
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}

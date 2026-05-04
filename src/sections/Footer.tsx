import { Phone, Mail, Clock, Instagram, Facebook, ArrowUp } from 'lucide-react';
import { categories } from '@/data/products';
import { companyConfig, whatsappConfig } from '@/data/company';
import { motion } from 'framer-motion';

export function Footer() {
  const quickLinks = [
    { name: 'Inicio', href: '#' },
    { name: 'Catálogo', href: '#catalogo' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Contacto', href: '#contacto' },
  ];

  const contactInfo = [
    { icon: Phone, text: companyConfig.contact.phone },
    { icon: Mail, text: companyConfig.contact.email },
    { icon: Clock, text: companyConfig.contact.hours },
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/empero.argentina', label: 'Instagram' },
    { icon: Facebook, href: companyConfig.social.facebook, label: 'Facebook' },
  ];

  const scrollToSection = (href: string) => {
    if (href === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0D0B09] text-white relative overflow-hidden">
      {/* Separator */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C41B2E]/80 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C41B2E]/25 to-transparent translate-y-[1px]" />
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#C41B2E]/[0.07] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#C41B2E]/[0.03] blur-[80px] pointer-events-none" />

      <div className="container-custom py-16 lg:py-20 relative">

        {/* Main row — 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 mb-8">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-4 flex flex-col gap-4">
            <img
              src="/images/logo/Logo.png"
              alt={companyConfig.name}
              className="h-11 w-auto object-contain object-left brightness-0 invert"
            />
            <p className="text-white/45 text-sm leading-relaxed max-w-xs">
              Distribuidores oficiales de Empero en Argentina. Equipamiento gastronómico profesional
              para restaurantes, hoteles y cocinas industriales.
            </p>
            <div className="flex gap-2 mt-1">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer text-white/35 hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  whileHover={{ y: -2, backgroundColor: 'rgba(196,27,46,0.15)', borderColor: 'rgba(196,27,46,0.3)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                >
                  <social.icon className="w-3.5 h-3.5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30 mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <item.icon className="w-3.5 h-3.5 text-[#C41B2E]/70 mt-0.5 flex-shrink-0" />
                  <span className="text-white/55 text-sm leading-snug">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30 mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <motion.button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/55 hover:text-white transition-colors text-sm font-medium cursor-pointer"
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 25 }}
                  >
                    {link.name}
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30 mb-4">
              Categorías
            </h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <motion.button
                    onClick={() => scrollToSection('#catalogo')}
                    className="text-white/55 hover:text-white transition-colors text-sm font-medium cursor-pointer text-left"
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 25 }}
                  >
                    {category.name}
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} {companyConfig.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <button className="text-white/25 hover:text-white/55 text-xs transition-colors cursor-pointer">Privacidad</button>
            <button className="text-white/25 hover:text-white/55 text-xs transition-colors cursor-pointer">Términos</button>
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Volver arriba"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.93 }}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

      </div>
    </footer>
  );
}

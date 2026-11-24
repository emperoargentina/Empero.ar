import { Phone, Mail, Clock, Instagram, ArrowUp } from 'lucide-react';
import { categories } from '@/data/products';
import { companyConfig } from '@/data/company';
import { getWhatsAppURL } from '@/lib/whatsapp';
import { handleAnchorClick } from '@/lib/scroll';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

interface FooterProps {
  onCategorySelect?: (categoryId: string) => void;
}

const QUICK_LINKS = [
  { name: 'Inicio', href: '#inicio' },
  { name: 'Catálogo', href: '#catalogo' },
  { name: 'Nosotros', href: '#nosotros' },
  { name: 'Envíos y postventa', href: '#envios-postventa' },
  { name: 'Contacto', href: '#contacto' },
];

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://www.instagram.com/empero.argentina', label: 'Instagram de Empero Argentina' },
  { icon: WhatsAppIcon, href: getWhatsAppURL(), label: 'WhatsApp de Empero Argentina' },
];

export function Footer({ onCategorySelect }: FooterProps) {
  const contactInfo = [
    { icon: Phone, text: companyConfig.contact.phone, href: `tel:${companyConfig.contact.phone.replace(/[^\d+]/g, '')}` },
    { icon: Mail, text: companyConfig.contact.email, href: `mailto:${companyConfig.contact.email}` },
    { icon: Clock, text: companyConfig.contact.hours, href: null },
  ];

  return (
    <footer className="bg-[#0D0B09] text-white relative overflow-hidden">
      <div aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C41B2E]/80 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C41B2E]/25 to-transparent translate-y-px" />
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#C41B2E]/[0.07] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[200px] bg-[#C41B2E]/[0.03] blur-[80px] pointer-events-none" />
      </div>

      <div className="container-custom py-16 lg:py-20 relative">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-6 mb-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-4 flex flex-col gap-4">
            <img
              src="/images/logo/Logo.png"
              alt={`${companyConfig.name} Argentina`}
              width={480}
              height={333}
              loading="lazy"
              className="h-11 w-auto object-contain object-left brightness-0 invert self-start"
            />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs text-pretty">
              Distribuidores oficiales de Empero en Argentina. Equipamiento gastronómico profesional
              para restaurantes, hoteles y cocinas industriales.
            </p>
            <ul className="flex gap-2 mt-1">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="footer-icon-btn"
                  >
                    <social.icon className="w-4 h-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-3">
            <h2 className="footer-heading">Contacto</h2>
            <ul className="space-y-3">
              {contactInfo.map((item) => (
                <li key={item.text} className="flex items-start gap-2.5">
                  <item.icon className="w-3.5 h-3.5 text-[#E0485A] mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {item.href ? (
                    <a href={item.href} className="text-white/70 hover:text-white text-sm leading-snug underline-offset-2 hover:underline break-all">
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-white/70 text-sm leading-snug">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <nav aria-label="Pie de página" className="col-span-1 sm:col-span-1 lg:col-span-2">
            <h2 className="footer-heading">Navegación</h2>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <a href={link.href} onClick={handleAnchorClick} className="footer-link">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Categories */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-3 flex flex-col h-full">
            <h2 className="footer-heading">Categorías</h2>
            <ul className="space-y-2.5">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => onCategorySelect?.(category.id)}
                    className="footer-link text-left cursor-pointer"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6 flex justify-end">
              <a href="#inicio" onClick={handleAnchorClick} aria-label="Volver arriba" className="footer-icon-btn w-10 h-10">
                <ArrowUp className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} {companyConfig.name} Argentina. Todos los derechos reservados.
          </p>
          <a
            href="https://arcynox.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-white transition-colors duration-200"
          >
            <span>Desarrollado por</span>
            <img src="/images/arcynox.webp" alt="" width={16} height={16} loading="lazy" className="h-4 w-4 object-contain" />
            <span className="font-semibold italic">Arcynox</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

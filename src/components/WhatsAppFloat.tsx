import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { whatsappConfig } from '@/data/company';

interface WhatsAppFloatProps {
  productName?: string;
}

const WhatsAppSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 flex-shrink-0" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function WhatsAppFloat({ productName }: WhatsAppFloatProps = {}) {
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    const show = () => {
      setShowLabel(true);
      setTimeout(() => setShowLabel(false), 3500);
    };

    // Primera aparición a los 15s, luego cada 90s
    const first = setTimeout(show, 15000);
    const interval = setInterval(show, 90000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  const handleClick = () => {
    const message = productName
      ? encodeURIComponent(whatsappConfig.messageTemplate(productName))
      : encodeURIComponent(whatsappConfig.defaultMessage);
    window.open(`https://wa.me/${whatsappConfig.phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      aria-label="Cotizar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center text-white rounded-full cursor-pointer overflow-hidden select-none"
      style={{
        background: 'linear-gradient(135deg, #25d366 0%, #1fbc5c 100%)',
        boxShadow: '0 4px 20px rgba(37,211,102,0.35), 0 1px 4px rgba(0,0,0,0.12)',
        height: '52px',
        paddingLeft: '14px',
        paddingRight: '14px',
      }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.6 }}
      whileTap={{ scale: 0.96 }}
    >
      <WhatsAppSVG />

      <motion.span
        className="text-sm font-semibold whitespace-nowrap overflow-hidden"
        animate={showLabel
          ? { width: 142, marginLeft: 8, opacity: 1 }
          : { width: 0, marginLeft: 0, opacity: 0 }
        }
        initial={{ width: 0, marginLeft: 0, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        ¿Necesitás ayuda?
      </motion.span>

      {/* Shine sweep */}
      <motion.div
        className="absolute inset-0 bg-white/15 -skew-x-12 pointer-events-none"
        initial={{ x: '-150%' }}
        animate={{ x: ['-150%', '250%'] }}
        transition={{ repeat: Infinity, repeatDelay: 18, duration: 0.7, ease: 'easeOut' }}
      />
    </motion.button>
  );
}

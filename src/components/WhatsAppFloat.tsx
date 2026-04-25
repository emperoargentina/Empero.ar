import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { whatsappConfig } from '@/data/company';

interface WhatsAppFloatProps {
  productName?: string;
}

export function WhatsAppFloat({ productName }: WhatsAppFloatProps = {}) {
  const handleClick = () => {
    const message = productName
      ? encodeURIComponent(whatsappConfig.messageTemplate(productName))
      : encodeURIComponent(whatsappConfig.defaultMessage);
    const url = `https://wa.me/${whatsappConfig.phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      aria-label="Cotizar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-0 text-white rounded-full cursor-pointer overflow-hidden"
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
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
    >
      <MessageCircle className="w-6 h-6 flex-shrink-0" />
      <motion.span
        className="text-sm font-semibold whitespace-nowrap overflow-hidden"
        variants={{
          hover: { width: 120, marginLeft: 8, opacity: 1 },
        }}
        initial={{ width: 0, marginLeft: 0, opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        Cotizar ahora
      </motion.span>

      {/* Shine sweep */}
      <motion.div
        className="absolute inset-0 bg-white/15 -skew-x-12 pointer-events-none"
        initial={{ x: '-100%' }}
        animate={{ x: ['−100%', '200%'] }}
        transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.7, ease: 'easeOut' }}
      />
    </motion.button>
  );
}

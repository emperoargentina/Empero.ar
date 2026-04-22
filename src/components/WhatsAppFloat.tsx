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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 text-white rounded-full group overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
        boxShadow: '0 4px 20px rgba(37, 211, 102, 0.35), 0 1px 4px rgba(0,0,0,0.15)',
      }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 8px 28px rgba(37, 211, 102, 0.45), 0 2px 8px rgba(0,0,0,0.15)',
      }}
      whileTap={{ scale: 0.96 }}
    >
      {/* Shine sweep */}
      <motion.div
        className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full"
        animate={{ translateX: ['−100%', '200%'] }}
        transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6, ease: 'easeOut' }}
      />
      <MessageCircle className="w-5 h-5 flex-shrink-0" />
      <span className="font-semibold text-sm relative z-10">Cotizar ahora</span>
    </motion.button>
  );
}

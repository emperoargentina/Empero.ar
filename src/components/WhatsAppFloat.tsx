import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { whatsappConfig } from '@/data/company';
import { getWhatsAppURL } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

interface WhatsAppFloatProps {
  productName?: string;
}

const FIRST_HINT_MS = 25_000;
const HINT_EVERY_MS = 140_000;
const HINT_VISIBLE_MS = 5_000;

export function WhatsAppFloat({ productName }: WhatsAppFloatProps = {}) {
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const show = () => {
      setShowLabel(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setShowLabel(false), HINT_VISIBLE_MS);
    };

    const first = setTimeout(show, FIRST_HINT_MS);
    const interval = setInterval(show, HINT_EVERY_MS);

    return () => {
      clearTimeout(first);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  const href = getWhatsAppURL(
    productName ? whatsappConfig.messageTemplate(productName) : undefined
  );

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Cotizar por WhatsApp"
      className="fixed z-50 flex items-center h-[52px] px-[14px] text-white rounded-full overflow-hidden select-none bg-gradient-to-br from-[#25d366] to-[#1fbc5c] shadow-[0_4px_20px_rgba(37,211,102,0.35),0_1px_4px_rgba(0,0,0,0.12)] right-[max(1.5rem,env(safe-area-inset-right))] bottom-[max(1.5rem,env(safe-area-inset-bottom))]"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.6 }}
      whileTap={{ scale: 0.96 }}
    >
      <WhatsAppIcon className="w-6 h-6 flex-shrink-0" />

      <motion.span
        className="text-sm font-semibold whitespace-nowrap overflow-hidden"
        aria-hidden="true"
        animate={showLabel
          ? { width: 142, marginLeft: 8, opacity: 1 }
          : { width: 0, marginLeft: 0, opacity: 0 }
        }
        initial={{ width: 0, marginLeft: 0, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        ¿Necesitás ayuda?
      </motion.span>

      {/* Brillo — MotionConfig reducedMotion="user" lo apaga si se pidió menos movimiento */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 bg-white/15 -skew-x-12 pointer-events-none"
        initial={{ x: '-150%' }}
        animate={{ x: ['-150%', '250%'] }}
        transition={{ repeat: Infinity, repeatDelay: 18, duration: 0.7, ease: 'easeOut' }}
      />
    </motion.a>
  );
}

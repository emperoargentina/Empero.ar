import type { ReactNode } from 'react';
import { AnimatedSection } from '@/components/animations/AnimatedSection';

interface SectionHeaderProps {
  eyebrow: string;
  /** Texto del título antes de la palabra destacada. */
  title: ReactNode;
  /** Palabra o frase final del título, en rojo Empero. */
  accent?: ReactNode;
  titleId: string;
  description?: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}

// Encabezado de sección de la marca: etiqueta entre filetes rojos, título en
// Fraunces con la palabra clave en rojo y bajada centrada.
export function SectionHeader({
  eyebrow,
  title,
  accent,
  titleId,
  description,
  tone = 'light',
  className = '',
}: SectionHeaderProps) {
  const dark = tone === 'dark';
  return (
    <div className={`text-center ${className}`}>
      <AnimatedSection direction="up">
        <p className="section-eyebrow">
          <span aria-hidden="true" className="section-eyebrow__rule" />
          {eyebrow}
          <span aria-hidden="true" className="section-eyebrow__rule section-eyebrow__rule--end" />
        </p>
      </AnimatedSection>
      <AnimatedSection direction="up" delay={0.06}>
        <h2
          id={titleId}
          className={`mt-4 font-display font-[560] text-[clamp(1.85rem,1.4rem+1.6vw,2.75rem)] leading-[1.1] ${dark ? 'text-white' : 'text-ink-900'}`}
        >
          {title}
          {accent && <> <em className="not-italic text-brand">{accent}</em></>}
        </h2>
      </AnimatedSection>
      {description && (
        <AnimatedSection direction="up" delay={0.12}>
          <div className={`mt-4 mx-auto max-w-2xl text-[0.9375rem] sm:text-base leading-relaxed text-pretty ${dark ? 'text-white/70' : 'text-ink-600'}`}>
            {description}
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}

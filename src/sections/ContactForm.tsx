import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Phone, Mail, Send, CheckCircle2, ChevronRight, User, Building2, MessageSquare, ShieldCheck, AlertCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { companyConfig } from '@/data/company';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { getWhatsAppURL } from '@/lib/whatsapp';
import type { ConsultaInput } from '@/types/consulta';

// ── Field ────────────────────────────────────────────────────────────────────
// Validación nativa (required, type=email, minlength) + :user-invalid en CSS:
// el error aparece recién cuando la persona terminó de completar el campo o
// intentó enviar, nunca mientras escribe. aria-invalid y aria-describedby se
// sincronizan con ese mismo estado para lectores de pantalla.

type FieldElement = HTMLInputElement | HTMLTextAreaElement;

interface FieldProps {
  label: string;
  name: keyof ConsultaInput;
  icon: ReactNode;
  error: string;
  hint?: string;
  required?: boolean;
  multiline?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  onInvalidField: (el: FieldElement) => void;
}

function isUserInvalid(el: FieldElement): boolean {
  try {
    return el.matches(':user-invalid');
  } catch {
    return !el.validity.valid;
  }
}

function Field({ label, name, icon, error, hint, required, multiline, inputProps, textareaProps, onInvalidField }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const [invalid, setInvalid] = useState(false);

  const describedBy = [hint ? hintId : null, invalid ? errorId : null].filter(Boolean).join(' ') || undefined;

  const common = {
    id,
    name,
    required,
    'aria-invalid': invalid,
    'aria-describedby': describedBy,
    className: `field-control ${multiline ? 'field-control--multiline' : ''}`,
    onBlur: (e: React.FocusEvent<FieldElement>) => setInvalid(isUserInvalid(e.currentTarget)),
    onInput: (e: React.FormEvent<FieldElement>) => {
      if (invalid && e.currentTarget.validity.valid) setInvalid(false);
    },
    onInvalid: (e: React.FormEvent<FieldElement>) => {
      // Sin globo nativo: mostramos nuestro propio mensaje y movemos el foco.
      e.preventDefault();
      setInvalid(true);
      onInvalidField(e.currentTarget);
    },
  };

  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="ml-1 text-[#C41B2E]/70" aria-hidden="true">*</span>}
      </label>
      {hint && <p id={hintId} className="field-hint">{hint}</p>}
      <div className="relative">
        <span className={`field-icon ${multiline ? 'top-3.5' : 'top-1/2 -translate-y-1/2'}`} aria-hidden="true">
          {icon}
        </span>
        {multiline
          ? <textarea {...common} {...textareaProps} />
          : <input {...common} {...inputProps} />}
      </div>
      <p id={errorId} className="field-error">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" role="img" aria-label="Error" />
        {error}
      </p>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'sending' | 'sent' | 'error';

function readForm(form: HTMLFormElement): ConsultaInput {
  const data = new FormData(form);
  const get = (k: keyof ConsultaInput) => String(data.get(k) ?? '').trim();
  return {
    nombre: get('nombre'),
    email: get('email'),
    telefono: get('telefono'),
    empresa: get('empresa'),
    mensaje: get('mensaje'),
    website: get('website'),
  };
}

function whatsappFallbackMessage(c: ConsultaInput): string {
  const intro = `Hola, soy ${c.nombre || '…'}${c.empresa ? ` de ${c.empresa}` : ''}.`;
  const contacto = [c.email && `Email: ${c.email}`, c.telefono && `Tel: ${c.telefono}`].filter(Boolean).join(' · ');
  return [intro, '', c.mensaje, contacto ? `\n${contacto}` : ''].join('\n').trim();
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const lastPayload = useRef<ConsultaInput | null>(null);
  const firstInvalidFocused = useRef(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const handleInvalidField = (el: FieldElement) => {
    if (firstInvalidFocused.current) return;
    firstInvalidFocused.current = true;
    el.focus();
    queueMicrotask(() => { firstInvalidFocused.current = false; });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    const form = e.currentTarget;
    const payload = readForm(form);
    lastPayload.current = payload;
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'No pudimos enviar tu consulta.');
      form.reset();
      setStatus('sent');
      requestAnimationFrame(() => successHeadingRef.current?.focus());
    } catch (err) {
      setErrorMsg(err instanceof Error && err.message !== 'Failed to fetch'
        ? err.message
        : 'No hay conexión con el servidor.');
      setStatus('error');
    }
  };

  const channels = [
    {
      key: 'phone', label: 'Teléfono', value: companyConfig.contact.phone,
      sub: 'Lun – Vie · 9 a 18 hs', icon: <Phone className="w-5 h-5" />,
      href: `tel:${companyConfig.contact.phone.replace(/[^\d+]/g, '')}`, external: false, color: '#C41B2E',
    },
    {
      key: 'email', label: 'Email', value: companyConfig.contact.email,
      sub: 'Respuesta en < 24 hs', icon: <Mail className="w-5 h-5" />,
      href: `mailto:${companyConfig.contact.email}`, external: false, color: '#C41B2E',
    },
    {
      key: 'whatsapp', label: 'WhatsApp', value: 'Escribinos ahora',
      sub: 'Respuesta inmediata', icon: <WhatsAppIcon className="w-5 h-5" />,
      href: getWhatsAppURL(), external: true, color: '#25D366',
    },
  ];

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="relative overflow-hidden bg-[#F4F0E8]">
      <div className="absolute top-0 inset-x-0 h-px bg-black/[0.08]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-grain" />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-24 lg:py-36">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-6 lg:gap-8 items-start">

          {/* ── LEFT ── */}
          <AnimatedSection direction="up">
            <div className="lg:sticky lg:top-28">
              <div className="flex items-center gap-3 mb-10">
                <div className="h-px w-8 bg-[#C41B2E]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C41B2E]">
                  Contacto
                </span>
              </div>

              <h2
                id="contacto-title"
                className="font-serif font-[560] leading-none mb-8 text-[#1A1613] tracking-[-0.02em] text-[clamp(2.75rem,1.6rem+3.2vw,4.5rem)]"
              >
                Hablemos<span className="text-[#C41B2E]">.</span>
              </h2>

              <p className="text-lg leading-relaxed mb-14 max-w-[400px] text-[#7A6E65]">
                Consultas sobre equipamiento, precios y disponibilidad. Respondemos en menos de 24&nbsp;hs.
              </p>

              <ul className="flex flex-col gap-2.5">
                {channels.map((ch) => (
                  <li key={ch.key}>
                    <a
                      href={ch.href}
                      {...(ch.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="contact-channel group"
                    >
                      <span className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-[#C41B2E] transition-transform duration-200 motion-safe:group-hover:scale-105">
                        {ch.icon}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] mb-0.5 text-[#857870]">{ch.label}</span>
                        <span className="block text-sm font-semibold truncate text-[#1A1613]">{ch.value}</span>
                        <span className="block text-[11.5px] mt-0.5 text-[#857870]">{ch.sub}</span>
                      </span>
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
                        strokeWidth={2.5}
                        style={{ color: ch.color }}
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>

              <div className="contact-channel mt-2.5 cursor-default hover:translate-y-0">
                <span className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-[#C41B2E]">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-[#1A1613]">Tus datos están seguros</span>
                  <span className="block text-[11.5px] mt-0.5 leading-snug text-[#857870]">
                    Solo los usamos para responder tu consulta. No los compartimos con terceros.
                  </span>
                </span>
              </div>
            </div>
          </AnimatedSection>

          {/* ── RIGHT: Form card ── */}
          <AnimatedSection direction="up" delay={0.1} className="lg:max-w-[660px] lg:ml-auto w-full">
            <div className="rounded-2xl overflow-hidden bg-white border border-black/[0.06] shadow-[0_32px_90px_rgba(26,22,19,0.14),0_10px_30px_rgba(26,22,19,0.07),0_20px_60px_rgba(196,27,46,0.06)]">
              <div className="px-6 sm:px-10 py-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C41B2E] mb-2">Consulta</p>
                <div className="flex items-center gap-2.5 mb-3">
                  <Send className="w-[18px] h-[18px] flex-shrink-0 text-[#C41B2E]" aria-hidden="true" />
                  <h3 id="consulta-form-title" className="font-serif font-[560] text-[1.3rem] text-[#1A1613]">
                    Envianos tu mensaje
                  </h3>
                </div>
                <div className="w-[120px] h-0.5 bg-[#C41B2E] opacity-35" />
              </div>

              <div className="px-6 sm:px-10 pb-9 pt-2">
                <AnimatePresence mode="wait" initial={false}>
                  {status === 'sent' ? (
                    <motion.div
                      key="success"
                      role="status"
                      className="flex flex-col items-center justify-center py-16 text-center"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-[#C41B2E]/[0.06] border border-[#C41B2E]/15"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 16, delay: 0.1 }}
                      >
                        <CheckCircle2 className="w-7 h-7 text-[#C41B2E]" aria-hidden="true" />
                      </motion.div>
                      <h4 ref={successHeadingRef} tabIndex={-1} className="font-serif font-[560] mb-2 text-[1.2rem] text-[#1A1613] outline-none">
                        ¡Recibimos tu consulta!
                      </h4>
                      <p className="text-sm text-[#6B6159] max-w-xs text-pretty">
                        Te respondemos al email que dejaste en menos de 24&nbsp;hs hábiles.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="mt-7 inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#EBE5DC] text-[13px] font-semibold text-[#6B6159] hover:bg-[#F4F0E8] cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" aria-hidden="true" />
                        Enviar otra consulta
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      aria-labelledby="consulta-form-title"
                      aria-busy={status === 'sending'}
                      className="flex flex-col gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Field
                        label="Nombre" name="nombre" required
                        icon={<User className="w-4 h-4" />}
                        error="Escribí tu nombre."
                        onInvalidField={handleInvalidField}
                        inputProps={{ type: 'text', autoComplete: 'name', maxLength: 120, placeholder: 'Juan Pérez', enterKeyHint: 'next' }}
                      />

                      <div className="grid sm:grid-cols-2 gap-5">
                        <Field
                          label="Email" name="email" required
                          icon={<Mail className="w-4 h-4" />}
                          error="Ingresá un email válido, por ejemplo juan@empresa.com."
                          onInvalidField={handleInvalidField}
                          inputProps={{
                            type: 'email', autoComplete: 'email', inputMode: 'email', maxLength: 254,
                            placeholder: 'juan@empresa.com', autoCapitalize: 'none', autoCorrect: 'off',
                            spellCheck: false, enterKeyHint: 'next',
                          }}
                        />
                        <Field
                          label="Teléfono" name="telefono"
                          icon={<Phone className="w-4 h-4" />}
                          error="Revisá el número de teléfono."
                          onInvalidField={handleInvalidField}
                          inputProps={{
                            type: 'tel', autoComplete: 'tel', inputMode: 'tel', maxLength: 40,
                            placeholder: '+54 11 1234-5678', enterKeyHint: 'next',
                          }}
                        />
                      </div>

                      <Field
                        label="Empresa" name="empresa"
                        icon={<Building2 className="w-4 h-4" />}
                        error="Revisá el nombre de la empresa."
                        onInvalidField={handleInvalidField}
                        inputProps={{ type: 'text', autoComplete: 'organization', maxLength: 120, placeholder: 'Nombre de tu empresa (opcional)', enterKeyHint: 'next' }}
                      />

                      <Field
                        label="Mensaje" name="mensaje" required multiline
                        icon={<MessageSquare className="w-4 h-4" />}
                        hint="Contanos qué equipo te interesa, cantidades y para qué tipo de cocina."
                        error="Contanos un poco más (mínimo 10 caracteres)."
                        onInvalidField={handleInvalidField}
                        textareaProps={{ rows: 5, minLength: 10, maxLength: 5000, placeholder: 'Ej: Necesito un horno convector de 10 bandejas para un restaurante…' }}
                      />

                      {/* Honeypot anti-spam: invisible y fuera del orden de tabulación. */}
                      <div className="hidden" aria-hidden="true">
                        <label htmlFor="consulta-website">No completar</label>
                        <input id="consulta-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
                      </div>

                      {status === 'error' && (
                        <div role="alert" className="flex gap-3 rounded-xl border border-[#F5C5C9] bg-[#FFF6F6] p-4 text-[13px] text-[#3A3530]">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#C41B2E]" aria-hidden="true" />
                          <div className="space-y-2">
                            <p><strong className="text-[#1A1613]">No se pudo enviar.</strong> {errorMsg} Probá de nuevo o mandanos la consulta por WhatsApp.</p>
                            <a
                              href={getWhatsAppURL(lastPayload.current ? whatsappFallbackMessage(lastPayload.current) : undefined)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-semibold text-[#128C4A] underline underline-offset-2"
                            >
                              <WhatsAppIcon className="w-4 h-4" />
                              Enviar por WhatsApp
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="pt-1">
                        <motion.button
                          type="submit"
                          disabled={status === 'sending'}
                          className="relative w-full h-[52px] rounded-xl text-[14px] font-semibold text-white cursor-pointer disabled:opacity-60 disabled:cursor-wait overflow-hidden flex items-center justify-center gap-2.5 bg-gradient-to-br from-[#C41B2E] to-[#9e1424] shadow-[0_4px_20px_rgba(196,27,46,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]"
                          whileHover={status !== 'sending' ? { boxShadow: '0 8px 32px rgba(196,27,46,0.35), inset 0 1px 0 rgba(255,255,255,0.1)' } : {}}
                          whileTap={status !== 'sending' ? { scale: 0.99 } : {}}
                          transition={{ duration: 0.15 }}
                        >
                          {status === 'sending' ? (
                            <>
                              <span className="spinner" aria-hidden="true" />
                              Enviando…
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" aria-hidden="true" />
                              Enviar consulta
                            </>
                          )}
                        </motion.button>

                        <p className="text-center mt-4 text-[12px] text-[#857870]">
                          También podés escribirnos por{' '}
                          <a
                            href={getWhatsAppURL()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 font-semibold text-[#C41B2E] hover:text-[#9E1424]"
                          >
                            WhatsApp
                          </a>
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}

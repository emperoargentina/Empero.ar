import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Phone, Mail, Send, ChevronRight, User, Building2, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
        {required && <span className="ml-1 text-brand/70" aria-hidden="true">*</span>}
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
  const reduceMotion = useReducedMotion();
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
      const body: { ok?: boolean; error?: string } | null = await res.json().catch(() => null);
      if (!res.ok || body?.ok !== true) {
        throw new Error(body?.error || 'No pudimos enviar tu consulta.');
      }
      form.reset();
      setStatus('sent');
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
      href: `tel:${companyConfig.contact.phone.replace(/[^\d+]/g, '')}`, external: false, color: 'rgb(var(--brand-600))',
    },
    {
      key: 'email', label: 'Email', value: companyConfig.contact.email,
      sub: 'Respuesta en < 24 hs', icon: <Mail className="w-5 h-5" />,
      href: `mailto:${companyConfig.contact.email}`, external: false, color: 'rgb(var(--brand-600))',
    },
    {
      key: 'whatsapp', label: 'WhatsApp', value: 'Escribinos ahora',
      sub: 'Respuesta inmediata', icon: <WhatsAppIcon className="w-5 h-5" />,
      href: getWhatsAppURL(), external: true, color: 'rgb(var(--whatsapp-600))',
    },
  ];

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="relative overflow-hidden bg-ink-100">
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-ink-900/[0.08]" />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-[0.035] bg-grain" />
      <div aria-hidden="true" className="absolute -top-40 right-[-10%] w-[40rem] h-[40rem] rounded-full bg-brand/[0.05] blur-[120px] pointer-events-none" />

      <div className="relative container-custom py-20 lg:py-28">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-12 items-start">

          {/* ── LEFT ── */}
          <AnimatedSection direction="up">
            <div className="lg:sticky lg:top-28">
              <p className="inline-flex items-center gap-3 mb-8 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand">
                <span aria-hidden="true" className="h-px w-8 bg-brand" />
                Contacto
              </p>

              <h2
                id="contacto-title"
                className="font-display font-[560] leading-none mb-7 text-ink-900 tracking-[-0.025em] text-[clamp(2.4rem,1.6rem+2.4vw,3.6rem)]"
              >
                Hablemos<span className="text-brand">.</span>
              </h2>

              <p className="text-[1rem] leading-relaxed mb-10 max-w-[25rem] text-ink-600 text-pretty">
                Consultas sobre equipamiento, precios y disponibilidad. Respondemos en menos de 24&nbsp;hs.
              </p>

              <ul className="flex flex-col gap-3">
                {channels.map((ch) => (
                  <li key={ch.key}>
                    <a
                      href={ch.href}
                      {...(ch.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="contact-channel group"
                    >
                      <span aria-hidden="true" className="contact-channel__icon">
                        {ch.icon}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[0.6562rem] font-semibold uppercase tracking-[0.12em] mb-0.5 text-ink-500">{ch.label}</span>
                        <span className="block text-[0.9375rem] font-semibold truncate text-ink-900">{ch.value}</span>
                        <span className="block text-[0.75rem] mt-0.5 text-ink-500">{ch.sub}</span>
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

              <div className="contact-channel contact-channel--static mt-3">
                <span aria-hidden="true" className="contact-channel__icon">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[0.9375rem] font-semibold text-ink-900">Tus datos están seguros</span>
                  <span className="block text-[0.75rem] mt-0.5 leading-snug text-ink-500">
                    Solo los usamos para responder tu consulta. No los compartimos con terceros.
                  </span>
                </span>
              </div>
            </div>
          </AnimatedSection>

          {/* ── RIGHT: Form card ── */}
          <AnimatedSection
            direction="up"
            delay={0.1}
            className={`flex w-full lg:ml-auto lg:max-w-[42.5rem] ${status === 'sent' ? 'lg:self-stretch' : ''}`}
          >
            <div className="form-card flex w-full flex-col">
              <div className="px-6 sm:px-10 pt-8 pb-6">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand mb-2">Consulta</p>
                <div className="flex items-center gap-2.5 mb-4">
                  <Send className="w-[1.125rem] h-[1.125rem] flex-shrink-0 text-brand" aria-hidden="true" />
                  <h3 id="consulta-form-title" className="font-display font-[560] text-[1.25rem] text-ink-900">
                    Envianos tu mensaje
                  </h3>
                </div>
                <div aria-hidden="true" className="w-28 h-0.5 rounded-full bg-gradient-to-r from-brand to-brand/0" />
              </div>

              <div className={`px-6 pb-9 pt-2 sm:px-10 ${status === 'sent' ? 'flex flex-1 flex-col' : ''}`}>
                <AnimatePresence mode="wait" initial={false}>
                  {status === 'sent' ? (
                    <motion.div
                      key="success"
                      role="status"
                      className="flex flex-1 flex-col items-center justify-center py-8 text-center sm:py-12"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onAnimationComplete={() => successHeadingRef.current?.focus({ preventScroll: true })}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="mb-4 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-green-700 text-white"
                        initial={reduceMotion ? false : { scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.23, ease: 'easeOut' }}
                      >
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                          <motion.path
                            d="m5 12 4.5 4.5L19 7"
                            stroke="currentColor"
                            strokeWidth={2.75}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={reduceMotion ? false : { pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.34, delay: 0.09, ease: 'easeOut' }}
                          />
                        </svg>
                      </motion.div>
                      <h4 ref={successHeadingRef} tabIndex={-1} className="font-display font-[560] mb-2 text-xl text-ink-900 outline-none">
                        Recibimos tu consulta
                      </h4>
                      <p className="text-sm text-ink-600 max-w-xs text-pretty">
                        Te vamos a responder por email en menos de 24&nbsp;horas hábiles.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="mt-4 min-h-11 px-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
                      >
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
                        inputProps={{ type: 'text', autoComplete: 'organization', maxLength: 120, placeholder: 'Opcional', enterKeyHint: 'next' }}
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
                        <div role="alert" className="flex gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-[0.8125rem] text-ink-700">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand" aria-hidden="true" />
                          <div className="space-y-2">
                            <p><strong className="text-ink-900">No se pudo enviar.</strong> {errorMsg} Probá de nuevo o mandanos la consulta por WhatsApp.</p>
                            <a
                              href={getWhatsAppURL(lastPayload.current ? whatsappFallbackMessage(lastPayload.current) : undefined)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-semibold text-whatsapp-700 underline underline-offset-2"
                            >
                              <WhatsAppIcon className="w-4 h-4" />
                              Enviar por WhatsApp
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="pt-1">
                        <button
                          type="submit"
                          disabled={status === 'sending'}
                          className="btn btn-lg btn-primary w-full disabled:cursor-wait"
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
                        </button>

                        <p className="text-center mt-4 text-[0.8438rem] text-ink-500">
                          También podés escribirnos por{' '}
                          <a
                            href={getWhatsAppURL()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 font-semibold text-brand hover:text-brand-800"
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

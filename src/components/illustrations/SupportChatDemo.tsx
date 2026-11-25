import { Plus, Camera, Mic, SendHorizontal, CheckCheck } from 'lucide-react';
import { Stage } from '@/vendor/stageshow/stage';
import { Phone } from '@/vendor/stageshow/phone';
import { Thread, Bubble, Stamp } from '@/vendor/stageshow/messages';
import type { Act } from '@/vendor/stageshow/act';
import './SupportChatDemo.css';

// Postventa por WhatsApp en un iPhone, recortado a la conversación: el
// cliente escribe el problema y lo envía (la burbuja sale del campo), los
// tildes pasan a azul, Empero escribe y responde con la visita técnica.
// En loop: tras la respuesta, lo que agregó la vuelta (tu mensaje y la
// respuesta) se desvanece junto, la respuesta primero, y queda el saludo.

type S = { draft: string; sent: boolean; read: boolean; typing: boolean; reply: boolean; clearing: boolean };
const START: S = { draft: '', sent: false, read: false, typing: false, reply: false, clearing: false };
const DONE: S = { draft: '', sent: true, read: true, typing: false, reply: true, clearing: false };
const MINE = 'La freidora no enciende';

async function script(a: Act<S>) {
  await a.wait(700);
  await a.click('compose');
  await a.type('draft', MINE, { interval: 55 });
  await a.wait(400);
  await a.click('send');
  // El campo se vacía en el mismo paso: las palabras salen de él a la burbuja
  await a.set({ sent: true, draft: '' });
  await a.wait(900);
  await a.set({ read: true });
  await a.wait(600);
  await a.set({ typing: true });
  await a.wait(1500);
  await a.set({ typing: false, reply: true });
  await a.wait(2600);
  a.mark('reset');
  void a.move('compose'); // el dedo vuelve a donde empieza la próxima vuelta
  await a.set({ clearing: true }); // se van la respuesta y tu mensaje
  await a.wait(550);
  await a.set(START); // ya invisibles: se desmontan y queda el saludo
  await a.wait(500);
}

function Meta({ time, ticks }: { time: string; ticks?: 'sent' | 'read' }) {
  return (
    <span className="wa-meta">
      {time}
      {ticks && <CheckCheck size={15} strokeWidth={2.2} className="wa-ticks" data-read={ticks === 'read' || undefined} />}
    </span>
  );
}

export function SupportChatDemo() {
  return (
    <Stage<S>
      // Un teléfono solo va centrado a su tamaño, con un margen parejo: el
      // escenario tiene su ancho y la tarjeta lo centra sobre el mismo fondo
      width={358}
      height={300}
      initial={START}
      poster={DONE}
      script={script}
      play="loop"
      cursor={{ at: 'compose', style: 'touch' }}
      className="wa-demo"
    >
      {(s) => (
        <Phone width={326} wallpaper="#efeae2" className="wa-phone" aria-hidden="true">
          <Thread className={`wa-thread${s.clearing ? ' is-clearing' : ''}`}>
            <Stamp>Hoy</Stamp>
            <Bubble from="them">
              ¡Hola! ¿En qué te podemos ayudar?
              <Meta time="10:21" />
            </Bubble>
            {s.sent && (
              <Bubble from="me" source="draft">
                {MINE}
                <Meta time="10:24" ticks={s.read ? 'read' : 'sent'} />
              </Bubble>
            )}
            {(s.typing || s.reply) && (
              <Bubble from="them" typing={s.typing}>
                Mañana a las 9 te visita un técnico. En CABA, sin cargo.
                <Meta time="10:25" />
              </Bubble>
            )}
          </Thread>

          <div className="wa-compose">
            <span className="wa-icon" aria-hidden>
              <Plus size={24} strokeWidth={2} />
            </span>
            <span className="wa-field" data-target="compose">
              <span className="wa-field__text" data-target="draft">
                {s.draft}
                {s.draft && <i className="wa-caret" data-snap />}
              </span>
            </span>
            <span className="wa-actions">
              <span className="wa-icon" data-hide={s.draft ? '' : undefined} aria-hidden>
                <Camera size={22} strokeWidth={2} />
              </span>
              <span className="wa-mic" data-hide={s.draft ? '' : undefined} aria-hidden>
                <Mic size={22} strokeWidth={2} />
              </span>
              <span className="wa-send" data-target="send" data-show={s.draft ? '' : undefined}>
                <SendHorizontal size={18} strokeWidth={2.2} />
              </span>
            </span>
          </div>
        </Phone>
      )}
    </Stage>
  );
}

import { Truck, Clock, MapPin, User, FileText } from 'lucide-react';
import { Stage } from '@/vendor/stageshow/stage';
import { Bar } from '@/vendor/stageshow/window';
import { Check } from '@/vendor/stageshow/parts/Check';
import { Roll } from '@/vendor/stageshow/motion/Roll';
import { Badge } from '@/vendor/stageshow/controls/Badge';
import type { Act } from '@/vendor/stageshow/act';
import './ShippingTrackerDemo.css';

// Seguimiento de un pedido, sin cursor: lo que hace el sistema. Abre con el
// equipo en camino (ya es una imagen completa), el camión recorre el último
// tramo, el paso "Entregado" se completa y el estado y la hora cambian en su
// lugar. En loop como una cinta: la ficha entregada sale por el corte de
// abajo, se reinicia sin verse y entra el pedido siguiente.

type S = { arrived: boolean; delivered: boolean; out: boolean };
const START: S = { arrived: false, delivered: false, out: false };
const DONE: S = { arrived: true, delivered: true, out: false };

const STEPS = ['Confirmado', 'Despachado', 'En camino', 'Entregado'];

// Foto real del producto (Cloudinary del catálogo), recortada a cuadrado blanco
const THUMB =
  'https://res.cloudinary.com/dsirw8ga2/image/upload/w_120,h_120,c_pad,b_white,f_auto,q_auto/v1785911970/empero/emp-pls-7se010_nobg.png';

async function script(a: Act<S>) {
  await a.wait(900);
  a.mark('travel');
  await a.set({ arrived: true }); // el camión hace el último tramo
  await a.wait(2600);
  a.mark('delivered');
  await a.set({ delivered: true }); // llega: check, estado y hora
  await a.wait(2600);
  a.mark('next');
  await a.set({ out: true }); // la ficha entregada sale por abajo
  await a.wait(480);
  await a.snap({ arrived: false, delivered: false }); // se reinicia sin verse
  await a.set({ out: false }); // entra el pedido siguiente
  await a.wait(900);
}

export function ShippingTrackerDemo() {
  return (
    <Stage<S>
      width={496}
      height={300}
      compact={{ below: 440, width: 358, height: 300 }}
      initial={START}
      poster={DONE}
      script={script}
      play="loop"
      className="ship-demo"
    >
      {(s) => (
        <div className="ship-card" data-out={s.out || undefined} aria-hidden="true">
          <div className="ship-head">
            <img className="ship-thumb" src={THUMB} alt="" width={44} height={44} loading="lazy" decoding="async" />
            <div className="ship-title">
              <div className="ship-name">Baño María Eléctrico</div>
              <Bar w={72} h={5} tone={2} />
            </div>
            <Badge tone={s.delivered ? 'success' : 'warning'} dot className="ship-badge">
              <Roll variant="fade">{s.delivered ? 'Entregado' : 'En camino'}</Roll>
            </Badge>
          </div>

          <div className="ship-steps" data-arrived={s.arrived || undefined}>
            <div className="ship-track">
              <span className="ship-track__fill" />
              <span className="ship-truck">
                <Truck size={13} strokeWidth={2.2} />
              </span>
            </div>
            {STEPS.map((label, i) => {
              const last = i === STEPS.length - 1;
              const on = !last || s.delivered;
              return (
                <div key={label} className="ship-step" data-current={(last && s.delivered) || undefined}>
                  <Check on={on} pending={last && !s.delivered} size={18} />
                  <span className="ship-step__label">{label}</span>
                </div>
              );
            })}
          </div>

          <div className="ship-info">
            <div className="ship-info__row">
              <Clock size={16} strokeWidth={2} className="ship-info__icon" />
              <span className="ship-info__text">
                <Roll variant="fade">{s.delivered ? 'Entregado hoy, 15:42' : 'Llega hoy entre 14 y 18 h'}</Roll>
              </span>
            </div>
            <div className="ship-info__row">
              <MapPin size={16} strokeWidth={2} className="ship-info__icon" />
              <span className="ship-info__text">Envío a CABA</span>
              <span className="ship-free">Sin cargo</span>
            </div>
            {/* El resto de la ficha sigue bajo el corte inferior */}
            <div className="ship-info__row">
              <User size={16} strokeWidth={2} className="ship-info__icon" />
              <Bar w={64} h={5} tone={2} />
              <Bar w={88} h={5} tone={1} className="ship-info__end" />
            </div>
            <div className="ship-info__row">
              <FileText size={16} strokeWidth={2} className="ship-info__icon" />
              <Bar w={92} h={5} tone={2} />
              <Bar w={56} h={5} tone={1} className="ship-info__end" />
            </div>
          </div>

        </div>
      )}
    </Stage>
  );
}

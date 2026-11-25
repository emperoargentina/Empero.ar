# Ensayo de las ilustraciones (Stageshow)

Ilustraciones animadas de la sección "Envíos y postventa", hechas con el kit de
Stageshow copiado en `src/vendor/stageshow` (importado pieza por pieza para no
sumar al bundle lo que no se usa).

## ShippingTrackerDemo (Envíos)

- **Base:** `examples/payout-flow` (historia sin cursor, llegadas encadenadas).
- **Historia:** el pedido abre "En camino" (ya es una imagen completa), el camión
  hace el último tramo, se completa "Entregado", el estado y la hora cambian en
  su lugar (`Roll`). En loop como una cinta: la ficha entregada sale por el
  corte inferior, se reinicia con `snap` mientras no se ve y entra la siguiente.
  El póster (movimiento reducido) es el estado entregado.
- **Encuadre:** ficha fijada arriba con el pie bajo el corte; la lista de datos
  sigue por debajo del borde (relleno con `Bar`). Versión `compact` de 358 px.
- **Cambios respecto de la base:** colores y tipografía de Empero (rojo #C3151B,
  DM Sans), foto real del producto desde Cloudinary, íconos de lucide.

## SupportChatDemo (Postventa)

- **Base:** `examples/messages` (conversación en un iPhone, recorte cercano).
- **Historia:** el cliente escribe "La freidora no enciende", la burbuja sale del
  campo, los tildes pasan a azul, "escribiendo…" y llega la respuesta con la
  visita técnica. En loop: tu mensaje y la respuesta se desvanecen juntos (la
  respuesta primero) y queda el saludo; el dedo vuelve al campo. El póster es la
  conversación completa.
- **Encuadre:** escenario del ancho del teléfono (358 px) con margen parejo de
  16 px, centrado en la tarjeta sobre el mismo fondo.
- **Cambios respecto de la base:** colores de WhatsApp (burbujas, fondo, tildes),
  hora y tildes dentro de la burbuja, barra de escritura de WhatsApp (cámara y
  micrófono que dejan lugar al botón verde de enviar).

## Verificado

- `film.mjs --gate` en ancho de diseño y a 390 px: **rehearsal passed** en las dos.
- Visto en la página real a 1280 y 375 px, sin desbordes.

## No verificado

- El tema oscuro (el sitio no lo tiene).
- Safari/iOS real: se probó en Chrome.
- La filmación marcó "inconclusive" por huecos de muestreo de la máquina (no por
  fallas); el movimiento se revisó en las hojas de contacto.

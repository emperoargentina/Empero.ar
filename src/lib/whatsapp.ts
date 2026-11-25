import { whatsappConfig } from '@/data/company'

export function getWhatsAppURL(
  message: string = whatsappConfig.defaultMessage,
  phoneNumber: string = whatsappConfig.phoneNumber,
): string {
  const cleanMessage = message.replaceAll('\uFFFD', '')
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(cleanMessage)}`
}

export function getProductWhatsAppURL(productName: string, productCode?: string): string {
  return getWhatsAppURL(whatsappConfig.messageTemplate(productName, productCode))
}

export function openWhatsApp(message?: string): void {
  window.open(getWhatsAppURL(message), '_blank', 'noopener,noreferrer')
}

export interface QuoteMessageItem {
  nombre: string
  codigo: string
  quantity: number
  notes: string
}

export function buildQuoteMessage(items: QuoteMessageItem[]): string {
  const total = items.reduce((sum, item) => sum + item.quantity, 0)
  const lines = [
    'Hola, buenos días.',
    '',
    'Quisiera solicitar una cotización para los siguientes productos:',
    '',
  ]
  items.forEach((item, i) => {
    lines.push(`${i + 1}. *${item.nombre}*`)
    lines.push(`   Código: ${item.codigo}`)
    lines.push(`   Cantidad: ${item.quantity}`)
    if (item.notes) lines.push(`   Nota: ${item.notes}`)
    lines.push('')
  })
  lines.push(`Total: ${total} unidad${total !== 1 ? 'es' : ''}`)
  lines.push('')
  lines.push('Quedo atento/a a su respuesta. ¡Muchas gracias!')
  return lines.join('\n')
}

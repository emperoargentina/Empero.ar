// =============================================================================
// Company Data - Información de Empero
// =============================================================================

export const companyConfig = {
  name: 'Empero',
  fullName: 'Empero Equipamiento Industrial',
  tagline: 'Equipamiento gastronómico de excelencia',
  description: 'Somos una empresa argentina con más de 20 años de experiencia en la fabricación y distribución de equipamiento gastronómico industrial de alta calidad. Nos especializamos en brindar soluciones integrales para restaurantes, hoteles, catering y todo tipo de negocios gastronómicos.',
  mission: 'Proveer equipamiento gastronómico industrial de la más alta calidad, combinando tecnología de vanguardia con diseño funcional, para potenciar la eficiencia y productividad de nuestros clientes.',
  vision: 'Ser la empresa líder en equipamiento gastronómico industrial de Latinoamérica, reconocida por la excelencia de nuestros productos y el servicio personalizado que ofrecemos.',
  values: [
    'Calidad superior en cada producto',
    'Innovación constante',
    'Atención personalizada',
    'Compromiso con el cliente',
    'Garantía y soporte técnico'
  ],
  stats: {
    years: 20,
    products: 784,
    categories: 13,
    clients: 5000
  },
  contact: {
    phone: '+54 11 2345-6789',
    whatsapp: '5491123456789',
    email: 'info@empero.com',
    address: 'Av. Industrial 1234, Buenos Aires, Argentina',
    hours: 'Lun - Vie: 9:00 - 18:00'
  },
  social: {
    instagram: 'https://instagram.com/empero',
    facebook: 'https://facebook.com/empero',
    linkedin: 'https://linkedin.com/company/empero'
  }
};

// WhatsApp configuration
export const whatsappConfig = {
  phoneNumber: companyConfig.contact.whatsapp,
  messageTemplate: (productName: string) => 
    `Hola, quiero cotizar el producto: ${productName}`,
  defaultMessage: 'Hola, quiero cotizar sus productos.',
};

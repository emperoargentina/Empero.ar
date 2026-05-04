// =============================================================================
// Company Data - Información de Empero
// =============================================================================

export const companyConfig = {
  name: 'Empero',
  fullName: 'Empero Industrial Kitchen Equipment',
  tagline: 'Más de 40 años equipando cocinas profesionales en el mundo',
  description: 'Empero es una empresa turca de primer nivel especializada en equipamiento para cocinas industriales y profesionales. Sus orígenes se remontan a 1983, cuando nació como Ersöz Mutfak Makineleri, fabricando equipos de preparación de alimentos. En 2005, unificó cinco empresas productoras bajo el nombre Empero Group, consolidando su posición como líder del sector.',
  mission: 'Fabricar más de 3.000 tipos de productos bajo un mismo techo, con tecnología de punta y los más altos estándares de calidad, para equipar restaurantes, hoteles, cadenas de catering y cualquier operación gastronómica a escala mundial.',
  vision: 'Ser la empresa de equipamiento gastronómico de mayor crecimiento del mundo, exportando a más de 90 países y siendo sinonímia de calidad, innovación y confiabilidad en cada mercado donde opera.',
  values: [
    'Fabricación propia en planta de 60.000 m²',
    '+3.000 tipos de productos certificados',
    'Exportación a más de 90 países',
    'Red de servicio técnico autorizado',
    'Respaldo de marca con más de 40 años'
  ],
  stats: {
    years: 40,
    products: 3000,
    categories: 13,
    clients: 5000
  },
  contact: {
    phone: '+54 9 11 3228-6523',
    whatsapp: '5491132286523',
    email: 'empero.argentina@gmail.com',
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

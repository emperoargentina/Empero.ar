const CATEGORY_IMAGES: Record<string, string> = {
  'Lavado': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
  'Refrigeración': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30',
  'Distribución y Autoservicio': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
  'Hornos': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
  'Freidoras': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
  'Planchas': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
  'Cocinas': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
  'Parrillas': 'https://images.unsplash.com/photo-1544025162-d76694265947',
  'Cucipastas': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
  'Hornos a Gas Bajo Mostrador': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
  'Superficies': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
  'Elaboración': 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1',
  'Mesas': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136';

export function getProductImage(category: string, w = 400, h = 400): string {
  const base = CATEGORY_IMAGES[category] ?? DEFAULT_IMAGE;
  return `${base}?w=${w}&h=${h}&fit=crop`;
}

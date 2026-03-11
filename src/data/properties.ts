export type PropertyType = 'casa' | 'apartamento' | 'terreno' | 'comercial';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  garageSpaces?: number;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  images: string[];
  description: string;
}

/** Backward compat helper */
export function getPropertyImage(property: Property): string {
  return property.images[0] ?? '/placeholder.svg';
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  terreno: 'Terreno',
  comercial: 'Comercial',
};

export const WHATSAPP_NUMBER = '5542991519146';

export function getWhatsAppLink(property: Property): string {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no imóvel: ${property.title} - ${property.neighborhood} - ${property.address} (${property.area}m², ${property.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}). Poderia me passar mais informações?`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

/** Map DB row to Property */
export function mapDbProperty(row: {
  id: string;
  title: string;
  type: string;
  price: number;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  garage_spaces: number | null;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  images: string[];
  description: string;
}): Property {
  return {
    id: row.id,
    title: row.title,
    type: row.type as PropertyType,
    price: row.price,
    area: row.area,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    garageSpaces: row.garage_spaces ?? undefined,
    address: row.address,
    neighborhood: row.neighborhood,
    lat: row.lat,
    lng: row.lng,
    images: row.images,
    description: row.description,
  };
}

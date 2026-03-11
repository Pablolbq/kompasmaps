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
  image: string;
  description: string;
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

// In-memory store (will reset on refresh — later replace with DB)
let _properties: Property[] = [
  {
    id: '1',
    title: 'Casa moderna no Jardim Carvalho',
    type: 'casa',
    price: 480000,
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    garageSpaces: 2,
    address: 'Rua Santos Dumont, 450',
    neighborhood: 'Jardim Carvalho',
    lat: -25.0916,
    lng: -50.1570,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    description: 'Casa espaçosa com acabamento moderno, quintal amplo e garagem para 2 carros. Piso porcelanato em todos os ambientes, cozinha planejada e área gourmet completa.',
  },
  {
    id: '2',
    title: 'Apartamento no Centro',
    type: 'apartamento',
    price: 320000,
    area: 85,
    bedrooms: 2,
    bathrooms: 1,
    garageSpaces: 1,
    address: 'Rua XV de Novembro, 1200',
    neighborhood: 'Centro',
    lat: -25.0945,
    lng: -50.1633,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
    description: 'Apartamento bem localizado, próximo ao comércio e transporte público. Condomínio com portaria 24h, salão de festas e academia.',
  },
  {
    id: '3',
    title: 'Terreno em Uvaranas',
    type: 'terreno',
    price: 150000,
    area: 450,
    address: 'Rua Euclides da Cunha, 800',
    neighborhood: 'Uvaranas',
    lat: -25.0780,
    lng: -50.1480,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
    description: 'Terreno plano em área residencial, pronto para construir. Documentação em dia. Rua asfaltada com rede de água e esgoto.',
  },
  {
    id: '4',
    title: 'Casa com piscina em Estrela',
    type: 'casa',
    price: 650000,
    area: 250,
    bedrooms: 4,
    bathrooms: 3,
    garageSpaces: 3,
    address: 'Rua Balduíno Taques, 320',
    neighborhood: 'Estrela',
    lat: -25.0850,
    lng: -50.1720,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
    description: 'Linda casa com piscina, churrasqueira e ampla área de lazer. Suite master com closet, lavabo e jardim paisagístico.',
  },
  {
    id: '5',
    title: 'Apartamento em Oficinas',
    type: 'apartamento',
    price: 220000,
    area: 65,
    bedrooms: 2,
    bathrooms: 1,
    garageSpaces: 1,
    address: 'Av. Carlos Cavalcanti, 4500',
    neighborhood: 'Oficinas',
    lat: -25.1050,
    lng: -50.1550,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    description: 'Apartamento compacto e funcional, ideal para jovens casais. Próximo à UEPG com fácil acesso ao centro.',
  },
  {
    id: '6',
    title: 'Terreno no Boa Vista',
    type: 'terreno',
    price: 200000,
    area: 600,
    address: 'Rua Tibagi, 1500',
    neighborhood: 'Boa Vista',
    lat: -25.0700,
    lng: -50.1600,
    image: 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=400&h=300&fit=crop',
    description: 'Excelente terreno em bairro nobre, frente para rua asfaltada. Ideal para construção de residência de alto padrão.',
  },
  {
    id: '7',
    title: 'Casa térrea em Nova Rússia',
    type: 'casa',
    price: 380000,
    area: 140,
    bedrooms: 3,
    bathrooms: 2,
    garageSpaces: 1,
    address: 'Rua Visconde de Mauá, 250',
    neighborhood: 'Nova Rússia',
    lat: -25.0990,
    lng: -50.1700,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
    description: 'Casa térrea com projeto moderno, varanda gourmet e jardim. Acabamento de primeira e quintal amplo.',
  },
  {
    id: '8',
    title: 'Cobertura no Centro',
    type: 'apartamento',
    price: 550000,
    area: 150,
    bedrooms: 3,
    bathrooms: 2,
    garageSpaces: 2,
    address: 'Rua Engenheiro Schamber, 300',
    neighborhood: 'Centro',
    lat: -25.0930,
    lng: -50.1610,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
    description: 'Cobertura duplex com vista panorâmica da cidade, terraço com churrasqueira. Acabamento premium e localização privilegiada.',
  },
  {
    id: '9',
    title: 'Sala Comercial no Centro',
    type: 'comercial',
    price: 280000,
    area: 60,
    bathrooms: 1,
    garageSpaces: 1,
    address: 'Rua Coronel Dulcídio, 800',
    neighborhood: 'Centro',
    lat: -25.0940,
    lng: -50.1645,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    description: 'Sala comercial em prédio empresarial moderno. Recepção, ar condicionado central e estacionamento rotativo.',
  },
];

export const properties = _properties;

export function addProperty(property: Omit<Property, 'id'>): Property {
  const newProperty = { ...property, id: String(Date.now()) };
  _properties.push(newProperty);
  return newProperty;
}

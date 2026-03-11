import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property, propertyTypeLabels, getWhatsAppLink, getPropertyImage } from '@/data/properties';
import { MapPin, BedDouble, Bath, Ruler, Car, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';

const typeColors: Record<string, string> = {
  casa: '#1a9a8a',
  apartamento: '#3b6fe0',
  terreno: '#d4872a',
  comercial: '#8b5cf6',
};

const typeIcons: Record<string, string> = {
  casa: '🏠',
  apartamento: '🏢',
  terreno: '📐',
  comercial: '🏪',
};

function createCustomIcon(type: string) {
  const color = typeColors[type] || '#1a9a8a';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border: 3px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">${typeIcons[type]}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function MapBoundsUpdater({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    if (properties.length === 0) return;
    const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [properties, map]);
  return null;
}

interface PropertyMapProps {
  properties: Property[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PropertyMap({ properties, selectedId, onSelect }: PropertyMapProps) {
  return (
    <MapContainer
      center={[-25.0945, -50.1633]}
      zoom={13}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBoundsUpdater properties={properties} />
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat, property.lng]}
          icon={createCustomIcon(property.type)}
          eventHandlers={{ click: () => onSelect(property.id) }}
        >
          <Popup>
            <div className="p-3 min-w-[220px]">
              <img src={getPropertyImage(property)} alt={property.title} className="w-full h-28 object-cover rounded-lg mb-2" />
              <span
                className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5"
                style={{ background: typeColors[property.type] + '18', color: typeColors[property.type] }}
              >
                {propertyTypeLabels[property.type]}
              </span>
              <h3 className="font-bold text-sm text-foreground leading-tight">{property.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin size={11} /> {property.neighborhood}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Ruler size={11} /> {property.area}m²</span>
                {property.bedrooms && <span className="flex items-center gap-1"><BedDouble size={11} /> {property.bedrooms}</span>}
                {property.bathrooms && <span className="flex items-center gap-1"><Bath size={11} /> {property.bathrooms}</span>}
                {property.garageSpaces && <span className="flex items-center gap-1"><Car size={11} /> {property.garageSpaces}</span>}
              </div>
              <p className="font-bold text-primary mt-2 text-base">{formatPrice(property.price)}</p>
              <a
                href={getWhatsAppLink(property)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors"
              >
                <MessageCircle size={12} /> WhatsApp
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

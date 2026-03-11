import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property, propertyTypeLabels, getWhatsAppLink, getPropertyImage, mediaTypeLabels } from '@/data/properties';
import { MapPin, BedDouble, Bath, Ruler, Car, MessageCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

const typeColors: Record<string, string> = {
  casa: '#1a9a8a',
  apartamento: '#3b6fe0',
  terreno: '#d4872a',
  comercial: '#8b5cf6',
  midia: '#6b5080',
};

const typeSvgIcons: Record<string, string> = {
  casa: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  apartamento: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
  terreno: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7l-2-2"/><path d="M17 8v.8A6 6 0 0 1 13.8 20H10A6.5 6.5 0 0 1 7 8h0a5 5 0 0 1 10 0Z"/><path d="m14 14-2 2"/></svg>`,
  comercial: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>`,
  midia: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`,
};

function createCustomIcon(type: string, isSelected: boolean, hasSelection: boolean) {
  const color = typeColors[type] || '#1a9a8a';
  const dimmed = hasSelection && !isSelected;
  const size = 36;
  const opacity = dimmed ? '0.7' : '1';
  const filter = dimmed ? 'grayscale(30%)' : 'none';
  const border = '3px solid white';
  const shadow = '0 4px 12px rgba(0,0,0,0.25)';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${shadow};
        border: ${border};
        opacity: ${opacity};
        filter: ${filter};
        transition: all 0.25s;
      ">
        <span style="transform: rotate(45deg); display:flex; align-items:center; justify-content:center;">${typeSvgIcons[type] || ''}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function MapBoundsUpdater({ properties }: { properties: Property[] }) {
  const map = useMap();
  const prevCount = useRef<number | null>(null);
  useEffect(() => {
    if (properties.length === 0) return;
    const count = properties.length;
    if (prevCount.current === count) return;
    prevCount.current = count;
    const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [properties, map]);
  return null;
}

interface PropertyMapProps {
  properties: Property[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDeselect?: () => void;
  onExpand?: (id: string) => void;
  isMobile?: boolean;
}

function MapClickHandler({ onDeselect }: { onDeselect?: () => void }) {
  const map = useMap();
  useEffect(() => {
    if (!onDeselect) return;
    const handler = () => onDeselect();
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, onDeselect]);
  return null;
}

export default function PropertyMap({ properties, selectedId, onSelect, onDeselect, onExpand, isMobile = false }: PropertyMapProps) {
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
      <MapClickHandler onDeselect={onDeselect} />
      {properties.map((property) => {
        const isSelected = selectedId === property.id;
        const hasSelection = !!selectedId;
        const isMidia = property.type === 'midia';
        return (
          <Marker
            key={property.id}
            position={[property.lat, property.lng]}
            icon={createCustomIcon(property.type, isSelected, hasSelection)}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(property.id) }}
          >
            {!isMobile && (
              <Popup>
                <div className="p-3 min-w-[220px]">
                  <img src={getPropertyImage(property)} alt={property.title} className="w-full h-28 object-cover rounded-lg mb-2" />
                  <span
                    className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5"
                    style={{ background: typeColors[property.type] + '18', color: typeColors[property.type] }}
                  >
                    {propertyTypeLabels[property.type]}
                  </span>
                  <h3
                    className="font-bold text-sm text-foreground leading-tight cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onExpand?.(property.id)}
                  >{property.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin size={11} /> {property.neighborhood}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Ruler size={11} /> {property.area}m²</span>
                    {!isMidia && property.bedrooms && <span className="flex items-center gap-1"><BedDouble size={11} /> {property.bedrooms}</span>}
                    {!isMidia && property.bathrooms && <span className="flex items-center gap-1"><Bath size={11} /> {property.bathrooms}</span>}
                    {!isMidia && property.garageSpaces && <span className="flex items-center gap-1"><Car size={11} /> {property.garageSpaces}</span>}
                    {isMidia && property.mediaType && (
                      <span className="text-xs font-medium">{mediaTypeLabels[property.mediaType]}</span>
                    )}
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
            )}
          </Marker>
        );
      })}
    </MapContainer>
  );
}

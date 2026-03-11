import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property, propertyTypeLabels, getWhatsAppLink, getPropertyImage } from '@/data/properties';
import { MapPin, BedDouble, Bath, Ruler, Car, MessageCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

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
        <span style="transform: rotate(45deg); font-size: 16px;">${typeIcons[type]}</span>
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
    // Fit bounds on first load and whenever the property list changes (search/filter)
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
            )}
          </Marker>
        );
      })}
    </MapContainer>
  );
}

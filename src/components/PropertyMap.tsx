import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Property, propertyTypeLabels, getWhatsAppLink, getPropertyImage, mediaTypeLabels } from '@/data/properties';
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border: 3px solid white;
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

interface PropertyMapProps {
  properties: Property[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDeselect?: () => void;
  onExpand?: (id: string) => void;
  isMobile?: boolean;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}

function MapClickHandler({ onDeselect }: { onDeselect?: () => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = () => {
      map.closePopup();
      onDeselect?.();
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, onDeselect]);
  return null;
}

function BoundsReporter({ onBoundsChange }: { onBoundsChange?: (bounds: L.LatLngBounds) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!onBoundsChange) return;
    const report = () => onBoundsChange(map.getBounds());
    map.on('moveend', report);
    map.on('zoomend', report);
    // Initial report
    report();
    return () => {
      map.off('moveend', report);
      map.off('zoomend', report);
    };
  }, [map, onBoundsChange]);
  return null;
}

function MarkerClusterLayer({
  properties, selectedId, onSelect, onExpand, isMobile
}: {
  properties: Property[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onExpand?: (id: string) => void;
  isMobile: boolean;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const prevPropsRef = useRef<string>('');
  const openPopupId = useRef<string | null>(null);

  // Rebuild cluster only when properties change
  useEffect(() => {
    const key = properties.map(p => p.id).join(',');
    if (key === prevPropsRef.current && clusterRef.current) return;
    prevPropsRef.current = key;

    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }
    markersRef.current.clear();

    const cluster = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (c: any) => {
        const count = c.getChildCount();
        let size = 'small';
        if (count >= 10) size = 'medium';
        if (count >= 50) size = 'large';
        return L.divIcon({
          html: `<div class="cluster-icon cluster-${size}"><span>${count}</span></div>`,
          className: 'custom-cluster',
          iconSize: L.point(40, 40),
        });
      },
    });

    cluster.on('clusterclick', (event: any) => {
      const spiderfiedCluster = (cluster as any)._spiderfied;
      if (spiderfiedCluster && event.layer === spiderfiedCluster && event.originalEvent) {
        L.DomEvent.stop(event.originalEvent);
      }
    });

    properties.forEach((property) => {
      const marker = L.marker([property.lat, property.lng], {
        icon: createCustomIcon(property.type, false, false),
      });

      marker.on('click', (e: L.LeafletMouseEvent) => {
        if (e.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
        }

        if (!isMobile && marker.getPopup()) {
          if (marker.isPopupOpen()) {
            marker.closePopup();
            openPopupId.current = null;
            onSelect(property.id);
            return;
          }
          marker.openPopup();
        }

        openPopupId.current = property.id;
        onSelect(property.id);
      });

      marker.on('popupclose', () => {
        if (openPopupId.current === property.id) {
          openPopupId.current = null;
        }
      });

      if (!isMobile) {
        const isMidia = property.type === 'midia';
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <div style="padding:12px;min-width:220px;">
            <img src="${getPropertyImage(property)}" alt="${property.title}" style="width:100%;height:112px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />
            <span style="display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;margin-bottom:6px;background:${typeColors[property.type]}18;color:${typeColors[property.type]};">
              ${propertyTypeLabels[property.type]}
            </span>
            <h3 class="popup-title" style="font-weight:700;font-size:13px;line-height:1.3;cursor:pointer;margin:4px 0 2px;">${property.title}</h3>
            <p style="font-size:11px;color:#666;display:flex;align-items:center;gap:4px;">📍 ${property.neighborhood}</p>
            <div style="display:flex;align-items:center;gap:12px;margin-top:8px;font-size:11px;color:#666;">
              <span>📐 ${property.area}m²</span>
              ${!isMidia && property.bedrooms ? `<span>🛏️ ${property.bedrooms}</span>` : ''}
              ${!isMidia && property.bathrooms ? `<span>🚿 ${property.bathrooms}</span>` : ''}
              ${!isMidia && property.garageSpaces ? `<span>🚗 ${property.garageSpaces}</span>` : ''}
              ${isMidia && property.mediaType ? `<span>${mediaTypeLabels[property.mediaType]}</span>` : ''}
            </div>
            <p style="font-weight:700;color:hsl(20,70%,48%);margin-top:8px;font-size:15px;">${formatPrice(property.price)}</p>
            <a href="${getWhatsAppLink(property)}" target="_blank" rel="noopener noreferrer"
              style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:6px;font-size:11px;font-weight:600;background:#25D366;color:white;text-decoration:none;margin-top:8px;">
              💬 WhatsApp
            </a>
          </div>
        `;
        const titleEl = popupContent.querySelector('.popup-title');
        if (titleEl && onExpand) {
          titleEl.addEventListener('click', () => onExpand(property.id));
        }
        marker.bindPopup(popupContent, { autoClose: true });
      }

      markersRef.current.set(property.id, marker);
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
    };
  }, [properties, onSelect, onExpand, isMobile, map]);

  // Update icons when selection changes (without rebuilding cluster)
  useEffect(() => {
    const hasSelection = !!selectedId;
    markersRef.current.forEach((marker, id) => {
      const property = properties.find(p => p.id === id);
      if (property) {
        const isSelected = selectedId === id;
        marker.setIcon(createCustomIcon(property.type, isSelected, hasSelection));
        if (isSelected) marker.setZIndexOffset(1000);
        else marker.setZIndexOffset(0);
      }
    });
  }, [selectedId, properties]);

  return null;
}

function getPropertyImage_fn(property: Property): string {
  return property.images[0] ?? '/placeholder.svg';
}

export default function PropertyMap({ properties, selectedId, onSelect, onDeselect, onExpand, isMobile = false, onBoundsChange }: PropertyMapProps) {
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
      <MapClickHandler onDeselect={onDeselect} />
      <BoundsReporter onBoundsChange={onBoundsChange} />
      <MarkerClusterLayer
        properties={properties}
        selectedId={selectedId}
        onSelect={onSelect}
        onExpand={onExpand}
        isMobile={isMobile}
      />
    </MapContainer>
  );
}

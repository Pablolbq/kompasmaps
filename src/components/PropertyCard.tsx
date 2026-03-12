import { Property, propertyTypeLabels, getWhatsAppLink, mediaTypeLabels } from '@/data/properties';
import { MapPin, BedDouble, Bath, Ruler, Car, MessageCircle, ChevronDown, ChevronUp, Megaphone } from 'lucide-react';
import { useState, forwardRef } from 'react';
import ImageCarousel from './ImageCarousel';

const SW = 1.5;

const typeColors: Record<string, string> = {
  casa: 'bg-badge-casa/10 text-badge-casa',
  apartamento: 'bg-badge-apartamento/10 text-badge-apartamento',
  terreno: 'bg-badge-terreno/10 text-badge-terreno',
  comercial: 'bg-badge-comercial/10 text-badge-comercial',
  midia: 'bg-badge-midia/10 text-badge-midia',
};

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

interface PropertyCardProps {
  property: Property;
  isSelected: boolean;
  onClick: () => void;
  onExpand?: () => void;
}

const PropertyCard = forwardRef<HTMLDivElement, PropertyCardProps>(({ property, isSelected, onClick, onExpand }, ref) => {
  const [expanded, setExpanded] = useState(false);
  const isMidia = property.type === 'midia';

  return (
    <div
      ref={ref}
      className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden group hover:shadow-lg ${
        isSelected
          ? 'border-primary shadow-lg ring-2 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30'
      }`}
    >
      <button onClick={onClick} className="w-full text-left">
        <ImageCarousel images={property.images} alt={property.title} className="w-full h-36" disableDrag />
        <div className="relative -mt-6 ml-2.5">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[property.type]}`}>
            {propertyTypeLabels[property.type]}
          </span>
        </div>
        <div className="p-3.5 pt-1.5">
          <h3 className="font-semibold text-sm text-card-foreground leading-tight line-clamp-1">
            {property.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin size={12} strokeWidth={SW} /> {property.neighborhood}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Ruler size={12} strokeWidth={SW} /> {property.area}m²</span>
            {!isMidia && property.bedrooms != null && <span className="flex items-center gap-1"><BedDouble size={12} strokeWidth={SW} /> {property.bedrooms}</span>}
            {!isMidia && property.bathrooms != null && <span className="flex items-center gap-1"><Bath size={12} strokeWidth={SW} /> {property.bathrooms}</span>}
            {!isMidia && property.garageSpaces != null && <span className="flex items-center gap-1"><Car size={12} strokeWidth={SW} /> {property.garageSpaces}</span>}
            {isMidia && property.mediaType && (
              <span className="flex items-center gap-1"><Megaphone size={12} strokeWidth={SW} /> {mediaTypeLabels[property.mediaType]}</span>
            )}
          </div>
          <p className="font-bold text-primary mt-2.5 text-lg">{formatPrice(property.price)}</p>
        </div>
      </button>

      <div className="px-3.5 pb-2">
        <button
          onClick={(e) => { e.stopPropagation(); onExpand ? onExpand() : setExpanded(!expanded); }}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          {!onExpand && expanded ? <ChevronUp size={14} strokeWidth={SW} /> : <ChevronDown size={14} strokeWidth={SW} />}
          {!onExpand ? (expanded ? 'Menos detalhes' : 'Mais detalhes') : 'Ver detalhes'}
        </button>
      </div>

      {!onExpand && expanded && (
        <div className="px-3.5 pb-3.5 space-y-2 animate-accordion-down">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin size={11} strokeWidth={SW} /> {property.address}
          </p>
          <p className="text-xs text-foreground/80 leading-relaxed">{property.description}</p>
          <a
            href={getWhatsAppLink(property)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 mt-1 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg"
          >
            <MessageCircle size={14} strokeWidth={SW} />
            Falar no WhatsApp
          </a>
        </div>
      )}
    </div>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;

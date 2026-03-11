import { Property, propertyTypeLabels, getWhatsAppLink } from '@/data/properties';
import { MapPin, BedDouble, Bath, Ruler, Car, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, forwardRef } from 'react';
import ImageCarousel from './ImageCarousel';

const typeColors: Record<string, string> = {
  casa: 'bg-badge-casa/10 text-badge-casa',
  apartamento: 'bg-badge-apartamento/10 text-badge-apartamento',
  terreno: 'bg-badge-terreno/10 text-badge-terreno',
  comercial: 'bg-badge-comercial/10 text-badge-comercial',
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
        <ImageCarousel images={property.images} alt={property.title} className="w-full h-36" />
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
            <MapPin size={12} /> {property.neighborhood}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Ruler size={12} /> {property.area}m²</span>
            {property.bedrooms != null && <span className="flex items-center gap-1"><BedDouble size={12} /> {property.bedrooms}</span>}
            {property.bathrooms != null && <span className="flex items-center gap-1"><Bath size={12} /> {property.bathrooms}</span>}
            {property.garageSpaces != null && <span className="flex items-center gap-1"><Car size={12} /> {property.garageSpaces}</span>}
          </div>
          <p className="font-bold text-primary mt-2.5 text-lg">{formatPrice(property.price)}</p>
        </div>
      </button>

      {/* Expand / Collapse */}
      <div className="px-3.5 pb-2">
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Menos detalhes' : 'Mais detalhes'}
        </button>
      </div>

      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-2 animate-accordion-down">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin size={11} /> {property.address}
          </p>
          <p className="text-xs text-foreground/80 leading-relaxed">{property.description}</p>
          <a
            href={getWhatsAppLink(property)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 mt-1 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md hover:shadow-lg"
          >
            <MessageCircle size={14} />
            Falar no WhatsApp
          </a>
        </div>
      )}
    </div>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;

import { Property, propertyTypeLabels } from '@/data/properties';
import { MapPin, BedDouble, Bath, Ruler } from 'lucide-react';

const typeColors: Record<string, string> = {
  casa: 'bg-badge-casa/10 text-badge-casa',
  apartamento: 'bg-badge-apartamento/10 text-badge-apartamento',
  terreno: 'bg-badge-terreno/10 text-badge-terreno',
};

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

interface PropertyCardProps {
  property: Property;
  isSelected: boolean;
  onClick: () => void;
}

export default function PropertyCard({ property, isSelected, onClick }: PropertyCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden group hover:shadow-lg ${
        isSelected
          ? 'border-primary shadow-lg ring-2 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30'
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className={`absolute top-2.5 left-2.5 text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[property.type]}`}>
          {propertyTypeLabels[property.type]}
        </span>
      </div>
      <div className="p-3.5">
        <h3 className="font-semibold text-sm text-card-foreground leading-tight line-clamp-1">
          {property.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <MapPin size={12} /> {property.neighborhood}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Ruler size={12} /> {property.area}m²</span>
          {property.bedrooms && <span className="flex items-center gap-1"><BedDouble size={12} /> {property.bedrooms}</span>}
          {property.bathrooms && <span className="flex items-center gap-1"><Bath size={12} /> {property.bathrooms}</span>}
        </div>
        <p className="font-bold text-primary mt-2.5 text-lg">{formatPrice(property.price)}</p>
      </div>
    </button>
  );
}

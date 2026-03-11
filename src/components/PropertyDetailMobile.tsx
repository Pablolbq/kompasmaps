import { Property, propertyTypeLabels, getWhatsAppLink } from '@/data/properties';
import { MapPin, BedDouble, Bath, Ruler, Car, MessageCircle, ArrowLeft } from 'lucide-react';
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

interface Props {
  property: Property;
  onBack: () => void;
}

export default function PropertyDetailMobile({ property, onBack }: Props) {
  return (
    <div className="fixed inset-0 z-[2000] bg-background flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header with back button */}
      <header className="flex items-center gap-3 px-3 py-3 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-1 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-semibold text-sm text-foreground line-clamp-1 flex-1">{property.title}</h1>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Large carousel */}
        <ImageCarousel images={property.images} alt={property.title} className="w-full h-64" />

        <div className="p-4 space-y-4">
          <div>
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[property.type]}`}>
              {propertyTypeLabels[property.type]}
            </span>
            <h2 className="font-bold text-xl text-foreground mt-2 leading-tight">{property.title}</h2>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <MapPin size={14} /> {property.address} — {property.neighborhood}
            </p>
          </div>

          <p className="font-bold text-primary text-2xl">{formatPrice(property.price)}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5"><Ruler size={14} /> {property.area}m²</span>
            {property.bedrooms != null && <span className="flex items-center gap-1.5"><BedDouble size={14} /> {property.bedrooms} quartos</span>}
            {property.bathrooms != null && <span className="flex items-center gap-1.5"><Bath size={14} /> {property.bathrooms} banheiros</span>}
            {property.garageSpaces != null && <span className="flex items-center gap-1.5"><Car size={14} /> {property.garageSpaces} vagas</span>}
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed">{property.description}</p>

          <a
            href={getWhatsAppLink(property)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md hover:shadow-lg transition-all"
          >
            <MessageCircle size={16} />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

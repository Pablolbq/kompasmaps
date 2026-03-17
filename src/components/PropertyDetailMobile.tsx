import { useState } from 'react';
import { Property, propertyTypeLabels, getWhatsAppLink, mediaTypeLabels } from '@/data/properties';
import { MapPin, BedDouble, Bath, Ruler, Car, MessageCircle, ArrowLeft, Megaphone, Share2 } from 'lucide-react';
import ImageCarousel, { ImageLightbox } from './ImageCarousel';
import FavoriteButton from './FavoriteButton';
import { toast } from 'sonner';

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

interface Props {
  property: Property;
  onBack: () => void;
}

export default function PropertyDetailMobile({ property, onBack }: Props) {
  const isMidia = property.type === 'midia';
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-background flex flex-col animate-in slide-in-from-right duration-200">
        <header className="flex items-center gap-3 px-3 py-3 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={onBack}
            className="p-2 -ml-1 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={SW} className="text-foreground" />
          </button>
          <h1 className="font-semibold text-sm text-foreground line-clamp-1 flex-1">{property.title}</h1>
          <div className="flex items-center gap-1">
            <FavoriteButton propertyId={property.id} />
            <button
              onClick={() => {
                const url = `${window.location.origin}/imovel/${property.id}`;
                navigator.clipboard.writeText(url);
                toast.success('Link copiado!');
              }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Compartilhar"
            >
              <Share2 size={18} strokeWidth={1.5} className="text-muted-foreground" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <ImageCarousel
            images={property.images}
            alt={property.title}
            className="w-full h-56"
            onOpenFullscreen={(i) => setLightboxIndex(i)}
          />

          <div className="p-4 space-y-4">
            <div>
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[property.type]}`}>
                {propertyTypeLabels[property.type]}
              </span>
              <h2 className="font-bold text-xl text-foreground mt-2 leading-tight">{property.title}</h2>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin size={14} strokeWidth={SW} /> {property.address} — {property.neighborhood}
              </p>
            </div>

            <p className="font-bold text-primary text-2xl">{formatPrice(property.price)}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5"><Ruler size={14} strokeWidth={SW} /> {property.area}m²</span>
              {!isMidia && property.bedrooms != null && <span className="flex items-center gap-1.5"><BedDouble size={14} strokeWidth={SW} /> {property.bedrooms} quartos</span>}
              {!isMidia && property.bathrooms != null && <span className="flex items-center gap-1.5"><Bath size={14} strokeWidth={SW} /> {property.bathrooms} banheiros</span>}
              {!isMidia && property.garageSpaces != null && <span className="flex items-center gap-1.5"><Car size={14} strokeWidth={SW} /> {property.garageSpaces} vagas</span>}
              {isMidia && property.mediaType && (
                <span className="flex items-center gap-1.5"><Megaphone size={14} strokeWidth={SW} /> {mediaTypeLabels[property.mediaType]}</span>
              )}
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed">{property.description}</p>

            <a
              href={getWhatsAppLink(property)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all"
            >
              <MessageCircle size={16} strokeWidth={SW} />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={property.images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

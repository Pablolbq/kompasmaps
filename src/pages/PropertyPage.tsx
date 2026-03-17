import { useParams, Link } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';
import { propertyTypeLabels, getWhatsAppLink, mediaTypeLabels, formatPrice } from '@/data/properties';
import ImageCarousel, { ImageLightbox } from '@/components/ImageCarousel';
import { MapPin, BedDouble, Bath, Ruler, Car, MessageCircle, Megaphone, ArrowLeft, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import FavoriteButton from '@/components/FavoriteButton';

const SW = 1.5;

const typeColors: Record<string, string> = {
  casa: 'bg-badge-casa/10 text-badge-casa',
  apartamento: 'bg-badge-apartamento/10 text-badge-apartamento',
  terreno: 'bg-badge-terreno/10 text-badge-terreno',
  comercial: 'bg-badge-comercial/10 text-badge-comercial',
  midia: 'bg-badge-midia/10 text-badge-midia',
};

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { data: properties = [], isLoading } = useProperties();
  const property = properties.find((p) => p.id === id);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: property?.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Imóvel não encontrado</p>
        <Link to="/" className="text-primary hover:underline text-sm">← Voltar ao mapa</Link>
      </div>
    );
  }

  const isMidia = property.type === 'midia';

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Link to="/" className="p-2 -ml-1 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft size={20} strokeWidth={SW} className="text-foreground" />
        </Link>
        <h1 className="font-semibold text-sm text-foreground line-clamp-1 flex-1">{property.title}</h1>
        <div className="flex items-center gap-1">
          <FavoriteButton propertyId={property.id} />
          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Compartilhar"
          >
            <Share2 size={18} strokeWidth={SW} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <ImageCarousel
          images={property.images}
          alt={property.title}
          className="w-full h-56 md:h-72"
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
            {isMidia && property.mediaType && <span className="flex items-center gap-1.5"><Megaphone size={14} strokeWidth={SW} /> {mediaTypeLabels[property.mediaType]}</span>}
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed">{property.description}</p>

          <div className="flex items-center gap-2 flex-wrap pb-8">
            <a
              href={getWhatsAppLink(property)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all"
            >
              <MessageCircle size={16} strokeWidth={SW} />
              Falar no WhatsApp
            </a>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-md transition-all"
            >
              <Share2 size={16} strokeWidth={SW} />
              Compartilhar
            </button>
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
    </div>
  );
}

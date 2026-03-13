import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Property, propertyTypeLabels, getWhatsAppLink, mediaTypeLabels } from "@/data/properties";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MapPin, BedDouble, Bath, Ruler, Car, MessageCircle, Megaphone, MapPinned } from "lucide-react";
import ImageCarousel, { ImageLightbox } from "./ImageCarousel";

const SW = 1.5;

const typeColors: Record<string, string> = {
  casa: "bg-badge-casa/10 text-badge-casa",
  apartamento: "bg-badge-apartamento/10 text-badge-apartamento",
  terreno: "bg-badge-terreno/10 text-badge-terreno",
  comercial: "bg-badge-comercial/10 text-badge-comercial",
  midia: "bg-badge-midia/10 text-badge-midia",
};

function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

interface Props {
  property: Property | null;
  open: boolean;
  onClose: () => void;
  onViewOnMap?: (id: string) => void;
}

export default function PropertyDetailDialog({ property, open, onClose, onViewOnMap }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setLightboxIndex(null);
    }
  }, [open]);

  if (!property) return null;
  const isMidia = property.type === "midia";

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o && lightboxIndex === null) {
            onClose();
          }
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          className="max-w-xl p-0 overflow-hidden max-h-[85vh] [&>button.absolute]:hidden"
        >
          <DialogTitle className="sr-only">{property.title}</DialogTitle>
          <div className="overflow-y-auto max-h-[85vh]">
            <ImageCarousel
              images={property.images}
              alt={property.title}
              className="w-full h-48 md:h-56 cursor-pointer"
              hideZoom
              onClickCenter={(i) => setLightboxIndex(i)}
              onOpenFullscreen={(i) => setLightboxIndex(i)}
            />

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[property.type]}`}
                  >
                    {propertyTypeLabels[property.type]}
                  </span>
                  <h2 className="font-bold text-lg text-foreground mt-1.5 leading-tight">{property.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                    <MapPin size={14} strokeWidth={SW} /> {property.address} — {property.neighborhood}
                  </p>
                </div>
                <p className="font-bold text-primary text-xl whitespace-nowrap">{formatPrice(property.price)}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Ruler size={14} strokeWidth={SW} /> {property.area}m²
                </span>
                {!isMidia && property.bedrooms != null && (
                  <span className="flex items-center gap-1.5">
                    <BedDouble size={14} strokeWidth={SW} /> {property.bedrooms} quartos
                  </span>
                )}
                {!isMidia && property.bathrooms != null && (
                  <span className="flex items-center gap-1.5">
                    <Bath size={14} strokeWidth={SW} /> {property.bathrooms} banheiros
                  </span>
                )}
                {!isMidia && property.garageSpaces != null && (
                  <span className="flex items-center gap-1.5">
                    <Car size={14} strokeWidth={SW} /> {property.garageSpaces} vagas
                  </span>
                )}
                {isMidia && property.mediaType && (
                  <span className="flex items-center gap-1.5">
                    <Megaphone size={14} strokeWidth={SW} /> {mediaTypeLabels[property.mediaType]}
                  </span>
                )}
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed">{property.description}</p>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={getWhatsAppLink(property)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all"
                >
                  <MessageCircle size={16} strokeWidth={SW} />
                  Falar no WhatsApp
                </a>

                {onViewOnMap && (
                  <button
                    onClick={() => onViewOnMap(property.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <MapPinned size={16} strokeWidth={SW} />
                    Ver no mapa
                  </button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Renderiza o lightbox via portal diretamente no body, fora do contexto do Dialog do Radix UI,
          garantindo que z-index e pointer-events funcionem corretamente */}
      {lightboxIndex !== null &&
        ReactDOM.createPortal(
          <ImageLightbox images={property.images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />,
          document.body,
        )}
    </>
  );
}

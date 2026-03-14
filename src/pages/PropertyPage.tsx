import { useParams, useNavigate } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import PropertyDetailMobile from "@/components/PropertyDetailMobile";
import PropertyDetailDialog from "@/components/PropertyDetailDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: properties = [], isLoading } = useProperties();

  const property = properties.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-lg text-muted-foreground">Imóvel não encontrado</p>
        <button onClick={() => navigate("/")} className="text-primary font-medium hover:underline">
          Voltar ao mapa
        </button>
      </div>
    );
  }

  if (isMobile) {
    return <PropertyDetailMobile property={property} onBack={() => navigate("/")} />;
  }

  return (
    <PropertyDetailDialog
      property={property}
      open={true}
      onClose={() => navigate("/")}
      onViewOnMap={(propId) => navigate(`/?imovel=${propId}`)}
    />
  );
}

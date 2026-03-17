import { useState, useMemo, useCallback, useRef, TouchEvent as RTE } from "react";
import L from "leaflet";
import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import { PropertyType, ListingType, WHATSAPP_NUMBER } from "@/data/properties";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import PropertyMap, { PropertyMapHandle } from "@/components/PropertyMap";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters, { AdvancedFilters, emptyAdvancedFilters } from "@/components/PropertyFilters";
import PropertyDetailDialog from "@/components/PropertyDetailDialog";
import PropertyDetailMobile from "@/components/PropertyDetailMobile";
import { Search, X, Loader2, MapPin, MessageCircle, User, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import logoIcon from "@/assets/logo-icon.png";

const Index = () => {
  const isMobile = useIsMobile();
  const { data: properties = [], isLoading } = useProperties();
  const { session, signOut } = useAuth();
  const [activeTypes, setActiveTypes] = useState<PropertyType[]>(["casa"]);
  const [activeListingTypes, setActiveListingTypes] = useState<ListingType[]>(["venda", "aluguel"]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyAdvancedFilters);
  const [detailProperty, setDetailProperty] = useState<string | null>(null);
  const [sheetMode, setSheetMode] = useState<"half" | "full" | "mini">("half");
  const [firstInteraction, setFirstInteraction] = useState(true);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  // Dragging state
  const [dragTop, setDragTop] = useState<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const sheetStartTop = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mapRef = useRef<PropertyMapHandle>(null);
  const [focusPropertyId, setFocusPropertyId] = useState<string | null>(null);

  // Filter properties by type, listing type, search, and advanced filters
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (!activeTypes.includes(p.type)) return false;
      if (!activeListingTypes.includes(p.listingType)) return false;
      if (
        search &&
        !(
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
          p.address.toLowerCase().includes(search.toLowerCase())
        )
      )
        return false;

      // Advanced filters don't apply to mídia
      if (p.type === "midia") return true;

      const af = advancedFilters;
      if (af.priceMin != null && p.price < af.priceMin) return false;
      if (af.priceMax != null && p.price > af.priceMax) return false;
      if (af.bedroomsMin != null && (p.bedrooms ?? 0) < af.bedroomsMin) return false;
      if (af.bathroomsMin != null && (p.bathrooms ?? 0) < af.bathroomsMin) return false;
      if (af.garageMin != null && (p.garageSpaces ?? 0) < af.garageMin) return false;
      if (af.areaMin != null && p.area < af.areaMin) return false;
      if (af.areaMax != null && p.area > af.areaMax) return false;
      return true;
    });
  }, [properties, activeTypes, activeListingTypes, search, advancedFilters]);

  // Properties visible on map (for sidebar list)
  const visibleProperties = useMemo(() => {
    if (!mapBounds) return filteredProperties;
    return filteredProperties.filter((p) => mapBounds.contains([p.lat, p.lng]));
  }, [filteredProperties, mapBounds]);

  const toggleType = useCallback(
    (type: PropertyType) => {
      if (firstInteraction) {
        setFirstInteraction(false);
        setActiveTypes([type]);
      } else {
        setActiveTypes((prev) => {
          if (prev.includes(type)) {
            if (prev.length === 1) return prev;
            return prev.filter((t) => t !== type);
          }
          return [...prev, type];
        });
      }
    },
    [firstInteraction],
  );

  const toggleListingType = useCallback((lt: ListingType) => {
    setActiveListingTypes((prev) => {
      if (prev.includes(lt)) {
        if (prev.length === 1) return prev; // don't deselect all
        return prev.filter((t) => t !== lt);
      }
      return [...prev, lt];
    });
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (isMobile) {
        setSheetMode((m) => (m === "mini" ? "half" : m));
      } else {
        setTimeout(() => {
          cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 100);
      }
    },
    [isMobile],
  );

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    setMapBounds(bounds);
  }, []);

  const focusMapProperty = useCallback((id: string) => {
    setSelectedId(id);

    if (mapRef.current) {
      mapRef.current.focusProperty(id);
      return;
    }

    setFocusPropertyId(id);
  }, []);

  const selectedProperty = selectedId ? filteredProperties.find((p) => p.id === selectedId) : null;
  const detailProp = detailProperty ? filteredProperties.find((p) => p.id === detailProperty) : null;

  const contactLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Gostaria de falar com vocês.")}`;

  // ─── MOBILE LAYOUT ────────────────────────────────────
  if (isMobile) {
    return (
      <div className="h-[100dvh] flex flex-col bg-background">
        <header className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center">
            <img src={logoImg} alt="Kompas" className="h-7 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                strokeWidth={1.5}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-secondary text-xs text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30 w-32 transition-all"
              />
            </div>
            <a
              href={contactLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent text-accent-foreground text-[11px] font-semibold whitespace-nowrap shadow-sm hover:shadow-md transition-all"
            >
              <MessageCircle size={13} strokeWidth={1.5} />
              Contato
            </a>
          </div>
        </header>

        <div className="px-3 py-2 border-b border-border bg-card flex-shrink-0">
          <PropertyFilters
            activeTypes={activeTypes}
            onToggleType={toggleType}
            activeListingTypes={activeListingTypes}
            onToggleListingType={toggleListingType}
            total={visibleProperties.length}
            advancedFilters={advancedFilters}
            onAdvancedFiltersChange={setAdvancedFilters}
          />
        </div>

        <div className="flex-1 relative overflow-hidden" ref={containerRef}>
          <div className="absolute inset-0">
            <PropertyMap
              properties={filteredProperties}
              selectedId={selectedId}
              onSelect={handleSelect}
              onDeselect={() => setSelectedId(null)}
              onBoundsChange={handleBoundsChange}
              isMobile
            />
          </div>

          <div
            className="absolute left-0 right-0 z-[1000] bg-card rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-border flex flex-col will-change-transform"
            style={{
              top: 0,
              height: "100%",
              transform:
                dragTop !== null
                  ? `translateY(${dragTop}px)`
                  : sheetMode === "full"
                    ? "translateY(0)"
                    : sheetMode === "half"
                      ? "translateY(50%)"
                      : `translateY(calc(100% - 3rem))`,
              transition: dragTop !== null ? "none" : "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            <div
              className="flex justify-center py-5 flex-shrink-0 cursor-grab touch-none"
              onTouchStart={(e: RTE<HTMLDivElement>) => {
                const sheet = e.currentTarget.parentElement as HTMLElement;
                touchStartY.current = e.touches[0].clientY;
                const matrix = new DOMMatrix(getComputedStyle(sheet).transform);
                sheetStartTop.current = matrix.m42;
              }}
              onTouchMove={(e: RTE<HTMLDivElement>) => {
                if (touchStartY.current === null || sheetStartTop.current === null || !containerRef.current) return;
                e.preventDefault();
                const delta = e.touches[0].clientY - touchStartY.current;
                const containerH = containerRef.current.clientHeight;
                const newTop = Math.max(0, Math.min(containerH - 48, sheetStartTop.current + delta));
                setDragTop(newTop);
              }}
              onTouchEnd={() => {
                if (dragTop === null || !containerRef.current) {
                  touchStartY.current = null;
                  sheetStartTop.current = null;
                  return;
                }
                const containerH = containerRef.current.clientHeight;
                const ratio = dragTop / containerH;
                if (ratio < 0.25) setSheetMode("full");
                else if (ratio < 0.75) setSheetMode("half");
                else setSheetMode("mini");
                setDragTop(null);
                touchStartY.current = null;
                sheetStartTop.current = null;
              }}
            >
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/40" />
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {selectedProperty ? (
                <div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} /> Voltar à lista
                  </button>
                  <PropertyCard
                    property={selectedProperty}
                    isSelected={true}
                    onClick={() => setDetailProperty(selectedProperty.id)}
                    onExpand={() => setDetailProperty(selectedProperty.id)}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleProperties.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin size={28} strokeWidth={1.5} className="mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-medium">Nenhum imóvel encontrado</p>
                    </div>
                  ) : (
                    visibleProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        isSelected={selectedId === property.id}
                        onClick={() => {
                          handleSelect(property.id);
                          setDetailProperty(property.id);
                          focusMapProperty(property.id);
                        }}
                        onExpand={() => {
                          setDetailProperty(property.id);
                          focusMapProperty(property.id);
                        }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {detailProp && <PropertyDetailMobile property={detailProp} onBack={() => setDetailProperty(null)} />}
      </div>
    );
  }

  // ─── DESKTOP LAYOUT ────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center">
          <img src={logoImg} alt="Kompas" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={15}
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Buscar bairro, rua..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30 w-56 transition-all"
            />
          </div>
          <a
            href={contactLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <MessageCircle size={15} strokeWidth={1.5} />
            Fale conosco
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-[340px] flex-shrink-0 border-r border-border flex-col bg-card">
          <div className="p-4 border-b border-border">
            <PropertyFilters
              activeTypes={activeTypes}
              onToggleType={toggleType}
              activeListingTypes={activeListingTypes}
              onToggleListingType={toggleListingType}
              total={visibleProperties.length}
              advancedFilters={advancedFilters}
              onAdvancedFiltersChange={setAdvancedFilters}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {visibleProperties.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin size={32} strokeWidth={1.5} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Nenhum imóvel encontrado</p>
                <p className="text-xs mt-1">Tente ajustar os filtros</p>
              </div>
            ) : (
              visibleProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  ref={(el) => {
                    cardRefs.current[property.id] = el;
                  }}
                  property={property}
                  isSelected={selectedId === property.id}
                  onClick={() => {
                    // RESTAURADO: Abre o dialog e foca o pin ao clicar no card lateral
                    handleSelect(property.id);
                    setDetailProperty(property.id);
                    focusMapProperty(property.id);
                  }}
                  onExpand={() => {
                    setDetailProperty(property.id);
                    focusMapProperty(property.id);
                  }}
                />
              ))
            )}
          </div>
        </aside>

        <main className="flex flex-1 relative">
          <PropertyMap
            ref={mapRef}
            properties={filteredProperties}
            selectedId={selectedId}
            onSelect={handleSelect}
            onDeselect={() => setSelectedId(null)}
            onExpand={(id) => setDetailProperty(id)}
            onBoundsChange={handleBoundsChange}
            focusPropertyId={focusPropertyId}
            onFocusDone={() => setFocusPropertyId(null)}
          />
        </main>
      </div>

      <PropertyDetailDialog
        property={detailProp ?? null}
        open={!!detailProperty}
        onClose={() => {
          const closingId = detailProperty;
          setDetailProperty(null);

          // Aguarda o Dialog fechar e garante que o mapa receba foco
          if (closingId) {
            setTimeout(() => {
              focusMapProperty(closingId);
            }, 400);
          }
        }}
        onViewOnMap={(id) => {
          setDetailProperty(null);
          setTimeout(() => {
            focusMapProperty(id);
          }, 400);
        }}
      />
    </div>
  );
};

export default Index;

import { useState, useMemo, useCallback, useRef, TouchEvent as RTE } from 'react';
import { properties, PropertyType } from '@/data/properties';
import PropertyMap from '@/components/PropertyMap';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters, { AdvancedFilters, emptyAdvancedFilters } from '@/components/PropertyFilters';
import PropertyDetailDialog from '@/components/PropertyDetailDialog';
import { MapPin, Search, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  const [activeTypes, setActiveTypes] = useState<PropertyType[]>(['casa', 'apartamento', 'terreno', 'comercial']);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyAdvancedFilters);
  const [detailProperty, setDetailProperty] = useState<string | null>(null);
  const [sheetMode, setSheetMode] = useState<'half' | 'full' | 'mini'>('half');
  // Dragging state
  const [dragTop, setDragTop] = useState<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const sheetStartTop = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (!activeTypes.includes(p.type)) return false;
      if (search && !(
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
      )) return false;

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
  }, [activeTypes, search, advancedFilters]);

  const toggleType = useCallback((type: PropertyType) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    if (isMobile) {
      // When handle is minimized, expand to half so the card is visible
      setSheetMode((m) => m === 'mini' ? 'half' : m);
    } else {
      setTimeout(() => {
        cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [isMobile]);

  const selectedProperty = selectedId ? filteredProperties.find(p => p.id === selectedId) : null;
  const detailProp = detailProperty ? filteredProperties.find(p => p.id === detailProperty) : null;

  // ─── MOBILE LAYOUT ────────────────────────────────────
  if (isMobile) {
    return (
      <div className="h-[100dvh] flex flex-col bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <MapPin size={14} className="text-primary-foreground" />
            </div>
            <h1 className="font-bold text-sm text-foreground">ImovelMap</h1>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-secondary text-xs text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30 w-36 transition-all"
            />
          </div>
        </header>

        {/* Filters */}
        <div className="px-3 py-2 border-b border-border bg-card flex-shrink-0">
          <PropertyFilters
            activeTypes={activeTypes}
            onToggleType={toggleType}
            total={filteredProperties.length}
            advancedFilters={advancedFilters}
            onAdvancedFiltersChange={setAdvancedFilters}
          />
        </div>

        {/* Map + draggable bottom sheet */}
        <div className="flex-1 relative overflow-hidden" ref={containerRef}>
          {/* Map fills entire area */}
          <div className="absolute inset-0">
            <PropertyMap
              properties={filteredProperties}
              selectedId={selectedId}
              onSelect={handleSelect}
              onDeselect={() => setSelectedId(null)}
              isMobile
            />
          </div>

          {/* Bottom sheet */}
          <div
            className="absolute left-0 right-0 bottom-0 z-[1000] bg-card rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-border flex flex-col"
            style={{
              top: dragTop !== null
                ? `${dragTop}px`
                : sheetMode === 'full' ? '0px' : sheetMode === 'half' ? '50%' : 'calc(100% - 3rem)',
              transition: dragTop !== null ? 'none' : 'top 0.3s ease-out',
            }}
          >
            {/* Handle — drag to resize */}
            <div
              className="flex justify-center py-5 flex-shrink-0 cursor-grab touch-none"
              onTouchStart={(e: RTE<HTMLDivElement>) => {
                const containerH = containerRef.current?.getBoundingClientRect();
                const sheet = (e.currentTarget.parentElement as HTMLElement);
                touchStartY.current = e.touches[0].clientY;
                sheetStartTop.current = sheet.offsetTop;
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
                // Snap to closest: full (<25%), half (25-75%), mini (>75%)
                if (ratio < 0.25) setSheetMode('full');
                else if (ratio < 0.75) setSheetMode('half');
                else setSheetMode('mini');
                setDragTop(null);
                touchStartY.current = null;
                sheetStartTop.current = null;
              }}
            >
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/40" />
            </div>

            {/* Content */}
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
                  {filteredProperties.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin size={28} className="mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-medium">Nenhum imóvel encontrado</p>
                    </div>
                  ) : (
                    filteredProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        isSelected={selectedId === property.id}
                        onClick={() => handleSelect(property.id)}
                        onExpand={() => setDetailProperty(property.id)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail dialog for mobile */}
        <PropertyDetailDialog
          property={detailProp ?? null}
          open={!!detailProperty}
          onClose={() => setDetailProperty(null)}
        />
      </div>
    );
  }

  // ─── DESKTOP LAYOUT ────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MapPin size={18} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-base text-foreground leading-tight">ImovelMap</h1>
            <p className="text-[11px] text-muted-foreground">Ponta Grossa, PR</p>
          </div>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar bairro, rua..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30 w-56 transition-all"
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-[340px] flex-shrink-0 border-r border-border flex-col bg-card">
          <div className="p-4 border-b border-border">
            <PropertyFilters
              activeTypes={activeTypes}
              onToggleType={toggleType}
              total={filteredProperties.length}
              advancedFilters={advancedFilters}
              onAdvancedFiltersChange={setAdvancedFilters}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Nenhum imóvel encontrado</p>
                <p className="text-xs mt-1">Tente ajustar os filtros</p>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  ref={(el) => { cardRefs.current[property.id] = el; }}
                  property={property}
                  isSelected={selectedId === property.id}
                  onClick={() => { handleSelect(property.id); setDetailProperty(property.id); }}
                  onExpand={() => setDetailProperty(property.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Map */}
        <main className="flex flex-1 relative">
          <PropertyMap
            properties={filteredProperties}
            selectedId={selectedId}
            onSelect={handleSelect}
            onDeselect={() => setSelectedId(null)}
          />
        </main>
      </div>

      {/* Detail dialog */}
      <PropertyDetailDialog
        property={detailProp ?? null}
        open={!!detailProperty}
        onClose={() => setDetailProperty(null)}
      />
    </div>
  );
};

export default Index;

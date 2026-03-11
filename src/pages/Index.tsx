import { useState, useMemo, useCallback } from 'react';
import { properties, PropertyType } from '@/data/properties';
import PropertyMap from '@/components/PropertyMap';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters, { AdvancedFilters, emptyAdvancedFilters } from '@/components/PropertyFilters';
import { MapPin, Search, Map, List } from 'lucide-react';

const Index = () => {
  const [activeTypes, setActiveTypes] = useState<PropertyType[]>(['casa', 'apartamento', 'terreno', 'comercial']);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyAdvancedFilters);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

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
            <p className="text-[11px] text-muted-foreground hidden sm:block">Ponta Grossa, PR</p>
          </div>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar bairro, rua..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30 w-40 sm:w-56 transition-all"
          />
        </div>
      </header>

      {/* Mobile toggle */}
      <div className="md:hidden flex border-b border-border bg-card">
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors ${
            mobileView === 'list' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
          }`}
        >
          <List size={16} /> Imóveis
        </button>
        <button
          onClick={() => setMobileView('map')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors ${
            mobileView === 'map' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
          }`}
        >
          <Map size={16} /> Mapa
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile when map is showing */}
        <aside className={`${mobileView === 'map' ? 'hidden' : 'flex'} md:flex w-full md:w-[340px] flex-shrink-0 md:border-r border-border flex-col bg-card`}>
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
                  property={property}
                  isSelected={selectedId === property.id}
                  onClick={() => setSelectedId(property.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Map - hidden on mobile when list is showing */}
        <main className={`${mobileView === 'list' ? 'hidden' : 'flex'} md:flex flex-1 relative`}>
          <PropertyMap
            properties={filteredProperties}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </main>
      </div>
    </div>
  );
};

export default Index;

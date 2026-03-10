import { useState, useMemo, useCallback } from 'react';
import { properties, PropertyType } from '@/data/properties';
import PropertyMap from '@/components/PropertyMap';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import { MapPin, Search } from 'lucide-react';

const Index = () => {
  const [activeTypes, setActiveTypes] = useState<PropertyType[]>(['casa', 'apartamento', 'terreno']);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchesType = activeTypes.includes(p.type);
      const matchesSearch =
        search === '' ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [activeTypes, search]);

  const toggleType = useCallback((type: PropertyType) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm">
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
        <aside className="w-[340px] flex-shrink-0 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <PropertyFilters
              activeTypes={activeTypes}
              onToggleType={toggleType}
              total={filteredProperties.length}
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

        {/* Map */}
        <main className="flex-1 relative">
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

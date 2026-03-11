import { PropertyType, propertyTypeLabels } from '@/data/properties';
import { Home, Building2, LandPlot, Store, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

const SW = 1.5;

const typeIcons: Record<PropertyType, React.ReactNode> = {
  casa: <Home size={16} strokeWidth={SW} />,
  apartamento: <Building2 size={16} strokeWidth={SW} />,
  terreno: <LandPlot size={16} strokeWidth={SW} />,
  comercial: <Store size={16} strokeWidth={SW} />,
};

export interface AdvancedFilters {
  priceMin: number | null;
  priceMax: number | null;
  bedroomsMin: number | null;
  bathroomsMin: number | null;
  garageMin: number | null;
  areaMin: number | null;
  areaMax: number | null;
}

export const emptyAdvancedFilters: AdvancedFilters = {
  priceMin: null, priceMax: null, bedroomsMin: null, bathroomsMin: null, garageMin: null, areaMin: null, areaMax: null,
};

interface PropertyFiltersProps {
  activeTypes: PropertyType[];
  onToggleType: (type: PropertyType) => void;
  total: number;
  advancedFilters: AdvancedFilters;
  onAdvancedFiltersChange: (filters: AdvancedFilters) => void;
}

function NumberInput({ label, value, onChange, placeholder }: { label: string; value: number | null; onChange: (v: number | null) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        placeholder={placeholder}
        className="px-2.5 py-1.5 rounded-md bg-secondary text-xs text-foreground border border-border outline-none focus:ring-2 focus:ring-primary/30 w-full"
      />
    </div>
  );
}

export default function PropertyFilters({ activeTypes, onToggleType, total, advancedFilters, onAdvancedFiltersChange }: PropertyFiltersProps) {
  const types: PropertyType[] = ['casa', 'apartamento', 'terreno', 'comercial'];
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasAdvanced = Object.values(advancedFilters).some((v) => v !== null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-foreground tracking-tight">Filtros</h2>
        <span className="text-xs text-muted-foreground font-medium">
          {total} {total === 1 ? 'imóvel' : 'imóveis'}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {types.map((type) => {
          const isActive = activeTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => onToggleType(type)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {typeIcons[type]}
              {propertyTypeLabels[type]}
            </button>
          );
        })}
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${hasAdvanced ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <SlidersHorizontal size={14} strokeWidth={SW} />
        Busca avançada
        {hasAdvanced && (
          <span
            onClick={(e) => { e.stopPropagation(); onAdvancedFiltersChange(emptyAdvancedFilters); }}
            className="ml-1 hover:text-destructive"
          >
            <X size={12} strokeWidth={SW} />
          </span>
        )}
      </button>

      {showAdvanced && (
        <div className="grid grid-cols-2 gap-2 pt-1 animate-accordion-down">
          <NumberInput label="Preço mín" value={advancedFilters.priceMin} onChange={(v) => onAdvancedFiltersChange({ ...advancedFilters, priceMin: v })} placeholder="R$" />
          <NumberInput label="Preço máx" value={advancedFilters.priceMax} onChange={(v) => onAdvancedFiltersChange({ ...advancedFilters, priceMax: v })} placeholder="R$" />
          <NumberInput label="Quartos mín" value={advancedFilters.bedroomsMin} onChange={(v) => onAdvancedFiltersChange({ ...advancedFilters, bedroomsMin: v })} />
          <NumberInput label="Banheiros mín" value={advancedFilters.bathroomsMin} onChange={(v) => onAdvancedFiltersChange({ ...advancedFilters, bathroomsMin: v })} />
          <NumberInput label="Vagas mín" value={advancedFilters.garageMin} onChange={(v) => onAdvancedFiltersChange({ ...advancedFilters, garageMin: v })} />
          <NumberInput label="Área mín (m²)" value={advancedFilters.areaMin} onChange={(v) => onAdvancedFiltersChange({ ...advancedFilters, areaMin: v })} />
        </div>
      )}
    </div>
  );
}
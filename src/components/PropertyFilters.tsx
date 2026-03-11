import { PropertyType, propertyTypeLabels } from '@/data/properties';
import { Home, Building2, LandPlot, Store, SlidersHorizontal, X, Megaphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

const SW = 1.5;

const typeIcons: Record<PropertyType, React.ReactNode> = {
  casa: <Home size={16} strokeWidth={SW} />,
  apartamento: <Building2 size={16} strokeWidth={SW} />,
  terreno: <LandPlot size={16} strokeWidth={SW} />,
  comercial: <Store size={16} strokeWidth={SW} />,
  midia: <Megaphone size={16} strokeWidth={SW} />,
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

function SliderFilter({ label, value, onChange, min, max, step, formatValue }: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min: number;
  max: number;
  step: number;
  formatValue?: (v: number) => string;
}) {
  const displayValue = value ?? min;
  const fmt = formatValue || ((v: number) => String(v));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
        <span className="text-[11px] font-semibold text-foreground">
          {value !== null ? fmt(value) : 'Qualquer'}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[displayValue]}
        onValueChange={([v]) => onChange(v === min ? null : v)}
      />
    </div>
  );
}

function RangeSliderFilter({ label, valueMin, valueMax, onChangeMin, onChangeMax, min, max, step, formatValue }: {
  label: string;
  valueMin: number | null;
  valueMax: number | null;
  onChangeMin: (v: number | null) => void;
  onChangeMax: (v: number | null) => void;
  min: number;
  max: number;
  step: number;
  formatValue?: (v: number) => string;
}) {
  const lo = valueMin ?? min;
  const hi = valueMax ?? max;
  const fmt = formatValue || ((v: number) => String(v));
  return (
    <div className="flex flex-col gap-1.5 col-span-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
        <span className="text-[11px] font-semibold text-foreground">
          {fmt(lo)} — {hi >= max ? fmt(max) + '+' : fmt(hi)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[lo, hi]}
        onValueChange={([newLo, newHi]) => {
          onChangeMin(newLo === min ? null : newLo);
          onChangeMax(newHi === max ? null : newHi);
        }}
      />
    </div>
  );
}

const formatBRL = (v: number) => {
  if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`;
  return `R$ ${v}`;
};

export default function PropertyFilters({ activeTypes, onToggleType, total, advancedFilters, onAdvancedFiltersChange }: PropertyFiltersProps) {
  const types: PropertyType[] = ['casa', 'apartamento', 'terreno', 'comercial', 'midia'];
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const onlyMidia = activeTypes.length === 1 && activeTypes[0] === 'midia';

  useEffect(() => {
    if (activeTypes.length !== 1 || activeTypes[0] !== 'casa') setShowHint(false);
  }, [activeTypes]);

  const hasAdvanced = Object.values(advancedFilters).some((v) => v !== null);

  return (
    <div className="space-y-3">
      {showHint && (
        <p className="text-[11px] text-muted-foreground/70 italic">
          Selecione um tipo para filtrar os imóveis
        </p>
      )}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-foreground tracking-tight">Filtros</h2>
        <span className="text-xs text-muted-foreground font-medium">
          {total} {total === 1 ? 'imóvel' : 'imóveis'}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {types.map((type) => {
          const isActive = activeTypes.includes(type);
          const isMidia = type === 'midia';
          return (
            <button
              key={type}
              onClick={() => onToggleType(type)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? isMidia
                    ? 'bg-badge-midia text-white shadow-md'
                    : 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {typeIcons[type]}
              {propertyTypeLabels[type]}
            </button>
          );
        })}
      </div>

      {/* Advanced toggle — hidden when only mídia is selected */}
      {!onlyMidia && (
        <>
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
            <div className="grid grid-cols-2 gap-4 pt-1 animate-accordion-down">
              <RangeSliderFilter
                label="Preço"
                valueMin={advancedFilters.priceMin}
                valueMax={advancedFilters.priceMax}
                onChangeMin={(v) => onAdvancedFiltersChange({ ...advancedFilters, priceMin: v })}
                onChangeMax={(v) => onAdvancedFiltersChange({ ...advancedFilters, priceMax: v })}
                min={0}
                max={5000000}
                step={50000}
                formatValue={formatBRL}
              />
              <SliderFilter
                label="Quartos mín"
                value={advancedFilters.bedroomsMin}
                onChange={(v) => onAdvancedFiltersChange({ ...advancedFilters, bedroomsMin: v })}
                min={0}
                max={6}
                step={1}
              />
              <SliderFilter
                label="Banheiros mín"
                value={advancedFilters.bathroomsMin}
                onChange={(v) => onAdvancedFiltersChange({ ...advancedFilters, bathroomsMin: v })}
                min={0}
                max={5}
                step={1}
              />
              <SliderFilter
                label="Vagas mín"
                value={advancedFilters.garageMin}
                onChange={(v) => onAdvancedFiltersChange({ ...advancedFilters, garageMin: v })}
                min={0}
                max={5}
                step={1}
              />
              <SliderFilter
                label="Área mín (m²)"
                value={advancedFilters.areaMin}
                onChange={(v) => onAdvancedFiltersChange({ ...advancedFilters, areaMin: v })}
                min={0}
                max={1000}
                step={10}
                formatValue={(v) => `${v} m²`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

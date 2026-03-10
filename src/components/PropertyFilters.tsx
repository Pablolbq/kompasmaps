import { PropertyType, propertyTypeLabels } from '@/data/properties';
import { Home, Building2, LandPlot } from 'lucide-react';

const typeIcons: Record<PropertyType, React.ReactNode> = {
  casa: <Home size={16} />,
  apartamento: <Building2 size={16} />,
  terreno: <LandPlot size={16} />,
};

interface PropertyFiltersProps {
  activeTypes: PropertyType[];
  onToggleType: (type: PropertyType) => void;
  total: number;
}

export default function PropertyFilters({ activeTypes, onToggleType, total }: PropertyFiltersProps) {
  const types: PropertyType[] = ['casa', 'apartamento', 'terreno'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-foreground">Filtros</h2>
        <span className="text-xs text-muted-foreground font-medium">
          {total} {total === 1 ? 'imóvel' : 'imóveis'}
        </span>
      </div>
      <div className="flex gap-2">
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
    </div>
  );
}

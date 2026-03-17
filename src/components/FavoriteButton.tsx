import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Props {
  propertyId: string;
  className?: string;
}

export default function FavoriteButton({ propertyId, className = '' }: Props) {
  const { favoriteIds, toggleFavorite, isLoggedIn } = useFavorites();
  const navigate = useNavigate();
  const isFav = favoriteIds.includes(propertyId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast('Faça login para salvar favoritos', {
        action: { label: 'Entrar', onClick: () => navigate('/login') },
      });
      return;
    }
    toggleFavorite.mutate(propertyId);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-lg hover:bg-secondary transition-colors ${className}`}
      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart
        size={18}
        strokeWidth={1.5}
        className={isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
      />
    </button>
  );
}

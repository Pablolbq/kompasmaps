import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useFavorites() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: favoriteIds = [] } = useQuery({
    queryKey: ['favorites', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', userId!);
      if (error) throw error;
      return data.map((f) => f.property_id);
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!userId) throw new Error('Not authenticated');
      const isFav = favoriteIds.includes(propertyId);
      if (isFav) {
        await supabase.from('favorites').delete().eq('user_id', userId).eq('property_id', propertyId);
      } else {
        await supabase.from('favorites').insert({ user_id: userId, property_id: propertyId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
    },
  });

  return { favoriteIds, toggleFavorite, isLoggedIn: !!userId };
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mapDbProperty } from '@/data/properties';

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapDbProperty);
    },
  });
}

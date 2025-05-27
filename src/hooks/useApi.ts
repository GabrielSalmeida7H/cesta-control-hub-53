
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook para buscar famílias
export const useFamilies = () => {
  return useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook para buscar instituições
export const useInstitutions = () => {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook para buscar entregas
export const useDeliveries = () => {
  return useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook para buscar entregas por instituição
export const useDeliveriesByInstitution = (institutionId?: string) => {
  return useQuery({
    queryKey: ['deliveries', 'institution', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!institutionId,
  });
};

// Hook para criar família
export const useCreateFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (family: any) => {
      const { data, error } = await supabase
        .from('families')
        .insert([family])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
    },
  });
};

// Hook para criar instituição
export const useCreateInstitution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (institution: any) => {
      const { data, error } = await supabase
        .from('institutions')
        .insert([{
          ...institution,
          inventory: institution.inventory || { baskets: institution.availableBaskets || 0 }
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
};

// Hook para atualizar família
export const useUpdateFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (family: any) => {
      const { data, error } = await supabase
        .from('families')
        .update(family)
        .eq('id', family.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
    },
  });
};

// Hook para atualizar instituição
export const useUpdateInstitution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (institution: any) => {
      const { data, error } = await supabase
        .from('institutions')
        .update(institution)
        .eq('id', institution.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
};

// Hook para criar entrega
export const useCreateDelivery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (delivery: any) => {
      const { data, error } = await supabase
        .from('deliveries')
        .insert([delivery])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
};

// Hook para atualizar inventário da instituição
export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ institutionId, inventory }: { institutionId: string, inventory: any }) => {
      const { data, error } = await supabase
        .from('institutions')
        .update({ inventory })
        .eq('id', institutionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:3001';

// Hook para buscar famílias
export const useFamilies = () => {
  return useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/families`);
      return response.json();
    },
  });
};

// Hook para buscar instituições
export const useInstitutions = () => {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/institutions`);
      return response.json();
    },
  });
};

// Hook para buscar entregas
export const useDeliveries = () => {
  return useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/deliveries`);
      return response.json();
    },
  });
};

// Hook para buscar entregas por instituição
export const useDeliveriesByInstitution = (institutionId?: number) => {
  return useQuery({
    queryKey: ['deliveries', 'institution', institutionId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/deliveries`);
      const deliveries = await response.json();
      return institutionId ? deliveries.filter((d: any) => d.institutionId === institutionId) : deliveries;
    },
    enabled: !!institutionId,
  });
};

// Hook para criar família
export const useCreateFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (family: any) => {
      const response = await fetch(`${API_BASE_URL}/families`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(family),
      });
      return response.json();
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
      const response = await fetch(`${API_BASE_URL}/institutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(institution),
      });
      return response.json();
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
      const response = await fetch(`${API_BASE_URL}/families/${family.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(family),
      });
      return response.json();
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
      const response = await fetch(`${API_BASE_URL}/institutions/${institution.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(institution),
      });
      return response.json();
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
      const response = await fetch(`${API_BASE_URL}/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(delivery),
      });
      return response.json();
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
    mutationFn: async ({ institutionId, inventory }: { institutionId: number, inventory: any }) => {
      const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inventory }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });
};

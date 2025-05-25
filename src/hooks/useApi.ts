
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

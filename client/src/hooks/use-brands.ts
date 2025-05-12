import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useBrands() {
  return useQuery({
    queryKey: ["/api/brands"],
  });
}

export function useBrand(id?: number) {
  return useQuery({
    queryKey: [`/api/brands/${id}`],
    enabled: !!id,
  });
}

export function useCreateBrand() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/brands", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
  });
}

export function useUpdateBrand() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/brands/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      queryClient.invalidateQueries({ queryKey: [`/api/brands/${variables.id}`] });
    },
  });
}

export function useDeleteBrand() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/brands/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
  });
}
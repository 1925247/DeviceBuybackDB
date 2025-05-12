import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useDeviceTypes() {
  return useQuery({
    queryKey: ["/api/device-types"],
  });
}

export function useDeviceType(id?: number) {
  return useQuery({
    queryKey: [`/api/device-types/${id}`],
    enabled: !!id,
  });
}

export function useCreateDeviceType() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/device-types", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-types"] });
    },
  });
}

export function useUpdateDeviceType() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/device-types/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-types"] });
      queryClient.invalidateQueries({ queryKey: [`/api/device-types/${variables.id}`] });
    },
  });
}

export function useDeleteDeviceType() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/device-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-types"] });
    },
  });
}
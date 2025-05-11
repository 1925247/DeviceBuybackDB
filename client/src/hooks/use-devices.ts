import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useDevices(page: number = 1, limit: number = 10, status?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/devices", page, limit, status],
    queryFn: async () => {
      let url = `/api/devices?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      return queryClient.fetchQuery({ queryKey: [url] });
    },
    keepPreviousData: true,
  });

  // Assuming we don't have a total count from the API, we'll use a placeholder
  // In a real app, you'd get this from the backend
  const totalPages = Math.ceil((data?.length || 0) / limit) || 3;

  return {
    devices: data || [],
    isLoading,
    error,
    totalPages,
  };
}

export function useDevice(id?: number) {
  return useQuery({
    queryKey: [`/api/devices/${id}`],
    enabled: !!id,
  });
}

export function useCreateDevice() {
  return useMutation({
    mutationFn: (deviceData: any) => apiRequest("POST", "/api/devices", deviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    },
  });
}

export function useUpdateDevice() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/devices/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: [`/api/devices/${variables.id}`] });
    },
  });
}

export function useDeleteDevice() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/devices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    },
  });
}

export function useDevicesBySeller(sellerId?: number) {
  return useQuery({
    queryKey: [`/api/devices/seller/${sellerId}`],
    enabled: !!sellerId,
  });
}

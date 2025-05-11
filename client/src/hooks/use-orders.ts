import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useOrders(page: number = 1, limit: number = 10, status?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/orders", page, limit, status],
    queryFn: async () => {
      let url = `/api/orders?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      return queryClient.fetchQuery({ queryKey: [url] });
    },
    keepPreviousData: true,
  });

  // Assuming we don't have a total count from the API, we'll use a placeholder
  const totalPages = Math.ceil((data?.length || 0) / limit) || 3;

  return {
    orders: data || [],
    isLoading,
    error,
    totalPages,
  };
}

export function useOrder(id?: number) {
  return useQuery({
    queryKey: [`/api/orders/${id}`],
    enabled: !!id,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (orderData: any) => apiRequest("POST", "/api/orders", orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

export function useUpdateOrder() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/orders/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${variables.id}`] });
    },
  });
}

export function useDeleteOrder() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

export function useOrdersByBuyer(buyerId?: number) {
  return useQuery({
    queryKey: [`/api/orders/buyer/${buyerId}`],
    enabled: !!buyerId,
  });
}

export function useOrdersBySeller(sellerId?: number) {
  return useQuery({
    queryKey: [`/api/orders/seller/${sellerId}`],
    enabled: !!sellerId,
  });
}

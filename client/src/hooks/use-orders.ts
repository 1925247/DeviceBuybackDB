import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useOrders(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["/api/orders", { page, limit }],
    queryFn: () => apiRequest(
      "GET", 
      `/api/orders?page=${page}&limit=${limit}`
    ).then(res => res.json()),
  });
}

export function useOrder(id?: number) {
  return useQuery({
    queryKey: [`/api/orders/${id}`],
    queryFn: () => apiRequest(
      "GET", 
      `/api/orders/${id}`
    ).then(res => res.json()),
    enabled: !!id,
  });
}

export function useOrdersByBuyer(buyerId?: number, page = 1, limit = 10) {
  return useQuery({
    queryKey: [`/api/orders/buyer/${buyerId}`, { page, limit }],
    queryFn: () => apiRequest(
      "GET", 
      `/api/orders/buyer/${buyerId}?page=${page}&limit=${limit}`
    ).then(res => res.json()),
    enabled: !!buyerId,
  });
}

export function useOrdersBySeller(sellerId?: number, page = 1, limit = 10) {
  return useQuery({
    queryKey: [`/api/orders/seller/${sellerId}`, { page, limit }],
    queryFn: () => apiRequest(
      "GET", 
      `/api/orders/seller/${sellerId}?page=${page}&limit=${limit}`
    ).then(res => res.json()),
    enabled: !!sellerId,
  });
}

export function useOrdersCount() {
  return useQuery({
    queryKey: ["/api/orders/count"],
    queryFn: () => apiRequest(
      "GET", 
      `/api/orders/count`
    ).then(res => res.json()),
  });
}

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: ["/api/orders/recent", { limit }],
    queryFn: () => apiRequest(
      "GET", 
      `/api/orders/recent?limit=${limit}`
    ).then(res => res.json()),
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/recent"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/orders/count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/recent"] });
    },
  });
}

export function useDeleteOrder() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/recent"] });
    },
  });
}
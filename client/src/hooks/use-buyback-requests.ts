import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useBuybackRequests(page = 1, limit = 10, status?: string) {
  return useQuery({
    queryKey: ["/api/buyback-requests", { page, limit, status }],
    queryFn: () => {
      let url = `/api/buyback-requests?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      return apiRequest("GET", url).then(res => res.json());
    },
  });
}

export function useBuybackRequest(id?: number) {
  return useQuery({
    queryKey: [`/api/buyback-requests/${id}`],
    queryFn: () => apiRequest(
      "GET", 
      `/api/buyback-requests/${id}`
    ).then(res => res.json()),
    enabled: !!id,
  });
}

export function useBuybackRequestsByUser(userId?: number) {
  return useQuery({
    queryKey: [`/api/buyback-requests/user/${userId}`],
    queryFn: () => apiRequest(
      "GET", 
      `/api/buyback-requests/user/${userId}`
    ).then(res => res.json()),
    enabled: !!userId,
  });
}

export function useBuybackRequestsCount(status?: string) {
  return useQuery({
    queryKey: ["/api/buyback-requests/count", { status }],
    queryFn: () => {
      let url = `/api/buyback-requests/count`;
      if (status) {
        url += `?status=${status}`;
      }
      return apiRequest("GET", url).then(res => res.json());
    },
  });
}

export function useRecentBuybackRequests(limit = 5) {
  return useQuery({
    queryKey: ["/api/buyback-requests/recent", { limit }],
    queryFn: () => apiRequest(
      "GET", 
      `/api/buyback-requests/recent?limit=${limit}`
    ).then(res => res.json()),
  });
}

export function useCreateBuybackRequest() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/buyback-requests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyback-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buyback-requests/count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buyback-requests/recent"] });
    },
  });
}

export function useUpdateBuybackRequest() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/buyback-requests/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyback-requests"] });
      queryClient.invalidateQueries({ queryKey: [`/api/buyback-requests/${variables.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/buyback-requests/count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buyback-requests/recent"] });
    },
  });
}

export function useDeleteBuybackRequest() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/buyback-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyback-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buyback-requests/count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buyback-requests/recent"] });
    },
  });
}
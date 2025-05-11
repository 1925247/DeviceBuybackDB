import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useBuybackRequests(page: number = 1, limit: number = 10, status?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/buyback-requests", page, limit, status],
    queryFn: async () => {
      let url = `/api/buyback-requests?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      return queryClient.fetchQuery({ queryKey: [url] });
    },
    keepPreviousData: true,
  });

  // Assuming we don't have a total count from the API, we'll use a placeholder
  const totalPages = Math.ceil((data?.length || 0) / limit) || 2;

  return {
    buybackRequests: data || [],
    isLoading,
    error,
    totalPages,
  };
}

export function useBuybackRequest(id?: number) {
  return useQuery({
    queryKey: [`/api/buyback-requests/${id}`],
    enabled: !!id,
  });
}

export function useCreateBuybackRequest() {
  return useMutation({
    mutationFn: (requestData: any) => apiRequest("POST", "/api/buyback-requests", requestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyback-requests"] });
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
    },
  });
}

export function useDeleteBuybackRequest() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/buyback-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyback-requests"] });
    },
  });
}

export function useBuybackRequestsByUser(userId?: number) {
  return useQuery({
    queryKey: [`/api/buyback-requests/user/${userId}`],
    enabled: !!userId,
  });
}

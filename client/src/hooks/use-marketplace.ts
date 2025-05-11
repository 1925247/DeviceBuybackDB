import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useMarketplace(page: number = 1, limit: number = 10, status?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/marketplace-listings", page, limit, status],
    queryFn: async () => {
      let url = `/api/marketplace-listings?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      return queryClient.fetchQuery({ queryKey: [url] });
    },
    keepPreviousData: true,
  });

  // Assuming we don't have a total count from the API, we'll use a placeholder
  const totalPages = Math.ceil((data?.length || 0) / limit) || 3;

  return {
    listings: data || [],
    isLoading,
    error,
    totalPages,
  };
}

export function useMarketplaceListing(id?: number) {
  return useQuery({
    queryKey: [`/api/marketplace-listings/${id}`],
    enabled: !!id,
  });
}

export function useCreateMarketplaceListing() {
  return useMutation({
    mutationFn: (listingData: any) => apiRequest("POST", "/api/marketplace-listings", listingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace-listings"] });
    },
  });
}

export function useUpdateMarketplaceListing() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/marketplace-listings/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace-listings"] });
      queryClient.invalidateQueries({ queryKey: [`/api/marketplace-listings/${variables.id}`] });
    },
  });
}

export function useDeleteMarketplaceListing() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/marketplace-listings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace-listings"] });
    },
  });
}

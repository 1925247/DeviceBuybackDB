import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useUsers(page: number = 1, limit: number = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/users", page, limit],
    queryFn: async () => {
      const url = `/api/users?page=${page}&limit=${limit}`;
      return queryClient.fetchQuery({ queryKey: [url] });
    },
    keepPreviousData: true,
  });

  // Assuming we don't have a total count from the API, we'll use a placeholder
  const totalPages = Math.ceil((data?.length || 0) / limit) || 4;

  return {
    users: data || [],
    isLoading,
    error,
    totalPages,
  };
}

export function useUser(id?: number) {
  return useQuery({
    queryKey: [`/api/users/${id}`],
    enabled: !!id,
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: (userData: any) => apiRequest("POST", "/api/users", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/users/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${variables.id}`] });
    },
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

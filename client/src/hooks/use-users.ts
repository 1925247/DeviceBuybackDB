import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useUsers(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["/api/users", { page, limit }],
    queryFn: () => apiRequest(
      "GET", 
      `/api/users?page=${page}&limit=${limit}`
    ).then(res => res.json()),
  });
}

export function useUser(id?: number) {
  return useQuery({
    queryKey: [`/api/users/${id}`],
    queryFn: () => apiRequest(
      "GET", 
      `/api/users/${id}`
    ).then(res => res.json()),
    enabled: !!id,
  });
}

export function useUsersCount() {
  return useQuery({
    queryKey: ["/api/users/count"],
    queryFn: () => apiRequest(
      "GET", 
      `/api/users/count`
    ).then(res => res.json()),
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/count"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/users/count"] });
    },
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/count"] });
    },
  });
}
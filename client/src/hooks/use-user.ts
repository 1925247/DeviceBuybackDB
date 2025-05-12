import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!localStorage.getItem("token") || !!sessionStorage.getItem("token"),
  });
}

export function useUserOrders(userId?: number) {
  return useQuery({
    queryKey: [`/api/orders/buyer/${userId}`],
    enabled: !!userId,
  });
}

export function useUserDevices(userId?: number) {
  return useQuery({
    queryKey: [`/api/devices/seller/${userId}`],
    enabled: !!userId,
  });
}

export function useUserBuybackRequests(userId?: number) {
  return useQuery({
    queryKey: [`/api/buyback-requests/user/${userId}`],
    enabled: !!userId,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      // If login successful, store the token
      if (data?.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("userData", JSON.stringify(data.user));
        }
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    }
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => Promise.resolve(),
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userData");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (userData: any) => apiRequest("POST", "/api/users", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    }
  });
}

// Helper function to check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem("token") || !!sessionStorage.getItem("token");
}

// Helper function to get user data from local storage
export function getUserData() {
  const userData = localStorage.getItem("userData") || sessionStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
}
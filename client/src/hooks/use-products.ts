import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Hook for fetching all products with filtering capabilities
export function useProducts(options?: {
  page?: number;
  limit?: number;
  status?: string;
  featured?: boolean;
  deviceModelId?: number;
  categoryId?: number;
  search?: string;
}) {
  const {
    page = 1,
    limit = 12,
    status = "active",
    featured,
    deviceModelId,
    categoryId,
    search,
  } = options || {};

  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  
  if (status) queryParams.append("status", status);
  if (featured !== undefined) queryParams.append("featured", featured.toString());
  if (deviceModelId) queryParams.append("deviceModelId", deviceModelId.toString());
  if (categoryId) queryParams.append("categoryId", categoryId.toString());
  if (search) queryParams.append("search", search);

  const queryString = queryParams.toString();

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/products", page, limit, status, featured, deviceModelId, categoryId, search],
    queryFn: async () => {
      return queryClient.fetchQuery({ 
        queryKey: [`/api/products?${queryString}`] 
      });
    },
    placeholderData: (prevData) => prevData, // Modern equivalent to keepPreviousData
  });

  // Define type for the expected response data
  interface ProductsResponse {
    products: any[];
    total: number;
  }

  // Extract total pages from response or provide a reasonable default
  const responseData = data as ProductsResponse | undefined;
  const total = responseData?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    products: responseData?.products || [],
    isLoading,
    error,
    total,
    totalPages,
  };
}

// Hook for fetching a single product by ID
export function useProduct(id?: number) {
  return useQuery({
    queryKey: [`/api/products/${id}`],
    queryFn: async () => {
      if (!id) return null;
      return queryClient.fetchQuery({ 
        queryKey: [`/api/products/${id}`] 
      });
    },
    enabled: !!id,
  });
}

// Hook for creating a new product
export function useCreateProduct() {
  return useMutation({
    mutationFn: (productData: any) => apiRequest("POST", "/api/products", productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

// Hook for updating an existing product
export function useUpdateProduct() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/products/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${variables.id}`] });
    },
  });
}

// Hook for deleting a product
export function useDeleteProduct() {
  return useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });
}

// Hook for fetching product variants
export function useProductVariants(productId?: number) {
  return useQuery({
    queryKey: [`/api/products/${productId}/variants`],
    queryFn: async () => {
      if (!productId) return [];
      return queryClient.fetchQuery({ 
        queryKey: [`/api/products/${productId}/variants`] 
      });
    },
    enabled: !!productId,
  });
}
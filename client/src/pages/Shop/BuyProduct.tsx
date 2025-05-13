// /pages/shop/BuyProduct.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

const BuyProduct = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Fetch products from API
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  // Fetch categories from API
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });

  // Fetch brands from API
  const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: ["/api/brands"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/brands");
      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }
      return response.json();
    },
  });

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setSearchQuery("");
  };

  const filteredProducts = products.filter((product: any) => {
    const category = categories.find(
      (c: any) => c.id === product.categoryId,
    )?.name;
    const brand = brands.find((b: any) => b.id === product.brandId)?.name;

    return (
      (!selectedCategory || category === selectedCategory) &&
      (!selectedBrand || brand === selectedBrand) &&
      product.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Function to add product to cart (increments quantity if already exists)
  const addToCart = (product: any) => {
    setCartItems((prevItems: any[]) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-700">Our Products</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Link to="/shop/checkout" state={{ cart: cartItems }}>
              <ShoppingCart className="h-8 w-8 text-indigo-600" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-full py-1 px-4 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute top-1/2 transform -translate-y-1/2 right-3 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <section className="py-6 px-4">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Categories</h3>
          {isLoadingCategories ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="h-10 w-24 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setSelectedBrand("");
                  }}
                  className={`px-4 py-2 rounded-full border transition duration-300 text-sm font-medium ${
                    selectedCategory === category.name
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedCategory && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Brands</h3>
            {isLoadingBrands ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-10 w-20 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {brands.map((brand: any) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.name)}
                    className={`px-4 py-2 rounded-full border transition duration-300 text-sm font-medium ${
                      selectedBrand === brand.name
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {(selectedCategory || selectedBrand || searchQuery) && (
          <div className="text-right">
            <button
              onClick={clearFilters}
              className="text-indigo-600 hover:underline text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Product Grid */}
      <section className="px-4 py-8">
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white p-4 rounded-lg shadow-md">
                <Skeleton className="w-full aspect-video rounded-md" />
                <div className="mt-4">
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 mt-2 rounded" />
                  <Skeleton className="h-6 w-1/4 mt-2 rounded" />
                  <div className="mt-2 flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Skeleton key={s} className="h-4 w-4 mx-1 rounded-full" />
                    ))}
                  </div>
                  <div className="flex mt-4 space-x-2">
                    <Skeleton className="h-10 w-full rounded-full" />
                    <Skeleton className="h-10 w-full rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-video rounded-md overflow-hidden">
                    <Link
                      to={`/shop/details/${product.id}`}
                      state={{ cart: cartItems }}
                    >
                      <img
                        src={
                          product.images?.[0]?.url || "/placeholder-product.png"
                        }
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                    </Link>
                    {product.compare_at_price &&
                      product.compare_at_price > product.price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {Math.round(
                            (1 - product.price / product.compare_at_price) *
                              100,
                          )}
                          % OFF
                        </div>
                      )}
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/shop/details/${product.id}`}
                      state={{ cart: cartItems }}
                    >
                      <h3 className="text-lg font-bold text-gray-800">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600">
                      {brands.find((b: any) => b.id === product.brand_id)
                        ?.name || "Unknown Brand"}
                      &middot;
                      {product.categories
                        ?.map((cat: any) => cat.name)
                        .join(", ") || "Uncategorized"}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-indigo-600">
                      ${product.price}
                    </p>
                    <div className="flex items-center mt-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < (product.rating || 4)
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-700">
                        {(product.rating || 4).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex mt-4 space-x-2">
                      {/* Buy Now: immediately checkout with one product */}
                      <Link
                        to="/shop/checkout"
                        state={{ cart: [{ ...product, quantity: 1 }] }}
                        className="flex-1 text-center py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
                      >
                        Buy Now <ShoppingCart className="inline ml-2 h-5 w-5" />
                      </Link>
                      {/* Add to Cart */}
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 text-center py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
                      >
                        Add to Cart{" "}
                        <ShoppingCart className="inline ml-2 h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600">
                <p>No products found matching your filters.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Upsell / Recommended Section */}
      <section className="px-4 py-8 bg-gray-100">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          Recommended for You
        </h2>

        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-4 rounded-lg shadow-md">
                <Skeleton className="w-full aspect-video rounded-md" />
                <div className="mt-4">
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <Skeleton className="h-6 w-1/4 mt-2 rounded" />
                  <Skeleton className="h-10 w-full mt-2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
              .filter((p: any) => p.featured === true)
              .slice(0, 3)
              .map((product: any) => (
                <div
                  key={`upsell-${product.id}`}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-video rounded-md overflow-hidden">
                    <img
                      src={
                        product.images?.[0]?.url || "/placeholder-product.png"
                      }
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {product.title}
                    </h3>
                    <p className="mt-2 text-lg font-semibold text-indigo-600">
                      ${product.price}
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full mt-2 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
                    >
                      Add to Cart{" "}
                      <ShoppingCart className="inline ml-2 h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BuyProduct;

import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useProducts } from '../hooks/use-products';
import { useDeviceTypes } from '../hooks/use-device-types';
import { useBrands } from '../hooks/use-brands';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Filter, Smartphone, Laptop, Tablet } from 'lucide-react';

export default function ShopPage() {
  const [location, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  // Query product data from the backend
  const { products, isLoading, totalPages } = useProducts({
    page: currentPage,
    limit: 12,
    status: 'active',
    search: searchTerm,
    deviceModelId: selectedDeviceType ? parseInt(selectedDeviceType) : undefined
  });

  // Get device types and brands for filtering
  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useDeviceTypes();
  const { data: brands, isLoading: isLoadingBrands } = useBrands();

  // Filter products client-side for properties not handled by the API
  const filteredProducts = products.filter(product => {
    let matches = true;
    
    // Filter by brand if selected
    if (selectedBrand && product.device_model) {
      const deviceModel = product.device_model;
      matches = matches && deviceModel.brand_id.toString() === selectedBrand;
    }
    
    // Filter by price range
    if (priceRange.min && !isNaN(parseFloat(priceRange.min))) {
      matches = matches && parseFloat(product.price) >= parseFloat(priceRange.min);
    }
    if (priceRange.max && !isNaN(parseFloat(priceRange.max))) {
      matches = matches && parseFloat(product.price) <= parseFloat(priceRange.max);
    }
    
    return matches;
  });
  
  // Sort the filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (selectedSort) {
      case 'price_low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price_high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default:
        return 0;
    }
  });
  
  // Get condition badge style
  const getConditionBadge = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Good</Badge>;
      case 'fair':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Fair</Badge>;
      case 'poor':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Poor</Badge>;
      default:
        return null;
    }
  };

  // Get device icon based on product type
  const getDeviceIcon = (product: any) => {
    const deviceType = product.device_model?.deviceType?.name?.toLowerCase() || '';
    
    if (deviceType.includes('phone') || deviceType.includes('smartphone')) {
      return <Smartphone className="h-6 w-6 text-primary" />;
    } else if (deviceType.includes('tablet') || deviceType.includes('ipad')) {
      return <Tablet className="h-6 w-6 text-primary" />;
    } else {
      return <Laptop className="h-6 w-6 text-primary" />;
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedDeviceType(null);
    setSelectedBrand(null);
    setPriceRange({ min: '', max: '' });
    setSelectedSort('newest');
    setCurrentPage(1);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Shop Refurbished Devices</h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover premium refurbished devices at unbeatable prices. All devices are thoroughly tested and come with a warranty.
            </p>
            
            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-lg">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for devices..."
                  className="pl-10 pr-4 py-2 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button variant="ghost" onClick={resetFilters} className="text-sm">Reset</Button>
                </div>
                
                <div className="space-y-6">
                  {/* Device Type filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
                    <Select
                      value={selectedDeviceType || 'all'}
                      onValueChange={(value) => setSelectedDeviceType(value === 'all' ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Device Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Device Types</SelectItem>
                        {deviceTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Brand filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <Select
                      value={selectedBrand || 'all'}
                      onValueChange={(value) => setSelectedBrand(value === 'all' ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Price Range filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="number"
                          placeholder="Min"
                          min="0"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Max"
                          min="0"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <Select
                      value={selectedSort}
                      onValueChange={setSelectedSort}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Products grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">No products found</h3>
                  <p className="text-gray-500 mb-6">
                    We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                  </p>
                  <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-gray-500">
                      Showing <span className="font-medium">{sortedProducts.length}</span> products
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                        <div className="relative bg-gray-100 aspect-[4/3] flex items-center justify-center p-6">
                          {getDeviceIcon(product)}
                          {product.featured && (
                            <Badge className="absolute top-2 left-2">Featured</Badge>
                          )}
                        </div>
                        <CardHeader className="pb-2 pt-4">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-semibold line-clamp-2">{product.title}</CardTitle>
                          </div>
                          <CardDescription className="flex items-center mt-1">
                            {getConditionBadge(product.condition)}
                            <span className="text-xs text-gray-500 ml-2">
                              {product.device_model?.brand?.name} {product.device_model?.name}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="py-2 text-sm">
                          <p className="line-clamp-2 text-gray-600 mb-2">
                            {product.description || "No description available"}
                          </p>
                          {product.variant && (
                            <Badge variant="outline" className="mb-2">
                              {product.variant}
                            </Badge>
                          )}
                        </CardContent>
                        <CardFooter className="pt-2 mt-auto flex justify-between items-center">
                          <div>
                            {product.compare_at_price && (
                              <span className="text-sm line-through text-gray-400 mr-2">
                                ${parseFloat(product.compare_at_price).toFixed(2)}
                              </span>
                            )}
                            <span className="text-lg font-bold text-primary">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12">
                      <Pagination>
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(currentPage - 1);
                                }}
                              />
                            </PaginationItem>
                          )}
                          
                          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                            // Logic to show appropriate page numbers
                            let pageNum;
                            
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  href="#"
                                  isActive={pageNum === currentPage}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(pageNum);
                                  }}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(totalPages);
                                  }}
                                >
                                  {totalPages}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          )}
                          
                          {currentPage < totalPages && (
                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(currentPage + 1);
                                }}
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
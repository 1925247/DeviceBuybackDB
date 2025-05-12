import React, { useState, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, DollarSign, Truck, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetails = () => {
  // यह hook केवल component के अंदर कॉल हो रहा है
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [] } = location.state || {};

  // अगर id नहीं है, तो Product Not Found दिखाएँ
  if (!id) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold">Product Not Found</h1>
        <button onClick={() => navigate('/buy')} className="mt-4 text-indigo-600 hover:underline">
          Back to Products
        </button>
      </div>
    );
  }

  // Fetch single product from API
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      return response.json();
    },
    enabled: !!id
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <div className="flex space-x-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or product not found
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold">Product Not Found</h1>
        <button onClick={() => navigate('/buy')} className="mt-4 text-indigo-600 hover:underline">
          Back to Products
        </button>
      </div>
    );
  }

  // Local state: quantity and selected image
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0]?.url || '/placeholder-product.png'
  );

  // Cart update और checkout navigation का function
  const updateCartAndNavigate = () => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find(
      (item) =>
        item.id && item.id.toString().toLowerCase() === product.id.toString().toLowerCase()
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      updatedCart.push({ ...product, quantity });
    }
    navigate('/buy/checkout', { state: { cart: updatedCart } });
  };

  const handleAddToCart = updateCartAndNavigate;
  const handleBuyNow = updateCartAndNavigate;

  // Fetch similar products
  const { data: similarProducts = [] } = useQuery({
    queryKey: ['/api/products', 'similar'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products?limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch similar products');
      }
      const products = await response.json();
      // Filter out current product
      return products.filter((p: any) => p.id !== product.id).slice(0, 4);
    },
    enabled: !!product
  });

  // Component का JSX रिटर्न करें
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow py-4 px-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-indigo-600 hover:underline">
          <ArrowLeft className="h-5 w-5 mr-1" /> Back
        </button>
        <h1 className="text-2xl font-bold text-indigo-700">Product Details</h1>
        <Link to="/buy/checkout" state={{ cart }} className="relative">
          <ShoppingCart className="h-8 w-8 text-indigo-600" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cart.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0)}
            </span>
          )}
        </Link>
      </header>

      {/* Main Product Section */}
      <section className="px-4 py-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-lg border overflow-hidden bg-white flex items-center justify-center">
                <img 
                  src={selectedImage} 
                  alt={product.title} 
                  className="w-full h-full object-contain p-4" 
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images && product.images.map((image: any, index: number) => (
                  <button
                    key={index}
                    className={`aspect-square rounded border overflow-hidden ${
                      selectedImage === image.url ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={`${product.title} - View ${index + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                <p className="text-lg text-gray-600 mt-1">
                  {product.condition && <span className="capitalize">{product.condition} Condition</span>}
                  {product.sku && <span className="text-sm text-gray-500 ml-2">SKU: {product.sku}</span>}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-indigo-700">${product.price}</span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <>
                    <span className="ml-2 text-lg text-gray-500 line-through">
                      ${product.compare_at_price}
                    </span>
                    <span className="ml-2 text-sm font-medium text-green-600">
                      Save ${(product.compare_at_price - product.price).toFixed(2)} 
                      ({Math.round((1 - product.price / product.compare_at_price) * 100)}%)
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <div className="mt-2 prose prose-indigo">
                  <p>{product.description || "No description available for this product."}</p>
                </div>
              </div>

              {/* Specifications */}
              {product.specs && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
                  <div className="mt-2 border-t border-gray-200">
                    <dl className="divide-y divide-gray-200">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="py-2 grid grid-cols-3">
                          <dt className="text-sm font-medium text-gray-500 capitalize">{key.replace('_', ' ')}</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="py-4 border-t border-b border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <label htmlFor="quantity" className="text-gray-700 font-medium">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-l border-r border-gray-300">
                      {quantity}
                    </span>
                    <button
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      const updatedCart = [...cart];
                      const existingProduct = updatedCart.find(
                        (item) => item.id === product.id
                      );
                      if (existingProduct) {
                        existingProduct.quantity += quantity;
                      } else {
                        updatedCart.push({ ...product, quantity });
                      }
                      navigate("/buy", { state: { cart: updatedCart } });
                    }}
                    className="flex-1 py-3 px-4 border border-indigo-700 text-indigo-700 rounded-md text-center font-semibold hover:bg-indigo-50 transition"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={updateCartAndNavigate}
                    className="flex-1 py-3 px-4 bg-indigo-700 text-white rounded-md text-center font-semibold hover:bg-indigo-800 transition"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign size={16} className="mr-2" />
                  <span>Secure payment options available</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Truck size={16} className="mr-2" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield size={16} className="mr-2" />
                  <span>90-day warranty included</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {/* We would fetch and show related products here */}
        </div>
      </section>

      {/* बाकी sections ... */}
    </div>
  );
};

export default ProductDetails;

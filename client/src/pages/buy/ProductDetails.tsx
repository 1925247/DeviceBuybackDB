import React, { useState, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
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

  // id को lowercase में convert करें
  const routeId = id.toLowerCase();
  console.log('Route ID:', routeId);
  console.log('Products:', products);

  // products array में प्रोडक्ट ढूँढें
  const product = products.find((p) => p.id && p.id.toLowerCase() === routeId);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold">Product Not Found</h1>
        <button onClick={() => navigate('/buy')} className="mt-4 text-indigo-600 hover:underline">
          Back to Products
        </button>
      </div>
    );
  }

  // Local state: quantity और selected image
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);

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

  // Recent products का filter (current product को छोड़कर)
  const recentProducts = products
    .filter((p) => p.id && p.id.toLowerCase() !== routeId)
    .slice(0, 5);

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
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </Link>
      </header>

      {/* Main Product Section */}
      <section className="px-4 py-8">
        {/* ... यहाँ बाकी JSX कोड जारी है ... */}
        <div>Product Details for: {routeId}</div>
      </section>

      {/* बाकी sections ... */}
    </div>
  );
};

export default ProductDetails;

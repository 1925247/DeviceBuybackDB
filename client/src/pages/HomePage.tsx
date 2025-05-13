import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Laptop, 
  Tablet, 
  Watch, 
  ArrowRight, 
  DollarSign,
  Truck,
  ShieldCheck,
  Recycle,
  ChevronRight
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

// Use ModelsContext instead of static data
import { useModels } from '../contexts/ModelsContext';

interface SectionData {
  id: number;
  name: string;
  title: string;
  subtitle: string;
  content: string;
  active: boolean;
  order: number;
  settings: Record<string, any>;
}

interface HomeData {
  deviceTypes: any[];
  brands: any[];
}

// Initial home data structure
const initialHomeData: HomeData = {
  deviceTypes: [],
  brands: []
};

const HomePage = () => {
  const { deviceTypes = [], brands = [], isLoading } = useModels();
  
  // Create homeData from context data
  const homeData = useMemo(() => {
    return {
      ...initialHomeData,
      deviceTypes: deviceTypes || [],
      brands: brands || []
    };
  }, [deviceTypes, brands]);

  // Use the loading state from the context
  const loading = isLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Blue background with white text */}
      <section className="bg-blue-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Sell Your Old Devices for the Best Price
              </h1>
              <p className="mb-6">
                Get instant valuation, free doorstep pickup, and quick payment for your used smartphones, laptops, tablets, and smartwatches.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/sell/device-selection"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
                >
                  Sell Now
                </Link>
                <Link
                  to="/buy"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-400 transition-colors border border-blue-400"
                >
                  Buy Now
                </Link>
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-400 transition-colors border border-blue-400"
                >
                  How It Works
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/images/hero-device-sold.png"
                alt="Phone with sold tag"
                className="rounded-lg w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sell Your Devices Section */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Sell Your Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Smartphones */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="mb-4 text-center">
                <div className="bg-blue-100 p-4 rounded-md inline-block">
                  <Smartphone className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <h3 className="font-medium text-lg mb-1">Smartphones</h3>
              <p className="text-sm text-gray-600 mb-2">Best cash offer for your phone!</p>
              <p className="text-sm text-gray-600 mb-3">Sell your used iPhone, Samsung, OnePlus, and other smartphones.</p>
              <Link to="/sell/device-selection" className="text-blue-600 text-sm font-medium flex items-center">
                Sell Now <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Laptops */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="mb-4 text-center">
                <div className="bg-green-100 p-4 rounded-md inline-block">
                  <Laptop className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <h3 className="font-medium text-lg mb-1">Laptops</h3>
              <p className="text-sm text-gray-600 mb-2">Upgrade your tech with extra cash!</p>
              <p className="text-sm text-gray-600 mb-3">Get cash for your MacBook, Dell, HP, Lenovo, and more.</p>
              <Link to="/sell/device-selection" className="text-green-600 text-sm font-medium flex items-center">
                Sell Now <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Tablets */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="mb-4 text-center">
                <div className="bg-purple-100 p-4 rounded-md inline-block">
                  <Tablet className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <h3 className="font-medium text-lg mb-1">Tablets</h3>
              <p className="text-sm text-gray-600 mb-2">Turn your tablet into cash!</p>
              <p className="text-sm text-gray-600 mb-3">Sell your iPad, Samsung Tab, and other tablets easily.</p>
              <Link to="/sell/device-selection" className="text-purple-600 text-sm font-medium flex items-center">
                Sell Now <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Smartwatches */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="mb-4 text-center">
                <div className="bg-orange-100 p-4 rounded-md inline-block">
                  <Watch className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <h3 className="font-medium text-lg mb-1">Smartwatches</h3>
              <p className="text-sm text-gray-600 mb-2">Get the best offer for your wearable!</p>
              <p className="text-sm text-gray-600 mb-3">Trade in your Apple Watch, Galaxy Watch, and more.</p>
              <Link to="/sell/device-selection" className="text-orange-600 text-sm font-medium flex items-center">
                Sell Now <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-3 text-center">How It Works</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Selling your device is quick and easy with our simple process.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Smartphone className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">Select Your Device</h3>
              <p className="text-gray-600 text-center text-sm">
                Choose your device and get an instant quote based on its condition.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Truck className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">Schedule Pickup</h3>
              <p className="text-gray-600 text-center text-sm">
                Book a free doorstep pickup at your convenient time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center md:col-span-2 lg:col-span-1">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <DollarSign className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-center">Get Paid</h3>
              <p className="text-gray-600 text-center text-sm">
                Receive payment through your preferred method upon verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Choose Us</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Best Value */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-4 flex justify-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2 text-center">Best Value</h3>
              <p className="text-gray-600 text-sm text-center">
                We offer competitive prices for your old devices, guaranteed. Our transparent pricing ensures you get the maximum value.
              </p>
            </div>

            {/* Free Pickup */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-4 flex justify-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2 text-center">Free Pickup</h3>
              <p className="text-gray-600 text-sm text-center">
                We handle pickup at a time that's convenient for you. No need to visit a store or ship your device.
              </p>
            </div>

            {/* Secure & Safe */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-4 flex justify-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2 text-center">Secure & Safe</h3>
              <p className="text-gray-600 text-sm text-center">
                Your data is secure with us. We ensure complete data erasure from your device before recycling or refurbishing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">What Our Customers Say</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex text-yellow-400 mb-2">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 italic">
                "I was skeptical at first, but the process was incredibly smooth. I got a great price for my old iPhone, and the payment was instant!"
              </p>
              <p className="font-medium">- Sarah Johnson</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex text-yellow-400 mb-2">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 italic">
                "The doorstep pickup was super convenient! The service was professional and the entire process took less than 10 minutes."
              </p>
              <p className="font-medium">- Michael Chen</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex text-yellow-400 mb-2">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 italic">
                "I compared prices with other services and Cash Old Device offered the best value. The process was transparent and hassle-free."
              </p>
              <p className="font-medium">- Priya Sharma</p>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-3">Making a Positive Environmental Impact</h2>
              <p className="text-gray-600 mb-6">
                By choosing to sell your device, you contribute to reducing e-waste and promoting a circular economy. Our certified recycling process ensures maximum environmental benefit.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Recycle className="text-green-600 h-5 w-5 mr-2" />
                  <span className="text-gray-600">Over 100,000+ devices recycled</span>
                </li>
                <li className="flex items-center">
                  <Recycle className="text-green-600 h-5 w-5 mr-2" />
                  <span className="text-gray-600">Reduced 500+ tons of e-waste</span>
                </li>
                <li className="flex items-center">
                  <Recycle className="text-green-600 h-5 w-5 mr-2" />
                  <span className="text-gray-600">ISO 14001 certified recycling process</span>
                </li>
              </ul>
            </div>
            <div>
              <img 
                src="/images/recycling-bins.jpg" 
                alt="Recycling bins" 
                className="rounded-lg shadow-sm w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Sell Your Device?</h2>
          <p className="mb-6">Get an instant quote and turn your unused devices into cash today!</p>
          <Link
            to="/sell/device-selection"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
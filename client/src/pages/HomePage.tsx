import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
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
  ChevronRight,
  CheckCircle,
  Clock,
  CreditCard,
  Shield,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

// Use ModelsContext instead of static data
import { useModels } from "../contexts/ModelsContext";

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
  brands: [],
};

// Environmental impact data
const environmentalImpact = {
  impactDescription: "By selling your old devices to us, you're contributing to reducing electronic waste and preserving our environment for future generations.",
  devicesRecycled: "50,000+",
  eWasteReduced: "500 tons",
  certification: "Certified E-Waste Management Partner"
};

const HomePage = () => {
  const { deviceTypes = [], brands = [], isLoading } = useModels();

  // Create homeData from context data
  const homeData = useMemo(() => {
    return {
      ...initialHomeData,
      deviceTypes: deviceTypes || [],
      brands: brands || [],
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
                Get instant valuation, free doorstep pickup, and quick payment
                for your used smartphones, laptops, tablets, and smartwatches.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/sell/device-selection"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
                >
                  Sell Now
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-400 transition-colors border border-blue-400"
                >
                  Shop Now
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
          <h2 className="text-2xl font-bold mb-8 text-center">
            Sell Your Devices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Smartphones */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="mb-4 text-center">
                <div className="bg-blue-100 p-4 rounded-md inline-block">
                  <Smartphone className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <h3 className="font-medium text-lg mb-1">Smartphones</h3>
              <p className="text-sm text-gray-600 mb-2">
                Best cash offer for your phone!
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Sell your used iPhone, Samsung, OnePlus, and other smartphones.
              </p>
              <Link
                to="/sell/smartphones"
                className="text-blue-600 text-sm font-medium flex items-center"
              >
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
              <p className="text-sm text-gray-600 mb-2">
                Upgrade your tech with extra cash!
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Get cash for your MacBook, Dell, HP, Lenovo, and more.
              </p>
              <Link
                to="/sell/laptops"
                className="text-green-600 text-sm font-medium flex items-center"
              >
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
              <p className="text-sm text-gray-600 mb-2">
                Turn your tablet into cash!
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Sell your iPad, Samsung Tab, and other tablets easily.
              </p>
              <Link
                to="/sell/tablets"
                className="text-purple-600 text-sm font-medium flex items-center"
              >
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
              <p className="text-sm text-gray-600 mb-2">
                Get the best offer for your wearable!
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Trade in your Apple Watch, Galaxy Watch, and more.
              </p>
              <Link
                to="/sell/smartwatches"
                className="text-orange-600 text-sm font-medium flex items-center"
              >
                Sell Now <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Selling your device is quick and easy with our simple process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="relative">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Smartphone className="h-10 w-10 text-blue-600" />
              </div>
              <div className="absolute top-10 left-1/2 w-full hidden lg:block">
                <div className="h-0.5 bg-blue-200 relative">
                  <div className="absolute -right-2 -top-1 w-3 h-3 rounded-full bg-blue-200"></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Select Your Device
                </h3>
                <p className="text-gray-600">
                  Choose your device and get an instant quote based on its
                  condition.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div className="absolute top-10 left-1/2 w-full hidden lg:block">
                <div className="h-0.5 bg-green-200 relative">
                  <div className="absolute -right-2 -top-1 w-3 h-3 rounded-full bg-green-200"></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Schedule Pickup</h3>
                <p className="text-gray-600">
                  Book a free doorstep pickup at your convenient time.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-purple-600" />
              </div>
              <div className="absolute top-10 left-1/2 w-full hidden lg:block">
                <div className="h-0.5 bg-purple-200 relative">
                  <div className="absolute -right-2 -top-1 w-3 h-3 rounded-full bg-purple-200"></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Device Inspection
                </h3>
                <p className="text-gray-600">
                  Quick inspection by our expert at your doorstep.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-10 w-10 text-orange-600" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Instant Payment</h3>
                <p className="text-gray-600">
                  Get paid instantly via your preferred payment method.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <a
              href="#device-categories"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-300"
              aria-label="Start selling your device"
            >
              Sell Your Device Now <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Value</h3>
              <p className="text-gray-600">
                We offer the best prices for your used devices, guaranteed. Our
                transparent pricing ensures you get the maximum value.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Pickup</h3>
              <p className="text-gray-600">
                We offer free doorstep pickup at a time that's convenient for
                you. No need to visit a store or ship your device.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure &amp; Safe</h3>
              <p className="text-gray-600">
                Your data security is our priority. We ensure complete data
                erasure from your device before recycling or refurbishing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">
            What Our Customers Say
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex text-yellow-400 mb-2">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 italic">
                "I was skeptical at first, but the process was incredibly
                smooth. I got a great price for my old iPhone, and the payment
                was instant!"
              </p>
              <p className="font-medium">- Sarah Johnson</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex text-yellow-400 mb-2">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 italic">
                "The doorstep pickup was super convenient! The service was
                professional and the entire process took less than 10 minutes."
              </p>
              <p className="font-medium">- Michael Chen</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex text-yellow-400 mb-2">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 italic">
                "I compared prices with other services and Cash Old Device
                offered the best value. The process was transparent and
                hassle-free."
              </p>
              <p className="font-medium">- Priya Sharma</p>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Impact Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Making a Positive Environmental Impact
              </h2>
              <p className="text-gray-600 mb-6">
                {environmentalImpact.impactDescription}
              </p>
              <div className="flex items-center mb-4">
                <Recycle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-gray-700">
                  Over {environmentalImpact.devicesRecycled} devices recycled
                </span>
              </div>
              <div className="flex items-center mb-4">
                <Recycle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-gray-700">
                  Reduced {environmentalImpact.eWasteReduced} of e-waste
                </span>
              </div>
              <div className="flex items-center">
                <Recycle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-gray-700">
                  {environmentalImpact.certification}
                </span>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                alt="Environmental sustainability"
                className="rounded-lg shadow-xl"
                loading="lazy"
                width="600"
                height="400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Sell Your Device?
          </h2>
          <p className="mb-6">
            Get an instant quote and turn your unused devices into cash today!
          </p>
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
};

export default HomePage;

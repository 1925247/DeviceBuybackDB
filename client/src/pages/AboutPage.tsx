import React from 'react';
import { DollarSign, Truck, Shield, Recycle, Users, Award, Target, Clock } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About Cash Old Device</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're on a mission to make selling used devices simple, transparent, and rewarding.
        </p>
      </div>

      {/* Our Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded in 2023, Cash Old Device started with a simple idea: make it easy for people to sell their used devices for the best price, without the hassle of negotiating with buyers or visiting multiple stores.
          </p>
          <p className="text-gray-600 mb-4">
            We noticed that many people had unused devices lying around in their drawers, either because they didn't know how to sell them or because the process was too complicated. We set out to solve this problem.
          </p>
          <p className="text-gray-600">
            Today, Cash Old Device is the leading device buyback platform, having served over 2 million customers and recycled more than 500,000 devices. Our commitment to offering the best prices, transparent valuations, and exceptional customer service has made us the trusted choice for selling used electronics.
          </p>
        </div>
        <div>
          <img 
            src="https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
            alt="Team working together" 
            className="rounded-lg shadow-xl"
          />
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fair Value</h3>
            <p className="text-gray-600">
              We're committed to offering the best prices for your devices, using transparent valuation methods.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trust & Security</h3>
            <p className="text-gray-600">
              Your data security is our priority. We ensure complete data erasure from all devices we receive.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Recycle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
            <p className="text-gray-600">
              We're committed to reducing e-waste through responsible recycling and refurbishing practices.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Customer First</h3>
            <p className="text-gray-600">
              We prioritize customer satisfaction with hassle-free processes and exceptional service.
            </p>
          </div>
        </div>
      </div>

      {/* How We're Different */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">How We're Different</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
            <p className="text-gray-600">
              We analyze market trends and device conditions to offer you the best possible price. If you find a better offer elsewhere, we'll match it.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Truck className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Free Doorstep Pickup</h3>
              <p className="text-gray-600">
                We offer free doorstep pickup to collect your device safely and promptly.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Instant Payment</h3>
              <p className="text-gray-600">
                We process payments instantly so you can get cash in hand as soon as your device is evaluated.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick & Convenient</h3>
            <p className="text-gray-600">
              We value your time. Our streamlined process ensures you receive a quote quickly and without any hassle.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-pink-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
            <p className="text-gray-600">
              We use advanced technology and secure processes to ensure your personal data is handled safely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

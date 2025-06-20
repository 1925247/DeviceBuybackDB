import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, DollarSign, Clock, Search, Check, ChevronRight } from 'lucide-react';
import DeviceIcon from '../components/ui/DeviceIcon';

const HomePage = () => {
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeviceTypes();
    fetchBrands();
  }, []);

  const fetchDeviceTypes = async () => {
    try {
      const response = await fetch('/api/device-types');
      const data = await response.json();
      setDeviceTypes(data.filter(dt => dt.active).slice(0, 4));
    } catch (error) {
      console.error('Error fetching device types:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      const data = await response.json();
      setBrands(data.filter(b => b.active && b.featured).slice(0, 4));
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/sell?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const features = [
    {
      icon: DollarSign,
      title: 'Best Prices',
      description: 'Get the highest value for your devices with our competitive pricing algorithm.'
    },
    {
      icon: Clock,
      title: 'Quick Process',
      description: 'Simple evaluation process that takes just minutes to complete.'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Your data is protected with enterprise-grade security measures.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <div className="text-left mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Sell Old Mobile Phone for Instant Cash
            </h1>
            
            {/* Value Propositions */}
            <div className="flex flex-wrap gap-8 mb-12">
              <div className="flex items-center gap-3">
                <Check className="h-6 w-6 text-teal-500 flex-shrink-0" />
                <span className="text-lg font-medium text-gray-700">Maximum Value</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-6 w-6 text-teal-500 flex-shrink-0" />
                <span className="text-lg font-medium text-gray-700">Safe & Hassle-free</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-6 w-6 text-teal-500 flex-shrink-0" />
                <span className="text-lg font-medium text-gray-700">Free Doorstep Pickup</span>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-12">
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search your Mobile Phone to sell"
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
            </form>

            {/* Brand Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-6 text-lg font-medium text-gray-600">Or choose a brand</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/sell/smartphone/${brand.slug}`}
                    className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-6 min-w-[120px] flex flex-col items-center justify-center group"
                  >
                    {brand.logo && (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="h-8 w-auto mb-2 group-hover:scale-105 transition-transform"
                      />
                    )}
                    <span className="font-medium text-gray-700 text-center">{brand.name}</span>
                  </Link>
                ))}
                <Link
                  to="/sell"
                  className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-6 min-w-[120px] flex flex-col items-center justify-center group"
                >
                  <span className="font-medium text-gray-700">More Brands</span>
                  <ChevronRight className="h-4 w-4 text-gray-500 mt-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Device Types Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Device Are You Selling?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deviceTypes.map((device) => (
              <Link
                key={device.id}
                to={`/sell/${device.slug}`}
                className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-8 text-center">
                  <DeviceIcon 
                    deviceType={device} 
                    size="md"
                    className="mx-auto mb-4 group-hover:scale-110 transition-transform"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{device.name}</h3>
                  <p className="text-gray-600">{device.description || `Get instant quotes for your ${device.name.toLowerCase()}`}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Cash Old Device?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Select Device', description: 'Choose your device type and model' },
              { step: '2', title: 'Answer Questions', description: 'Tell us about your device condition' },
              { step: '3', title: 'Get Quote', description: 'Receive an instant price quote' },
              { step: '4', title: 'Get Paid', description: 'Complete the sale and get paid' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Turn Your Device Into Cash?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who have sold their devices with us.
          </p>
          <Link
            to="/sell"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Laptop, 
  Tablet, 
  Watch, 
  ArrowRight, 
  DollarSign, 
  Truck, 
  Shield, 
  Recycle,
  CheckCircle,
  Clock,
  CreditCard
} from 'lucide-react';

// Import dynamic content from shared data file
import { 
  headerTitle, 
  headerDescription, 
  iconMapping, 
  deviceCategories, 
  testimonials, 
  environmentalImpact 
} from '/home/project/src/db/homeData';

// Helper function to map category colors to Tailwind classes
const getBgClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100'
  };
  return colorMap[color] || 'bg-gray-100';
};

const getTextClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };
  return colorMap[color] || 'text-gray-600';
};

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side: Main header content */}
            <div>
              {headerTitle}
              {headerDescription}
              <div className="flex flex-wrap gap-4">
                <a
                  href="#device-categories"
                  className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300"
                  aria-label="Sell your device now"
                >
                  Sell Now
                </a>
                <Link
                  to="/buy"
                  className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300"
                  aria-label="Buy a device"
                >
                  Buy Now
                </Link>
                <a
                  href="#how-it-works"
                  className="bg-transparent border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
                  aria-label="Learn how it works"
                >
                  How It Works
                </a>
              </div>
            </div>
            {/* Right side: Hero image */}
            <div className="hidden md:block">
              <img 
                src="https://www.quickmobile.in/assets/images/sold_sell_side.webp" 
                alt="Sell your smartphone and get instant cash"
                className="rounded-lg shadow-xl"
                loading="lazy"
                width="600"
                height="400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Device Categories Section */}
      <section id="device-categories" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Sell Your Devices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {deviceCategories.map((category) => (
              <Link
                key={category.name}
                to={category.route}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 group"
                aria-label={`Sell your ${category.name}`}
              >
                <div className={`p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 ${getBgClass(category.color)} group-hover:scale-110 transition-transform`}>
                  {iconMapping[category.icon]}
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600 mb-2">{category.tagline}</p>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className={`flex items-center font-medium ${getTextClass(category.color)} group-hover:translate-x-2 transition-transform`}>
                  Sell Now <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            ))}
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
                <h3 className="text-xl font-semibold mb-2">Select Your Device</h3>
                <p className="text-gray-600">
                  Choose your device and get an instant quote based on its condition.
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
                <h3 className="text-xl font-semibold mb-2">Device Inspection</h3>
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
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Value</h3>
              <p className="text-gray-600">
                We offer the best prices for your used devices, guaranteed. Our transparent pricing ensures you get the maximum value.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Pickup</h3>
              <p className="text-gray-600">
                We offer free doorstep pickup at a time that's convenient for you. No need to visit a store or ship your device.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure &amp; Safe</h3>
              <p className="text-gray-600">
                Your data security is our priority. We ensure complete data erasure from your device before recycling or refurbishing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform"
              >
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg 
                        key={i} 
                        className="w-5 h-5 fill-current" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="text-gray-600 mb-4">{testimonial.text}</div>
                <div className="font-medium">- {testimonial.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Environmental Impact Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Making a Positive Environmental Impact</h2>
              <p className="text-gray-600 mb-6">
                {environmentalImpact.impactDescription}
              </p>
              <div className="flex items-center mb-4">
                <Recycle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-gray-700">Over {environmentalImpact.devicesRecycled} devices recycled</span>
              </div>
              <div className="flex items-center mb-4">
                <Recycle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-gray-700">Reduced {environmentalImpact.eWasteReduced} of e-waste</span>
              </div>
              <div className="flex items-center">
                <Recycle className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-gray-700">{environmentalImpact.certification}</span>
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

      {/* CTA Section */}
      <section className="bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Sell Your Device?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Get an instant quote and turn your unused devices into cash today!
          </p>
          <a 
            href="#device-categories" 
            className="inline-flex items-center bg-white text-blue-700 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-100 transition duration-300"
            aria-label="Start selling your device now"
          >
            Get Started Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
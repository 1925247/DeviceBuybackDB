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
import { homeData } from '../db/homeData';
// Use ModelsContext instead of static data
import { useModels } from '../contexts/ModelsContext';

// Helper function to map category colors to Tailwind classes
const getBgClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
  };
  return colorMap[color] || 'bg-gray-100 text-gray-800';
};

// Icon component mapping
const IconComponent = (iconName: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    'smartphone': <Smartphone className="w-12 h-12 text-blue-500" />,
    'laptop': <Laptop className="w-12 h-12 text-green-500" />,
    'tablet': <Tablet className="w-12 h-12 text-purple-500" />,
    'watch': <Watch className="w-12 h-12 text-orange-500" />
  };
  return iconMap[iconName] || <Smartphone className="w-12 h-12 text-blue-500" />;
};

const HomePage: React.FC = () => {
  // Get device types from ModelsContext
  const { deviceTypes, isLoading, error } = useModels();
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {homeData.hero.title}
            </h1>
            <p className="mt-6 text-xl max-w-prose">
              {homeData.hero.subtitle}
            </p>
            <div className="mt-10">
              <Link
                to="/sell/device-selection"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                {homeData.hero.ctaText}
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {homeData.howItWorks.title}
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              {homeData.howItWorks.subtitle}
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">{homeData.howItWorks.steps[0].title}</h3>
              <p className="mt-2 text-base text-gray-500">{homeData.howItWorks.steps[0].description}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">{homeData.howItWorks.steps[1].title}</h3>
              <p className="mt-2 text-base text-gray-500">{homeData.howItWorks.steps[1].description}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">{homeData.howItWorks.steps[2].title}</h3>
              <p className="mt-2 text-base text-gray-500">{homeData.howItWorks.steps[2].description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Device Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {homeData.deviceTypes.title}
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              {homeData.deviceTypes.subtitle}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <div className="col-span-4 text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-2 text-gray-600">Loading device types...</p>
              </div>
            ) : error ? (
              <div className="col-span-4 text-center py-8 text-red-600">
                <p>Error loading device types. Please try again later.</p>
              </div>
            ) : (
              deviceTypes.map(category => (
                <Link
                  key={category.id}
                  to={`/sell/${category.slug}`}
                  className="group relative rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="mb-4">
                      {IconComponent(category.icon)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {category.description || `${category.name} devices`}
                    </p>
                    <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                      Sell Your {category.name}
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {homeData.featuredBrands.title}
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              {homeData.featuredBrands.subtitle}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
            {homeData.featuredBrands.brands.map((brand, index) => (
              <div key={index} className="flex justify-center">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-12 object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Sell With Us?
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              We offer the best experience and value when selling your used devices.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Best Prices</h3>
              <p className="mt-2 text-sm text-gray-500">
                We offer competitive prices for your devices based on their condition and market value.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Quick Process</h3>
              <p className="mt-2 text-sm text-gray-500">
                Our streamlined process ensures you get an instant quote and quick payment.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Free Pickup</h3>
              <p className="mt-2 text-sm text-gray-500">
                We offer free doorstep pickup at a time that's convenient for you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Instant Payment</h3>
              <p className="mt-2 text-sm text-gray-500">
                Receive payment via your preferred method as soon as your device is verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {homeData.testimonials.title}
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              {homeData.testimonials.subtitle}
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {homeData.testimonials.items.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
                <div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {homeData.environmentalImpact.title}
            </h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto opacity-80">
              {homeData.environmentalImpact.subtitle}
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {homeData.environmentalImpact.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold">{stat.value}</p>
                <p className="mt-2 text-lg opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Recycle className="w-12 h-12" />
            </div>
            <p className="text-lg opacity-90">
              {homeData.environmentalImpact.description}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-700 rounded-3xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:p-12 md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  {homeData.cta.title}
                </h2>
                <p className="mt-3 text-indigo-200 max-w-3xl">
                  {homeData.cta.description}
                </p>
              </div>
              <div className="mt-8 md:mt-0">
                <Link
                  to="/sell/device-selection"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 transition-colors duration-200"
                >
                  {homeData.cta.buttonText}
                  <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
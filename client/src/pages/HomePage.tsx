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
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';

// Use ModelsContext instead of static data
import { useModels } from '../contexts/ModelsContext';

// Define a homeData structure to replace the static import
const defaultHomeData = {
  hero: {
    title: "Trade in or buy refurbished devices",
    subtitle: "Get the best value for your old device or find great deals on certified refurbished products"
  },
  howItWorks: {
    title: "How It Works",
    subtitle: "Simple process to trade in your device or buy a refurbished one",
    steps: [
      {
        title: "Select Your Device",
        description: "Choose your device type, brand, and model"
      },
      {
        title: "Get an Instant Quote",
        description: "Answer a few questions and receive an instant value estimate"
      },
      {
        title: "Get Paid Fast",
        description: "Ship your device or schedule a pickup and get paid quickly"
      }
    ]
  },
  deviceTypes: {
    title: "Choose Your Device Type",
    subtitle: "Select the type of device you want to sell or browse"
  },
  featuredBrands: {
    title: "Popular Brands",
    subtitle: "Browse devices from top manufacturers",
    brands: []
  },
  testimonials: {
    title: "What Our Customers Say",
    subtitle: "Thousands of satisfied customers have sold and purchased devices through our platform",
    items: [
      {
        name: "Sarah J.",
        text: "I was amazed by how easy it was to sell my old iPhone. The quote was fair and I received payment within 24 hours of them receiving my device!",
        rating: 5
      },
      {
        name: "Michael T.",
        text: "The refurbished MacBook I purchased works perfectly! It looks brand new and came with a solid warranty. Saved me hundreds of dollars.",
        rating: 5
      },
      {
        name: "Priya K.",
        text: "I've used this service multiple times to sell old gadgets. The process is always smooth and they consistently offer better prices than other buyback services.",
        rating: 4
      }
    ]
  },
  environmentalImpact: {
    title: "Our Environmental Impact",
    subtitle: "Together we're reducing electronic waste and making a difference",
    description: "By buying and selling refurbished devices, you're helping extend the lifecycle of electronics and reducing the environmental impact of manufacturing new products.",
    stats: [
      {
        value: "50,000+",
        label: "Devices Recycled"
      },
      {
        value: "500+",
        label: "Tons of e-Waste Prevented"
      },
      {
        value: "10,000+",
        label: "Trees Saved"
      }
    ]
  }
};

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
  
  // Use the default home data
  const [homeData, setHomeData] = React.useState(defaultHomeData);
  
  // Fetch brands data to populate the featured brands
  const { data: brandsData = [] } = useQuery({
    queryKey: ['/api/brands'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/brands');
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setHomeData(prev => ({
        ...prev,
        featuredBrands: {
          ...prev.featuredBrands,
          brands: data.slice(0, 6).map((brand: any) => ({
            id: brand.id,
            name: brand.name,
            logo: brand.logo
          }))
        }
      }));
    }
  });
  
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
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/sell/device-selection"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <Recycle className="mr-2 h-5 w-5" />
                Sell Your Device
              </Link>
              <Link
                to="/buy"
                className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-40 transition-colors duration-200"
              >
                <Smartphone className="mr-2 h-5 w-5" />
                Shop Refurbished
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Featured Refurbished Devices
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              Explore our collection of certified refurbished devices at unbeatable prices. All devices come with a 1-year warranty.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Product Card 1 */}
            <div className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="aspect-w-3 aspect-h-2 bg-gray-100">
                <img
                  src="/assets/products/iphone-13-pro.png"
                  alt="iPhone 13 Pro"
                  className="w-full h-56 object-contain p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/placeholder.png';
                  }}
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">iPhone 13 Pro</h3>
                    <p className="mt-1 text-sm text-gray-500">256GB • Graphite • Excellent</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">20% OFF</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">$699.99</p>
                    <p className="text-sm text-gray-500 line-through">$879.99</p>
                  </div>
                  <Link
                    to="/buy/details/iphone-13-pro"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="aspect-w-3 aspect-h-2 bg-gray-100">
                <img
                  src="/assets/products/samsung-s22-ultra.png"
                  alt="Samsung Galaxy S22 Ultra"
                  className="w-full h-56 object-contain p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/placeholder.png';
                  }}
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Galaxy S22 Ultra</h3>
                    <p className="mt-1 text-sm text-gray-500">512GB • Burgundy • Excellent</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">TRENDING</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">$749.99</p>
                    <p className="text-sm text-gray-500 line-through">$899.99</p>
                  </div>
                  <Link
                    to="/buy/details/samsung-galaxy-s22-ultra"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="aspect-w-3 aspect-h-2 bg-gray-100">
                <img
                  src="/assets/products/macbook-pro.png"
                  alt="MacBook Pro 14-inch"
                  className="w-full h-56 object-contain p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/placeholder.png';
                  }}
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">MacBook Pro 14"</h3>
                    <p className="mt-1 text-sm text-gray-500">M2 • 16GB • 512GB • Good</p>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">HOT DEAL</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">$1,299.99</p>
                    <p className="text-sm text-gray-500 line-through">$1,599.99</p>
                  </div>
                  <Link
                    to="/buy/details/macbook-pro-14"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Product Card 4 */}
            <div className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="aspect-w-3 aspect-h-2 bg-gray-100">
                <img
                  src="/assets/products/ipad-pro.png"
                  alt="iPad Pro 12.9-inch"
                  className="w-full h-56 object-contain p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/placeholder.png';
                  }}
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">iPad Pro 12.9"</h3>
                    <p className="mt-1 text-sm text-gray-500">M1 • 256GB • Silver • Excellent</p>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">LAST ONE</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">$899.99</p>
                    <p className="text-sm text-gray-500 line-through">$1,099.99</p>
                  </div>
                  <Link
                    to="/buy/details/ipad-pro-12-9"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/buy"
              className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Browse All Products
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
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
          <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-3xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:p-12">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-white md:text-4xl">
                  Join Our Marketplace
                </h2>
                <p className="mt-4 text-lg text-indigo-100">
                  Buy certified refurbished devices at great prices or sell your used devices for instant cash.
                </p>
              </div>
              
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/sell/device-selection"
                  className="flex-1 max-w-xs mx-auto sm:mx-0 flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-lg text-indigo-700 bg-white hover:bg-indigo-50 transition-colors duration-200"
                >
                  <Recycle className="mr-2 h-5 w-5" />
                  Sell Your Device
                </Link>
                <Link
                  to="/buy"
                  className="flex-1 max-w-xs mx-auto sm:mx-0 flex items-center justify-center px-8 py-4 border border-white border-opacity-25 text-lg font-medium rounded-xl shadow-lg text-white bg-indigo-600 bg-opacity-40 hover:bg-opacity-50 transition-colors duration-200"
                >
                  <Smartphone className="mr-2 h-5 w-5" />
                  Shop Refurbished
                </Link>
              </div>
              
              <div className="mt-8 flex justify-center space-x-6">
                <div className="flex items-center text-white">
                  <Shield className="h-5 w-5 mr-2" />
                  <span className="text-sm">1-Year Warranty</span>
                </div>
                <div className="flex items-center text-white">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm">Quality Verified</span>
                </div>
                <div className="flex items-center text-white">
                  <Truck className="h-5 w-5 mr-2" />
                  <span className="text-sm">Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
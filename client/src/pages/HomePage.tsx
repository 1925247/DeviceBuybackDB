import React, { useState, useEffect } from 'react';
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

// Empty initial state
const initialHomeData = {
  hero: {
    title: "",
    subtitle: ""
  },
  howItWorks: {
    title: "",
    subtitle: "",
    steps: []
  },
  deviceTypes: {
    title: "",
    subtitle: ""
  },
  featuredBrands: {
    title: "",
    subtitle: "",
    brands: []
  },
  testimonials: {
    title: "",
    subtitle: "",
    items: []
  },
  environmentalImpact: {
    title: "",
    subtitle: "",
    description: "",
    stats: []
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
  const { deviceTypes, brands } = useModels();
  const [homeData, setHomeData] = useState(initialHomeData);
  const [loading, setLoading] = useState(true);

  // Fetch all homepage sections
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['/api/home-sections'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/home-sections');
        if (!response.ok) {
          throw new Error('Failed to fetch home sections');
        }
        return await response.json();
      } catch (error) {
        // If API isn't implemented yet, return empty array
        console.error('Error fetching home sections:', error);
        return [];
      }
    },
  });

  // Fetch brand data
  const { data: brandsData = [] } = useQuery({
    queryKey: ['/api/brands'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/brands');
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      return await response.json();
    },
  });

  // Update homeData with sections from API or fallback
  useEffect(() => {
    if (sections && sections.length > 0) {
      // Process sections into homeData structure
      const newHomeData = { ...initialHomeData };
      
      sections.forEach((section: SectionData) => {
        if (section.active) {
          // Parse content JSON if it exists
          let content = {};
          try {
            if (section.content) {
              content = JSON.parse(section.content);
            }
          } catch (e) {
            console.error(`Error parsing JSON for section ${section.name}:`, e);
          }
          
          // Update homeData with section data
          if (section.name === 'hero') {
            newHomeData.hero = {
              title: section.title,
              subtitle: section.subtitle
            };
          } else if (section.name === 'howItWorks') {
            newHomeData.howItWorks = {
              title: section.title,
              subtitle: section.subtitle,
              steps: content.steps || []
            };
          } else if (section.name === 'deviceTypes') {
            newHomeData.deviceTypes = {
              title: section.title,
              subtitle: section.subtitle
            };
          } else if (section.name === 'featuredBrands') {
            newHomeData.featuredBrands = {
              title: section.title,
              subtitle: section.subtitle,
              brands: newHomeData.featuredBrands.brands
            };
          } else if (section.name === 'testimonials') {
            newHomeData.testimonials = {
              title: section.title,
              subtitle: section.subtitle,
              items: content.items || []
            };
          } else if (section.name === 'environmentalImpact') {
            newHomeData.environmentalImpact = {
              title: section.title,
              subtitle: section.subtitle,
              description: content.description || '',
              stats: content.stats || []
            };
          }
        }
      });
      
      // Set featured brands from brandsData
      if (brandsData && brandsData.length > 0) {
        newHomeData.featuredBrands.brands = brandsData.slice(0, 6).map((brand: any) => ({
          id: brand.id,
          name: brand.name,
          logo: brand.logo
        }));
      }
      
      setHomeData(newHomeData);
      setLoading(false);
    }
  }, [sections, brandsData]);
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {loading ? (
                <Skeleton className="h-12 w-3/4 mb-2 bg-gray-200/20" />
              ) : (
                homeData.hero.title
              )}
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              {loading ? (
                <Skeleton className="h-8 w-full mb-2 bg-gray-200/20" />
              ) : (
                homeData.hero.subtitle
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/sell/device-selection" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md bg-white text-blue-700 hover:bg-gray-100">
                Sell a Device
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/buy" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600">
                Buy Refurbished
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {loading ? (
                <Skeleton className="h-10 w-64 mx-auto mb-2" />
              ) : (
                homeData.howItWorks.title
              )}
            </h2>
            <p className="text-xl text-gray-600">
              {loading ? (
                <Skeleton className="h-6 w-96 mx-auto" />
              ) : (
                homeData.howItWorks.subtitle
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-40 mx-auto mb-2" />
                  <Skeleton className="h-4 w-56 mx-auto mb-1" />
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              ))
            ) : (
              homeData.howItWorks.steps.map((step, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 text-2xl font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Device Types */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {loading ? (
                <Skeleton className="h-10 w-64 mx-auto mb-2" />
              ) : (
                homeData.deviceTypes.title
              )}
            </h2>
            <p className="text-xl text-gray-600">
              {loading ? (
                <Skeleton className="h-6 w-96 mx-auto" />
              ) : (
                homeData.deviceTypes.subtitle
              )}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {deviceTypes.length > 0 ? (
              deviceTypes.map((type) => (
                <Link 
                  key={type.id} 
                  to={`/sell/${type.slug}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="mb-4">
                      {IconComponent(type.slug)}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.name}</h3>
                    <p className="text-gray-600 mb-4">Sell or buy {type.name.toLowerCase()} devices</p>
                    <div className="flex items-center text-blue-600">
                      <span className="font-medium">Get started</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
                  <div className="p-6">
                    <Skeleton className="h-12 w-12 rounded mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48 mb-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {loading ? (
                <Skeleton className="h-10 w-64 mx-auto mb-2" />
              ) : (
                homeData.featuredBrands.title
              )}
            </h2>
            <p className="text-xl text-gray-600">
              {loading ? (
                <Skeleton className="h-6 w-96 mx-auto" />
              ) : (
                homeData.featuredBrands.subtitle
              )}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {homeData.featuredBrands.brands.length > 0 ? (
              homeData.featuredBrands.brands.map((brand) => (
                <div key={brand.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-center h-32">
                  {brand.logo ? (
                    <img 
                      src={brand.logo} 
                      alt={brand.name} 
                      className="max-h-16 max-w-full object-contain" 
                    />
                  ) : (
                    <span className="text-xl font-semibold text-gray-900">{brand.name}</span>
                  )}
                </div>
              ))
            ) : (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow flex items-center justify-center h-32">
                  <Skeleton className="h-12 w-3/4" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {loading ? (
                <Skeleton className="h-10 w-64 mx-auto mb-2" />
              ) : (
                homeData.testimonials.title
              )}
            </h2>
            <p className="text-xl text-gray-600">
              {loading ? (
                <Skeleton className="h-6 w-96 mx-auto" />
              ) : (
                homeData.testimonials.subtitle
              )}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-12 w-12 rounded-full mr-4" />
                    <div>
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex">
                    {Array(5).fill(0).map((_, j) => (
                      <Skeleton key={j} className="h-5 w-5 mr-1 rounded-full" />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              homeData.testimonials.items.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-500 text-sm">Customer</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                  <div className="flex">
                    {Array(5).fill(0).map((_, i) => (
                      <span key={i} className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">
              {loading ? (
                <Skeleton className="h-10 w-64 mx-auto mb-2 bg-white/20" />
              ) : (
                homeData.environmentalImpact.title
              )}
            </h2>
            <p className="text-xl">
              {loading ? (
                <Skeleton className="h-6 w-96 mx-auto bg-white/20" />
              ) : (
                homeData.environmentalImpact.subtitle
              )}
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-lg">
              {loading ? (
                <>
                  <Skeleton className="h-5 w-full mb-2 bg-white/20" />
                  <Skeleton className="h-5 w-5/6 mx-auto bg-white/20" />
                </>
              ) : (
                homeData.environmentalImpact.description
              )}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-center">
                  <Skeleton className="h-12 w-24 mx-auto mb-2 bg-white/20" />
                  <Skeleton className="h-6 w-32 mx-auto bg-white/20" />
                </div>
              ))
            ) : (
              homeData.environmentalImpact.stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-lg">{stat.label}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Why Choose Us</h2>
            <p className="text-xl text-gray-600">The benefits of buying and selling through our platform</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-blue-600 mb-4">
                <DollarSign className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Value</h3>
              <p className="text-gray-600">Get the best prices when selling your device or buying refurbished</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-blue-600 mb-4">
                <Truck className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on all purchases and free shipping kits for trade-ins</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-blue-600 mb-4">
                <Shield className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">All devices undergo rigorous testing and come with a warranty</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-blue-600 mb-4">
                <Recycle className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Eco-Friendly</h3>
              <p className="text-gray-600">Reduce e-waste and minimize environmental impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">Whether you're looking to sell your device or find a great deal on a refurbished one, we're here to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sell/device-selection" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md bg-white text-blue-700 hover:bg-gray-100">
              Sell a Device
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/buy" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700">
              Buy Refurbished
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Process</h2>
            <p className="text-xl text-gray-600">Simple, transparent, and hassle-free</p>
          </div>
          
          <div className="relative">
            {/* Process steps with connecting line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-blue-200"></div>
            
            <div className="space-y-12 relative">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right">
                  <div className="text-blue-600 mb-2 md:hidden">
                    <CheckCircle className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Your Device</h3>
                  <p className="text-gray-600">Tell us about your device – choose the type, brand, and model</p>
                </div>
                <div className="hidden md:flex justify-center items-center">
                  <div className="bg-blue-600 text-white rounded-full p-2 z-10">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12 mt-4 md:mt-0">
                  <img src="https://via.placeholder.com/300x200" alt="Select device" className="rounded-lg shadow-md mx-auto md:mx-0" />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row-reverse items-center">
                <div className="md:w-1/2 md:pl-12 md:text-left">
                  <div className="text-blue-600 mb-2 md:hidden">
                    <CreditCard className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Paid Quickly</h3>
                  <p className="text-gray-600">Choose your preferred payment method and get paid fast</p>
                </div>
                <div className="hidden md:flex justify-center items-center">
                  <div className="bg-blue-600 text-white rounded-full p-2 z-10">
                    <CreditCard className="h-6 w-6" />
                  </div>
                </div>
                <div className="md:w-1/2 md:pr-12 mt-4 md:mt-0">
                  <img src="https://via.placeholder.com/300x200" alt="Get paid" className="rounded-lg shadow-md mx-auto md:mx-0" />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right">
                  <div className="text-blue-600 mb-2 md:hidden">
                    <Clock className="h-8 w-8 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ship Your Device</h3>
                  <p className="text-gray-600">Use our free shipping kit or schedule a pickup</p>
                </div>
                <div className="hidden md:flex justify-center items-center">
                  <div className="bg-blue-600 text-white rounded-full p-2 z-10">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12 mt-4 md:mt-0">
                  <img src="https://via.placeholder.com/300x200" alt="Ship device" className="rounded-lg shadow-md mx-auto md:mx-0" />
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
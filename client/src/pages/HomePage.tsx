import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Laptop, 
  Tablet, 
  Watch, 
  ArrowRight, 
  Shield, 
  Recycle,
  Clock
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

interface HowItWorksStep {
  title: string;
  description: string;
}

interface TestimonialItem {
  name: string;
  text: string;
  rating: number;
}

interface StatItem {
  value: string;
  label: string;
}

interface ContentData {
  steps?: HowItWorksStep[];
  items?: TestimonialItem[];
  description?: string;
  stats?: StatItem[];
}

interface BrandData {
  id: number;
  name: string;
  logo?: string;
  slug: string;
}

interface DeviceTypeData {
  id: number;
  name: string;
  slug: string;
}

interface HomeData {
  hero: {
    title: string;
    subtitle: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: HowItWorksStep[];
  };
  deviceTypes: DeviceTypeData[];
  brands: BrandData[];
  testimonials: {
    title: string;
    subtitle: string;
    items: TestimonialItem[];
  };
  stats: {
    title: string;
    subtitle: string;
    stats: StatItem[];
  };
}

const initialHomeData: HomeData = {
  hero: {
    title: 'Trade In Your Devices for Cash or Find Certified Refurbished Gadgets',
    subtitle: 'Get the best value for your old tech and discover affordable refurbished devices'
  },
  howItWorks: {
    title: 'How It Works',
    subtitle: 'Simple process to buy or sell devices',
    steps: []
  },
  deviceTypes: [],
  brands: [],
  testimonials: {
    title: 'What Our Customers Say',
    subtitle: 'Trusted by thousands',
    items: []
  },
  stats: {
    title: 'Our Environmental Impact',
    subtitle: 'Together we\'re making a difference',
    stats: []
  }
};

const HomePage = () => {
  const { deviceTypes, brands: brandsData = [] } = useModels();
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<HomeData>(initialHomeData);

  // Fetch home sections from API
  const { data: sections = [] } = useQuery<SectionData[]>({
    queryKey: ['/api/home-sections'],
  });

  // Process API data to update home content
  useEffect(() => {
    if (sections.length > 0 && brandsData.length > 0) {
      const newHomeData = { ...initialHomeData };
      
      // Add device types and brands from context
      newHomeData.deviceTypes = deviceTypes || [];
      newHomeData.brands = brandsData || [];
      
      // Process sections from the API
      sections.forEach((section: SectionData) => {
        if (section.name === 'hero' && section.active) {
          newHomeData.hero.title = section.title;
          newHomeData.hero.subtitle = section.subtitle;
        }
        
        if (section.name === 'how_it_works' && section.active) {
          newHomeData.howItWorks.title = section.title;
          newHomeData.howItWorks.subtitle = section.subtitle;
          
          try {
            let content: ContentData = {};
            if (section.content) {
              content = JSON.parse(section.content);
            }
            if (content.steps) {
              newHomeData.howItWorks.steps = content.steps;
            }
          } catch (error) {
            console.error('Error parsing how it works content:', error);
          }
        }
        
        if (section.name === 'testimonials' && section.active) {
          newHomeData.testimonials.title = section.title;
          newHomeData.testimonials.subtitle = section.subtitle;
          
          try {
            let content: ContentData = {};
            if (section.content) {
              content = JSON.parse(section.content);
            }
            if (content.items) {
              newHomeData.testimonials.items = content.items;
            }
          } catch (error) {
            console.error('Error parsing testimonials content:', error);
          }
        }
        
        if (section.name === 'environmental_impact' && section.active) {
          newHomeData.stats.title = section.title;
          newHomeData.stats.subtitle = section.subtitle;
          
          try {
            let content: ContentData = {};
            if (section.content) {
              content = JSON.parse(section.content);
            }
            if (content.stats) {
              newHomeData.stats.stats = content.stats;
            }
          } catch (error) {
            console.error('Error parsing environmental impact content:', error);
          }
        }
      });
      
      setHomeData(newHomeData);
      setLoading(false);
    }
  }, [sections, brandsData, deviceTypes]);
  
  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {loading ? (
                  <Skeleton className="h-12 w-full bg-white/20" />
                ) : (
                  homeData.hero.title
                )}
              </h1>
              {loading ? (
                <div className="text-xl mb-8">
                  <Skeleton className="h-6 w-full bg-white/20" />
                </div>
              ) : (
                <p className="text-xl mb-8">
                  {homeData.hero.subtitle}
                </p>
              )}
              <Link to="/sell" className="bg-white text-primary-900 px-6 py-3 rounded-full font-semibold inline-flex items-center hover:bg-gray-100 transition-all">
                Sell Your Device <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <img
                  src="/hero-devices.png"
                  alt="Tech devices"
                  className="rounded-lg shadow-lg w-full"
                />
                <div className="absolute -bottom-5 -right-5 bg-secondary text-white p-3 rounded-lg shadow-lg">
                  <p className="text-sm font-bold">Up to</p>
                  <p className="text-2xl font-bold">$500</p>
                  <p className="text-xs">for your old phone</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Moved to top */}
      <section className="py-8 bg-gradient-to-r from-primary-700 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sell"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full bg-white text-primary-900 hover:bg-gray-100 transition-colors"
            >
              Sell Your Device
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/buy"
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-full text-white hover:bg-primary-600 transition-colors"
            >
              Shop Refurbished
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Eco-friendly banner */}
      <section className="bg-green-50 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <Recycle className="text-green-600 h-6 w-6 mr-2" />
            <p className="text-green-800 font-medium">
              Every refurbished device saves up to 100kg of CO2 emissions
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Browse by Device Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeletons
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="h-16 w-16 rounded-full mb-3" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))
            ) : (
              // Actual content
              homeData.deviceTypes.map((type) => (
                <Link
                  to={`/buy/category/${type.slug}`}
                  key={type.id}
                  className="flex flex-col items-center p-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {type.name === "Smartphone" ? (
                    <Smartphone className="h-16 w-16 text-primary-600 mb-3" />
                  ) : type.name === "Laptop" ? (
                    <Laptop className="h-16 w-16 text-primary-600 mb-3" />
                  ) : type.name === "Tablet" ? (
                    <Tablet className="h-16 w-16 text-primary-600 mb-3" />
                  ) : (
                    <Watch className="h-16 w-16 text-primary-600 mb-3" />
                  )}
                  <span className="text-lg font-medium">{type.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="py-16 bg-gradient-to-r from-green-800 to-green-700 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Make an Environmental Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <Recycle className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Reduce E-Waste</h3>
              <p>By trading in your old devices, you're helping to keep harmful electronics out of landfills and supporting a circular economy.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <Shield className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Save Resources</h3>
              <p>Each refurbished device saves precious rare earth minerals and reduces the environmental impact of manufacturing new devices.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <Clock className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Extend Device Lifespan</h3>
              <p>Our certified refurbishment process extends the useful life of quality devices, reducing overall consumption and waste.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {loading ? (
                <Skeleton className="h-10 w-64 mx-auto mb-2" />
              ) : (
                homeData.howItWorks.title
              )}
            </h2>
            {loading ? (
              <Skeleton className="h-6 w-96 mx-auto" />
            ) : (
              <p className="text-lg text-gray-600">
                {homeData.howItWorks.subtitle}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeletons
              Array(3).fill(0).map((_, i) => (
                <div className="bg-white p-6 rounded-lg shadow-sm" key={i}>
                  <div className="flex justify-center mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-32 mx-auto mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
                </div>
              ))
            ) : (
              // Actual steps
              (homeData.howItWorks.steps.length > 0 ? homeData.howItWorks.steps : [
                {
                  title: "Select Your Device",
                  description: "Choose the device you want to sell or browse our refurbished products to buy."
                },
                {
                  title: "Get an Instant Quote",
                  description: "Answer a few questions about your device's condition to receive an immediate buyback offer."
                },
                {
                  title: "Ship or Receive",
                  description: "Ship your device to us for free or receive your refurbished purchase with our no-hassle warranty."
                }
              ]).map((step, index) => (
                <div className="bg-white p-6 rounded-lg shadow-sm relative" key={index}>
                  <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Popular Brands */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Brands</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeletons for brands
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="h-16 w-16 rounded mb-3" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))
            ) : (
              // Actual brands
              homeData.brands.map((brand) => (
                <Link
                  to={`/buy/brand/${brand.slug}`}
                  key={brand.id}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {brand.logo ? (
                    <img 
                      src={brand.logo} 
                      alt={brand.name} 
                      className="h-16 w-auto mb-3 object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <span className="text-xl font-semibold text-primary-600">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-lg font-medium">{brand.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeletons for testimonials
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
              ))
            ) : (
              // Actual testimonials
              (homeData.testimonials.items.length > 0 ? homeData.testimonials.items : [
                {
                  name: "Sarah J.",
                  text: "I was impressed with how easy it was to sell my old iPhone. The price offered was fair, and payment was prompt!",
                  rating: 5
                },
                {
                  name: "Michael T.",
                  text: "Bought a refurbished laptop that looks and works like new. Great value and the 1-year warranty gives me peace of mind.",
                  rating: 5
                },
                {
                  name: "Lisa R.",
                  text: "The environmental impact information really helped me understand how my choice makes a difference. Will definitely use this service again.",
                  rating: 5
                }
              ]).map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex mb-4">
                    {Array(5).fill(0).map((_, i) => (
                      <span key={i} className={i < testimonial.rating ? "text-yellow-500" : "text-gray-300"}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">{testimonial.text}</p>
                  <p className="font-semibold">{testimonial.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Environmental Stats */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Our Environmental Impact</h2>
          <p className="text-center text-primary-100 mb-12">Together we're making a difference</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {loading ? (
              // Loading skeletons for stats
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-12 w-24 mx-auto mb-3 bg-white/20" />
                  <Skeleton className="h-5 w-32 mx-auto bg-white/20" />
                </div>
              ))
            ) : (
              // Actual stats
              (homeData.stats.stats.length > 0 ? homeData.stats.stats : [
                { value: "20,000+", label: "Devices Recycled" },
                { value: "2,500", label: "Tons of E-Waste Saved" },
                { value: "1.2M", label: "kg CO₂ Prevented" },
                { value: "95%", label: "Materials Recovered" }
              ]).map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-4xl font-bold mb-2">{stat.value}</p>
                  <p className="text-lg">{stat.label}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Environmental Message Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Make a Difference Today</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of customers who are buying and selling devices in an environmentally responsible way.
          </p>
          
          <div className="p-6 bg-white rounded-lg shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Recycle className="text-green-600 h-10 w-10 mr-3" />
              <h3 className="text-xl font-semibold">Together We Can Reduce E-Waste</h3>
            </div>
            <p className="text-gray-600">
              Every device you trade in or purchase refurbished helps extend product lifecycles, 
              conserve resources, and reduce the environmental impact of electronic manufacturing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
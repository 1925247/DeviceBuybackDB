import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Watch, Tablet, ArrowRight, Shield, DollarSign, Clock } from 'lucide-react';

const HomePage = () => {
  const deviceTypes = [
    { id: 1, name: 'Smartphones', icon: Smartphone, path: '/sell/smartphone', color: 'bg-blue-500' },
    { id: 2, name: 'Laptops', icon: Laptop, path: '/sell/laptop', color: 'bg-green-500' },
    { id: 3, name: 'Tablets', icon: Tablet, path: '/sell/tablet', color: 'bg-purple-500' },
    { id: 4, name: 'Smartwatches', icon: Watch, path: '/sell/smartwatch', color: 'bg-orange-500' }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Turn Your Old Devices Into
            <span className="text-blue-600 block">Instant Cash</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get the best value for your used electronics. Quick, easy, and hassle-free evaluation process.
          </p>
          <Link
            to="/sell"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Selling Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Device Types Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Device Are You Selling?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deviceTypes.map((device) => {
              const IconComponent = device.icon;
              return (
                <Link
                  key={device.id}
                  to={device.path}
                  className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-8 text-center">
                    <div className={`${device.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{device.name}</h3>
                    <p className="text-gray-600">Get instant quotes for your {device.name.toLowerCase()}</p>
                  </div>
                </Link>
              );
            })}
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
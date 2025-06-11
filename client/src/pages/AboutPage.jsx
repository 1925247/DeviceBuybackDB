import React from 'react';
import { Shield, Award, Users, Recycle, DollarSign, Clock } from 'lucide-react';

const AboutPage = () => {
  const features = [
    {
      icon: DollarSign,
      title: 'Best Prices Guaranteed',
      description: 'We offer competitive prices for your used devices, backed by our price match guarantee.'
    },
    {
      icon: Shield,
      title: 'Secure & Safe Process',
      description: 'Your data and privacy are protected with enterprise-grade security throughout the process.'
    },
    {
      icon: Clock,
      title: 'Quick & Easy',
      description: 'Get an instant quote in minutes and complete your sale with just a few clicks.'
    },
    {
      icon: Recycle,
      title: 'Environmentally Responsible',
      description: 'We ensure your old devices are properly recycled or refurbished to reduce e-waste.'
    },
    {
      icon: Award,
      title: 'Trusted by Thousands',
      description: 'Join over 50,000 satisfied customers who have sold their devices through our platform.'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Our knowledgeable support team is here to help you through every step of the process.'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Devices Purchased' },
    { number: '$2M+', label: 'Paid to Customers' },
    { number: '99%', label: 'Customer Satisfaction' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About Cash Old Device
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing the way people sell their used electronics by providing 
              a simple, secure, and profitable platform for device buyback.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            At Cash Old Device, we believe that technology should work for everyone. Our mission is to 
            create a sustainable marketplace where people can easily turn their unused devices into cash 
            while helping others access quality refurbished electronics at affordable prices. We're 
            committed to reducing electronic waste and promoting a circular economy in the tech industry.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600">
              We've designed our platform with your needs in mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-xl text-blue-100">
              Numbers that show our commitment to our customers
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">
              Selling your device is easier than ever
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Get a Quote',
                description: 'Answer a few questions about your device to get an instant price quote.'
              },
              {
                step: '02',
                title: 'Ship for Free',
                description: 'We provide a free shipping kit with pre-paid labels for your convenience.'
              },
              {
                step: '03',
                title: 'Device Inspection',
                description: 'Our experts carefully inspect your device to confirm its condition.'
              },
              {
                step: '04',
                title: 'Get Paid Fast',
                description: 'Receive payment within 24 hours via your preferred payment method.'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparency</h3>
              <p className="text-gray-600">
                We believe in clear, honest communication. No hidden fees, no surprises - 
                just straightforward pricing and processes.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-600">
                Every device we process helps reduce electronic waste and extends the 
                lifecycle of valuable technology.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer First</h3>
              <p className="text-gray-600">
                Your satisfaction is our priority. We're committed to providing exceptional 
                service at every step of your journey.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously improve our platform and processes to make selling 
                your devices faster, easier, and more profitable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers and turn your old device into cash today.
          </p>
          <a
            href="/sell"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            Get Your Quote Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PartnerWithUs: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your form submission logic here, e.g., sending the data to an API
    console.log('Partner With Us form submitted:', formData);
    // Reset form after submission
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Partner With Us</h1>
          <p className="text-xl mb-8">
            Join our network of trusted partners and help us deliver exceptional service to our customers.
          </p>
          <Link
            to="/contact"
            className="bg-white text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300"
          >
            Get In Touch
          </Link>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Partner With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-2">Growth Opportunities</h3>
              <p className="text-gray-600">
                Expand your business reach and explore new markets with our partnership program.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-2">Shared Success</h3>
              <p className="text-gray-600">
                Benefit from mutual growth and shared resources that drive success for all partners.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-2">Dedicated Support</h3>
              <p className="text-gray-600">
                Receive expert guidance and personalized support from our dedicated partner team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner With Us Form */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Partner With Us Form</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="companyName">
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="contactName">
                Contact Name
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                required
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your interest in partnering with us"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-green-500"
              ></textarea>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-300"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PartnerWithUs;

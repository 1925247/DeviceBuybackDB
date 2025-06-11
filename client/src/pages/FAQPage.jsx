import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'selling', name: 'Selling Process' },
    { id: 'pricing', name: 'Pricing & Valuation' },
    { id: 'shipping', name: 'Shipping & Packaging' },
    { id: 'payment', name: 'Payment & Payout' },
    { id: 'account', name: 'Account & Security' },
    { id: 'technical', name: 'Technical Issues' }
  ];

  const faqData = [
    {
      id: 1,
      category: 'selling',
      question: 'How do I sell my device?',
      answer: 'Selling your device is easy! First, select your device type and model from our homepage. Then answer a few questions about its condition to get an instant quote. If you\'re happy with the price, complete the checkout process and we\'ll send you a free shipping kit. Once we receive and inspect your device, you\'ll get paid within 24 hours.'
    },
    {
      id: 2,
      category: 'pricing',
      question: 'How do you determine the price of my device?',
      answer: 'Our pricing algorithm considers multiple factors including the device model, age, condition, current market demand, and resale value. We regularly update our prices to ensure you get the best possible offer for your device.'
    },
    {
      id: 3,
      category: 'shipping',
      question: 'Is shipping really free?',
      answer: 'Yes! We provide completely free shipping for all devices. We\'ll send you a prepaid shipping label and packaging materials at no cost to you. You just need to pack your device securely and drop it off at any UPS location.'
    },
    {
      id: 4,
      category: 'payment',
      question: 'When and how do I get paid?',
      answer: 'You\'ll receive payment within 24 hours of our inspection completing. We offer payment via PayPal, direct bank transfer, or check. PayPal and bank transfers are typically processed the same day, while checks are mailed within 1-2 business days.'
    },
    {
      id: 5,
      category: 'selling',
      question: 'What condition does my device need to be in?',
      answer: 'We accept devices in various conditions from excellent to poor. The condition affects the final price, but even devices with cracked screens or other damage can have value. Be honest about the condition during the assessment for the most accurate quote.'
    },
    {
      id: 6,
      category: 'account',
      question: 'How do you protect my personal data?',
      answer: 'We take data security seriously. We recommend performing a factory reset before shipping your device. Our facility uses enterprise-grade security measures, and all devices undergo secure data wiping procedures to ensure your personal information is completely removed.'
    },
    {
      id: 7,
      category: 'pricing',
      question: 'Can the final offer be different from the quote?',
      answer: 'The final offer may differ if the actual condition of your device doesn\'t match what was described in the assessment. If there\'s a significant difference, we\'ll contact you before proceeding. You always have the option to decline the revised offer and have your device returned free of charge.'
    },
    {
      id: 8,
      category: 'shipping',
      question: 'How should I package my device?',
      answer: 'We\'ll provide detailed packing instructions with your shipping kit. Generally, remove any cases or accessories, ensure the device is clean and dry, wrap it in the provided bubble wrap, and place it in the shipping box. Don\'t forget to include all original accessories if you have them.'
    },
    {
      id: 9,
      category: 'payment',
      question: 'What payment methods do you offer?',
      answer: 'We offer three convenient payment options: PayPal (instant), direct bank transfer (1-2 business days), and paper check (5-7 business days). You can choose your preferred method during the checkout process.'
    },
    {
      id: 10,
      category: 'selling',
      question: 'What if I change my mind after shipping?',
      answer: 'You can request to have your device returned at any point before we complete the inspection. If you change your mind after we\'ve made our final offer, we\'ll return your device free of charge within 5 business days.'
    },
    {
      id: 11,
      category: 'technical',
      question: 'My device won\'t turn on. Can I still sell it?',
      answer: 'Yes, we often purchase devices that don\'t power on. These devices may still have value for parts or repair. When filling out the condition assessment, select the appropriate options to indicate power issues for the most accurate quote.'
    },
    {
      id: 12,
      category: 'account',
      question: 'Do I need to create an account?',
      answer: 'No account is required for one-time sales. However, creating an account allows you to track your shipments, view payment history, and get faster quotes for future sales. You can create an account during checkout or after completing your first sale.'
    }
  ];

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions about selling your devices
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Filter */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map(faq => (
                  <div key={faq.id} className="bg-white rounded-lg shadow-sm">
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                      {expandedItems[faq.id] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    {expandedItems[faq.id] && (
                      <div className="px-6 pb-4">
                        <div className="border-t pt-4">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4">
                  No FAQs match your search criteria. Try different keywords or browse all categories.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@casholddevice.com"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Email Us Directly
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
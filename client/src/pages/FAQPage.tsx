import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What is Cash Old Device?',
      answer: 'Cash Old Device is a platform that allows users to sell their used smartphones, laptops, tablets, and smartwatches seamlessly. We offer competitive buyback prices and ensure a hassle-free process.',
    },
    {
      question: 'How does the buyback process work?',
      answer: 'Simply provide details about your device, receive an instant quote, schedule a pickup, and get paid upon device inspection.',
    },
    {
      question: 'How is the price of my device determined?',
      answer: 'The price is determined based on the device model, its age, physical condition, and functional status. We use market data and our proprietary algorithm to offer you the best possible price.',
    },
    {
      question: 'Is pickup available in my area?',
      answer: 'We offer pickup services in most major cities and surrounding areas. During checkout, you can check if your location is serviceable.',
    },
    {
      question: 'How long does the pickup process take?',
      answer: 'The pickup process typically takes 10-15 minutes. Our executive will verify the device condition and process the payment on the spot.',
    },
    {
      question: 'What payment methods do you offer?',
      answer: 'We offer multiple payment methods including bank transfers, UPI, and digital wallets. You can choose your preferred method during checkout.',
    },
    {
      question: 'How do you ensure data privacy?',
      answer: 'We perform complete data erasure on all devices using industry-standard methods. Your personal information is never accessed or stored.',
    },
    {
      question: 'What if I\'m not satisfied with the final offer?',
      answer: 'You\'re under no obligation to sell your device. If you\'re not satisfied with the final offer after physical inspection, you can decline and keep your device.',
    },
    {
      question: 'Can I sell multiple devices at once?',
      answer: 'Yes, you can sell multiple devices in a single order. Simply complete the process for each device and they will be picked up together.',
    },
    {
      question: 'What happens to my device after I sell it?',
      answer: 'Depending on the condition, your device is either refurbished and resold, or recycled responsibly if it cannot be repaired.',
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Find answers to common questions about selling your devices with Cash Old Device
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        {faqs.map((faq, index) => (
          <div key={index} className="mb-4 border-b border-gray-200 last:border-0 last:mb-0">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center py-4 text-left focus:outline-none"
            >
              <span className="text-lg font-medium">{faq.question}</span>
              {activeIndex === index ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {activeIndex === index && (
              <div className="py-3 text-gray-600 mb-4">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto mt-12 bg-blue-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Still have questions?</h2>
        <p className="text-blue-700 mb-4">
          If you couldn't find the answer to your question, please feel free to contact our customer support team.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/contact" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300">
            Contact Us
          </Link>
          <a href="tel:+15551234567" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition duration-300">
            Call Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
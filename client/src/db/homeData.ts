import React from 'react';
import { Smartphone, Laptop, Tablet, Watch } from 'lucide-react';

// Header title and description as React elements using React.createElement
export const headerTitle = React.createElement(
  'h1',
  { className: 'text-4xl md:text-5xl font-bold mb-4' },
  'Sell Your Old Devices for the Best Price'
);

export const headerDescription = React.createElement(
  'p',
  { className: 'text-xl mb-8' },
  'Get instant valuation, free doorstep pickup, and quick payment for your used smartphones, laptops, tablets, and smartwatches.'
);

// Icon mapping using React.createElement so we don't use JSX syntax
export const iconMapping: Record<string, JSX.Element> = {
  Smartphone: React.createElement(Smartphone, { className: 'h-8 w-8 text-blue-600' }),
  Laptop: React.createElement(Laptop, { className: 'h-8 w-8 text-green-600' }),
  Tablet: React.createElement(Tablet, { className: 'h-8 w-8 text-purple-600' }),
  Watch: React.createElement(Watch, { className: 'h-8 w-8 text-orange-600' }),
};

export const deviceCategories = [
  {
    name: 'Smartphones',
    description: 'Sell your used iPhone, Samsung, OnePlus, and other smartphones.',
    route: '/sell/smartphone',
    icon: 'Smartphone',
    color: 'blue',
    tagline: 'Best cash offer for your phone!',
    backgroundImage: 'https://example.com/images/smartphones-bg.jpg',
  },
  {
    name: 'Laptops',
    description: 'Get cash for your MacBook, Dell, HP, Lenovo, and more.',
    route: '/sell/laptop',
    icon: 'Laptop',
    color: 'green',
    tagline: 'Upgrade your tech with extra cash!',
    backgroundImage: 'https://example.com/images/laptops-bg.jpg',
  },
  {
    name: 'Tablets',
    description: 'Sell your iPad, Samsung Tab, and other tablets easily.',
    route: '/sell/tablet',
    icon: 'Tablet',
    color: 'purple',
    tagline: 'Turn your tablet into cash!',
    backgroundImage: 'https://example.com/images/tablets-bg.jpg',
  },
  {
    name: 'Smartwatches',
    description: 'Trade in your Apple Watch, Galaxy Watch, and more.',
    route: '/sell/smartwatch',
    icon: 'Watch',
    color: 'orange',
    tagline: 'Get the best offer for your wearable!',
    backgroundImage: 'https://example.com/images/smartwatches-bg.jpg',
  },
];

export const testimonials = [
  {
    name: 'Sarah Johnson',
    text: 'I was skeptical at first, but the process was incredibly smooth. I got a great price for my old iPhone, and the payment was instant!',
    rating: 5,
    image: 'https://example.com/images/testimonial-sarah.jpg',
  },
  {
    name: 'Michael Chen',
    text: 'The doorstep pickup was super convenient. The executive was professional and the entire process took less than 10 minutes.',
    rating: 5,
    image: 'https://example.com/images/testimonial-michael.jpg',
  },
  {
    name: 'Priya Sharma',
    text: 'I compared prices with other buyback services and Cash Old Device offered the best value. The process was transparent and hassle-free.',
    rating: 5,
    image: 'https://example.com/images/testimonial-priya.jpg',
  },
];

export const environmentalImpact = {
  devicesRecycled: '100,000+',
  eWasteReduced: '500+ tons',
  certification: 'ISO 14001 certified recycling process',
  impactDescription:
    'By choosing to sell your device, you contribute to reducing e-waste and promoting a circular economy. Our certified recycling process ensures maximum environmental benefit.',
};

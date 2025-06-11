import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Document metadata
document.title = "GadgetSwap - Device Buyback & Refurbished Marketplace";

// Meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'GadgetSwap - A complete device buyback and refurbished gadget marketplace. Sell your used devices or purchase quality refurbished electronics.';
document.head.appendChild(metaDescription);

// Open Graph tags for better social media sharing
const ogTitle = document.createElement('meta');
ogTitle.setAttribute('property', 'og:title');
ogTitle.content = 'GadgetSwap - Device Buyback & Refurbished Marketplace';
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.setAttribute('property', 'og:description');
ogDescription.content = 'Buy and sell refurbished electronics. Our marketplace connects sellers with buyers looking for quality used devices at great prices.';
document.head.appendChild(ogDescription);

const ogType = document.createElement('meta');
ogType.setAttribute('property', 'og:type');
ogType.content = 'website';
document.head.appendChild(ogType);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
import { useEffect } from 'react';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  ogTitle, 
  ogDescription, 
  ogImage,
  canonical,
  structuredData 
}) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta description
    if (description) {
      updateMetaTag('description', description);
    }

    // Update keywords
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Update Open Graph tags
    if (ogTitle) {
      updateMetaProperty('og:title', ogTitle);
    }
    if (ogDescription) {
      updateMetaProperty('og:description', ogDescription);
    }
    if (ogImage) {
      updateMetaProperty('og:image', ogImage);
    }

    // Update canonical URL
    if (canonical) {
      updateCanonicalURL(canonical);
    }

    // Update structured data
    if (structuredData) {
      updateStructuredData(structuredData);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical, structuredData]);

  const updateMetaTag = (name, content) => {
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', name);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
  };

  const updateMetaProperty = (property, content) => {
    let metaTag = document.querySelector(`meta[property="${property}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', property);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
  };

  const updateCanonicalURL = (url) => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  };

  const updateStructuredData = (data) => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  };

  return null; // This component doesn't render anything
};

export default SEOHead;
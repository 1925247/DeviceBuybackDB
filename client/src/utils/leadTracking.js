/**
 * Lead tracking utilities for capturing marketing attribution data
 */

// Extract UTM parameters from URL
export const extractUTMParameters = (url = window.location.href) => {
  const urlParams = new URLSearchParams(new URL(url).search);
  
  return {
    utm_source: urlParams.get('utm_source') || null,
    utm_medium: urlParams.get('utm_medium') || null,
    utm_campaign: urlParams.get('utm_campaign') || null,
    utm_term: urlParams.get('utm_term') || null,
    utm_content: urlParams.get('utm_content') || null
  };
};

// Determine lead source based on referrer and UTM parameters
export const determineLeadSource = () => {
  const utmParams = extractUTMParameters();
  const referrer = document.referrer;
  const currentUrl = window.location.href;
  
  if (utmParams.utm_source) {
    return {
      lead_source: utmParams.utm_source,
      lead_medium: utmParams.utm_medium || 'unknown',
      lead_campaign: utmParams.utm_campaign || null,
      ...utmParams,
      referrer_url: referrer || null,
      landing_page: currentUrl
    };
  }
  
  if (!referrer) {
    return {
      lead_source: 'direct',
      lead_medium: 'none',
      lead_campaign: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      referrer_url: null,
      landing_page: currentUrl
    };
  }
  
  const referrerDomain = new URL(referrer).hostname.toLowerCase();
  
  if (referrerDomain.includes('google.')) {
    if (referrer.includes('googleadservices') || referrer.includes('gclid=')) {
      return {
        lead_source: 'google',
        lead_medium: 'cpc',
        lead_campaign: 'google_ads',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'google_ads',
        utm_term: null,
        utm_content: null,
        referrer_url: referrer,
        landing_page: currentUrl
      };
    }
    
    return {
      lead_source: 'google',
      lead_medium: 'organic',
      lead_campaign: null,
      utm_source: 'google',
      utm_medium: 'organic',
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      referrer_url: referrer,
      landing_page: currentUrl
    };
  }
  
  return {
    lead_source: referrerDomain,
    lead_medium: 'referral',
    lead_campaign: null,
    utm_source: referrerDomain,
    utm_medium: 'referral',
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    referrer_url: referrer,
    landing_page: currentUrl
  };
};

export const storeLeadData = () => {
  const leadData = determineLeadSource();
  sessionStorage.setItem('leadTrackingData', JSON.stringify(leadData));
  return leadData;
};

export const getStoredLeadData = () => {
  try {
    const stored = sessionStorage.getItem('leadTrackingData');
    return stored ? JSON.parse(stored) : determineLeadSource();
  } catch (error) {
    console.error('Error retrieving lead data:', error);
    return determineLeadSource();
  }
};

export const initializeLeadTracking = () => {
  if (!sessionStorage.getItem('leadTrackingData')) {
    storeLeadData();
  }
};

export const getEnhancedLeadData = async () => {
  const basicLeadData = getStoredLeadData();
  
  const enhancedData = {
    ...basicLeadData,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_mobile: /Mobi|Android/i.test(navigator.userAgent),
    indian_time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    currency: 'INR'
  };
  
  return enhancedData;
};
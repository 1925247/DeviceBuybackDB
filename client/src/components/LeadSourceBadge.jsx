import React from 'react';
import { Globe, Search, Share2, Mail, Target, ExternalLink } from 'lucide-react';

const LeadSourceBadge = ({ source, medium, campaign, className = "" }) => {
  const getSourceIcon = (source) => {
    const iconMap = {
      'google': Search,
      'facebook': Share2,
      'instagram': Share2,
      'twitter': Share2,
      'linkedin': Share2,
      'email': Mail,
      'direct': Globe,
      'organic': Search,
      'referral': ExternalLink
    };
    return iconMap[source] || Target;
  };

  const getSourceColor = (source, medium) => {
    // Paid traffic
    if (medium === 'cpc' || medium === 'paid') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    
    // Organic traffic
    if (medium === 'organic') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    
    // Social traffic
    if (medium === 'social') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    
    // Email traffic
    if (medium === 'email') {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    
    // Direct traffic
    if (source === 'direct' || medium === 'none') {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    
    // Referral traffic
    if (medium === 'referral') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    
    // Default
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDisplay = (source, medium, campaign) => {
    if (campaign && campaign !== 'none') {
      return campaign;
    }
    
    if (source && medium && source !== medium) {
      return `${source}/${medium}`;
    }
    
    return source || medium || 'unknown';
  };

  const IconComponent = getSourceIcon(source);
  const colorClass = getSourceColor(source, medium);
  const displayText = formatDisplay(source, medium, campaign);

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${colorClass} ${className}`}>
      <IconComponent className="h-3 w-3 mr-1" />
      {displayText}
    </span>
  );
};

export default LeadSourceBadge;
import React from 'react';
import { 
  Smartphone, Laptop, Tablet, Watch, Headphones, Camera, 
  Monitor, Speaker, Mouse, Keyboard, Gamepad2 
} from 'lucide-react';

const DeviceIcon = ({ deviceType, size = 'md', className = '' }) => {
  const lucideIcons = {
    smartphone: Smartphone,
    laptop: Laptop,
    tablet: Tablet,
    watch: Watch,
    headphones: Headphones,
    camera: Camera,
    monitor: Monitor,
    speaker: Speaker,
    mouse: Mouse,
    keyboard: Keyboard,
    gamepad: Gamepad2
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const {
    icon = 'smartphone',
    iconType = 'lucide',
    customIcon = '',
    iconColor = '#FFFFFF',
    backgroundColor = '#3B82F6'
  } = deviceType;

  const containerSize = sizeClasses[size];
  const iconSize = iconSizes[size];

  if (iconType === 'emoji' && customIcon) {
    return (
      <div 
        className={`${containerSize} rounded-full flex items-center justify-center ${className}`}
        style={{ backgroundColor }}
      >
        <span className={`${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-3xl' : 'text-4xl'}`}>
          {customIcon}
        </span>
      </div>
    );
  }

  if (iconType === 'custom' && customIcon) {
    return (
      <div 
        className={`${containerSize} rounded-full flex items-center justify-center ${className}`}
        style={{ backgroundColor }}
        dangerouslySetInnerHTML={{ __html: customIcon }}
      />
    );
  }

  const IconComponent = lucideIcons[icon] || Smartphone;
  
  return (
    <div 
      className={`${containerSize} rounded-full flex items-center justify-center ${className}`}
      style={{ backgroundColor }}
    >
      <IconComponent className={iconSize} style={{ color: iconColor }} />
    </div>
  );
};

export default DeviceIcon;
// Mock data for buy section of the marketplace
// This will be replaced with database data in production

export const categories = [
  { id: 1, name: 'Smartphones', slug: 'smartphones', iconName: 'smartphone' },
  { id: 2, name: 'Tablets', slug: 'tablets', iconName: 'tablet' },
  { id: 3, name: 'Laptops', slug: 'laptops', iconName: 'laptop' },
  { id: 4, name: 'Smartwatches', slug: 'smartwatches', iconName: 'watch' },
  { id: 5, name: 'Headphones', slug: 'headphones', iconName: 'headphones' },
  { id: 6, name: 'Gaming', slug: 'gaming', iconName: 'gamepad' }
];

export const brands = [
  { id: 1, name: 'Apple', slug: 'apple', logoUrl: '/assets/brands/apple.png' },
  { id: 2, name: 'Samsung', slug: 'samsung', logoUrl: '/assets/brands/samsung.png' },
  { id: 3, name: 'Google', slug: 'google', logoUrl: '/assets/brands/google.png' },
  { id: 4, name: 'OnePlus', slug: 'oneplus', logoUrl: '/assets/brands/oneplus.png' },
  { id: 5, name: 'Dell', slug: 'dell', logoUrl: '/assets/brands/dell.png' },
  { id: 6, name: 'HP', slug: 'hp', logoUrl: '/assets/brands/hp.png' },
  { id: 7, name: 'Sony', slug: 'sony', logoUrl: '/assets/brands/sony.png' }
];

export const products = [
  {
    id: 1,
    name: 'iPhone 14 Pro Max',
    slug: 'iphone-14-pro-max',
    condition: 'Excellent',
    categoryId: 1,
    brandId: 1,
    price: 899,
    originalPrice: 1199,
    discountPercentage: 25,
    storage: '256GB',
    color: 'Space Black',
    rating: 4.8,
    reviewCount: 127,
    imageUrl: '/assets/products/iphone-14-pro-max.jpg',
    images: [
      '/assets/products/iphone-14-pro-max-1.jpg',
      '/assets/products/iphone-14-pro-max-2.jpg',
      '/assets/products/iphone-14-pro-max-3.jpg'
    ],
    description: 'Refurbished iPhone 14 Pro Max in excellent condition. Includes 90-day warranty, original accessories, and free shipping.',
    specifications: [
      { name: 'Display', value: '6.7" Super Retina XDR' },
      { name: 'Processor', value: 'A16 Bionic' },
      { name: 'Camera', value: 'Triple 48MP system' },
      { name: 'Battery', value: 'Up to 29 hours video playback' },
      { name: 'Connectivity', value: '5G, Wi-Fi 6, Bluetooth 5.3' }
    ],
    features: [
      'Dynamic Island',
      'Always-On display',
      'ProMotion technology',
      'Ceramic Shield front',
      'Face ID'
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: 2,
    name: 'Samsung Galaxy S23 Ultra',
    slug: 'samsung-galaxy-s23-ultra',
    condition: 'Good',
    categoryId: 1,
    brandId: 2,
    price: 799,
    originalPrice: 1199,
    discountPercentage: 33,
    storage: '256GB',
    color: 'Phantom Black',
    rating: 4.6,
    reviewCount: 89,
    imageUrl: '/assets/products/galaxy-s23-ultra.jpg',
    images: [
      '/assets/products/galaxy-s23-ultra-1.jpg',
      '/assets/products/galaxy-s23-ultra-2.jpg',
      '/assets/products/galaxy-s23-ultra-3.jpg'
    ],
    description: 'Refurbished Samsung Galaxy S23 Ultra in good condition. Minor signs of use. Includes 90-day warranty and free shipping.',
    specifications: [
      { name: 'Display', value: '6.8" Dynamic AMOLED 2X' },
      { name: 'Processor', value: 'Snapdragon 8 Gen 2' },
      { name: 'Camera', value: 'Quad camera system with 200MP main' },
      { name: 'Battery', value: '5,000mAh' },
      { name: 'Connectivity', value: '5G, Wi-Fi 6E, Bluetooth 5.3' }
    ],
    features: [
      'S Pen included',
      'Corning Gorilla Glass Victus 2',
      'IP68 water resistance',
      'Ultra-wide camera',
      'Space Zoom'
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: 3,
    name: 'MacBook Pro 14"',
    slug: 'macbook-pro-14',
    condition: 'Excellent',
    categoryId: 3,
    brandId: 1,
    price: 1399,
    originalPrice: 1999,
    discountPercentage: 30,
    storage: '512GB',
    color: 'Space Gray',
    rating: 4.9,
    reviewCount: 152,
    imageUrl: '/assets/products/macbook-pro-14.jpg',
    images: [
      '/assets/products/macbook-pro-14-1.jpg',
      '/assets/products/macbook-pro-14-2.jpg',
      '/assets/products/macbook-pro-14-3.jpg'
    ],
    description: 'Refurbished MacBook Pro 14-inch with M2 Pro chip in excellent condition. Includes 1-year warranty, original charger, and free shipping.',
    specifications: [
      { name: 'Display', value: '14.2" Liquid Retina XDR' },
      { name: 'Processor', value: 'M2 Pro' },
      { name: 'Memory', value: '16GB unified memory' },
      { name: 'Storage', value: '512GB SSD' },
      { name: 'Battery', value: 'Up to 18 hours' }
    ],
    features: [
      'ProMotion technology',
      'MagSafe charging',
      'HDMI port',
      'SDXC card slot',
      'Three Thunderbolt 4 ports'
    ],
    inStock: true,
    isFeatured: true
  },
  {
    id: 4,
    name: 'iPad Pro 12.9"',
    slug: 'ipad-pro-12-9',
    condition: 'Good',
    categoryId: 2,
    brandId: 1,
    price: 899,
    originalPrice: 1299,
    discountPercentage: 31,
    storage: '256GB',
    color: 'Silver',
    rating: 4.7,
    reviewCount: 76,
    imageUrl: '/assets/products/ipad-pro-12-9.jpg',
    images: [
      '/assets/products/ipad-pro-12-9-1.jpg',
      '/assets/products/ipad-pro-12-9-2.jpg',
      '/assets/products/ipad-pro-12-9-3.jpg'
    ],
    description: 'Refurbished iPad Pro 12.9-inch in good condition. Minor signs of use. Includes 90-day warranty and free shipping.',
    specifications: [
      { name: 'Display', value: '12.9" Liquid Retina XDR' },
      { name: 'Processor', value: 'M2 chip' },
      { name: 'Memory', value: '8GB RAM' },
      { name: 'Storage', value: '256GB' },
      { name: 'Connectivity', value: 'Wi-Fi 6E, Bluetooth 5.3' }
    ],
    features: [
      'ProMotion technology',
      'TrueDepth camera system',
      'Face ID',
      'Thunderbolt port',
      'Compatible with Apple Pencil and Magic Keyboard'
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: 5,
    name: 'Google Pixel 7 Pro',
    slug: 'google-pixel-7-pro',
    condition: 'Excellent',
    categoryId: 1,
    brandId: 3,
    price: 649,
    originalPrice: 899,
    discountPercentage: 28,
    storage: '128GB',
    color: 'Hazel',
    rating: 4.5,
    reviewCount: 64,
    imageUrl: '/assets/products/pixel-7-pro.jpg',
    images: [
      '/assets/products/pixel-7-pro-1.jpg',
      '/assets/products/pixel-7-pro-2.jpg',
      '/assets/products/pixel-7-pro-3.jpg'
    ],
    description: 'Refurbished Google Pixel 7 Pro in excellent condition. Includes 90-day warranty, original accessories, and free shipping.',
    specifications: [
      { name: 'Display', value: '6.7" QHD+ LTPO OLED' },
      { name: 'Processor', value: 'Google Tensor G2' },
      { name: 'Camera', value: 'Triple camera with 50MP main' },
      { name: 'Battery', value: '5,000mAh' },
      { name: 'Connectivity', value: '5G, Wi-Fi 6E, Bluetooth 5.2' }
    ],
    features: [
      'Google AI features',
      'IP68 water resistance',
      'Corning Gorilla Glass Victus',
      'Wireless charging',
      'Face Unlock'
    ],
    inStock: true,
    isFeatured: false
  },
  {
    id: 6,
    name: 'Dell XPS 15',
    slug: 'dell-xps-15',
    condition: 'Fair',
    categoryId: 3,
    brandId: 5,
    price: 999,
    originalPrice: 1699,
    discountPercentage: 41,
    storage: '1TB',
    color: 'Platinum Silver',
    rating: 4.3,
    reviewCount: 48,
    imageUrl: '/assets/products/dell-xps-15.jpg',
    images: [
      '/assets/products/dell-xps-15-1.jpg',
      '/assets/products/dell-xps-15-2.jpg',
      '/assets/products/dell-xps-15-3.jpg'
    ],
    description: 'Refurbished Dell XPS 15 in fair condition. Visible signs of use. Includes 60-day warranty and free shipping.',
    specifications: [
      { name: 'Display', value: '15.6" 4K UHD+' },
      { name: 'Processor', value: 'Intel Core i7-12700H' },
      { name: 'Memory', value: '16GB DDR5' },
      { name: 'Storage', value: '1TB SSD' },
      { name: 'Graphics', value: 'NVIDIA GeForce RTX 3050 Ti' }
    ],
    features: [
      'InfinityEdge display',
      'Fingerprint reader',
      'Backlit keyboard',
      'Thunderbolt 4 ports',
      'Windows 11 Pro'
    ],
    inStock: true,
    isFeatured: false
  }
];
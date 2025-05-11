// Mock device models for UI development and testing
// These will be replaced with database data in production

export const deviceModels = [
  {
    id: 1,
    name: 'iPhone 14 Pro',
    slug: 'iphone-14-pro',
    brandId: 1,
    deviceTypeId: 1,
    releaseYear: 2022,
    description: 'Latest flagship iPhone with dynamic island',
    image: '/assets/models/iphone-14-pro.png',
    brand: { id: 1, name: 'Apple', slug: 'apple' },
    deviceType: { id: 1, name: 'Smartphone', slug: 'smartphones' },
    active: true,
    variants: ['128GB', '256GB', '512GB', '1TB']
  },
  {
    id: 2,
    name: 'iPhone 13',
    slug: 'iphone-13',
    brandId: 1,
    deviceTypeId: 1,
    releaseYear: 2021,
    description: 'Previous generation iPhone',
    image: '/assets/models/iphone-13.png',
    brand: { id: 1, name: 'Apple', slug: 'apple' },
    deviceType: { id: 1, name: 'Smartphone', slug: 'smartphones' },
    active: true,
    variants: ['128GB', '256GB', '512GB']
  },
  {
    id: 3,
    name: 'Galaxy S23 Ultra',
    slug: 'galaxy-s23-ultra',
    brandId: 2,
    deviceTypeId: 1,
    releaseYear: 2023,
    description: 'Samsung flagship with S-Pen',
    image: '/assets/models/galaxy-s23-ultra.png',
    brand: { id: 2, name: 'Samsung', slug: 'samsung' },
    deviceType: { id: 1, name: 'Smartphone', slug: 'smartphones' },
    active: true,
    variants: ['256GB', '512GB', '1TB']
  },
  {
    id: 4,
    name: 'iPad Pro 12.9"',
    slug: 'ipad-pro-12-9',
    brandId: 1,
    deviceTypeId: 2,
    releaseYear: 2022,
    description: 'Apple tablet with M2 chip',
    image: '/assets/models/ipad-pro-12-9.png',
    brand: { id: 1, name: 'Apple', slug: 'apple' },
    deviceType: { id: 2, name: 'Tablet', slug: 'tablets' },
    active: true,
    variants: ['128GB', '256GB', '512GB', '1TB', '2TB']
  },
  {
    id: 5,
    name: 'MacBook Pro 16"',
    slug: 'macbook-pro-16',
    brandId: 1,
    deviceTypeId: 3,
    releaseYear: 2023,
    description: 'Apple laptop with M2 Pro/Max chip',
    image: '/assets/models/macbook-pro-16.png',
    brand: { id: 1, name: 'Apple', slug: 'apple' },
    deviceType: { id: 3, name: 'Laptop', slug: 'laptops' },
    active: true,
    variants: ['512GB', '1TB', '2TB', '4TB', '8TB']
  },
  {
    id: 6,
    name: 'Pixel 7 Pro',
    slug: 'pixel-7-pro',
    brandId: 3,
    deviceTypeId: 1,
    releaseYear: 2022,
    description: 'Google flagship with Tensor G2',
    image: '/assets/models/pixel-7-pro.png',
    brand: { id: 3, name: 'Google', slug: 'google' },
    deviceType: { id: 1, name: 'Smartphone', slug: 'smartphones' },
    active: true,
    variants: ['128GB', '256GB', '512GB']
  }
];
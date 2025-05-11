// Mock brands for UI development and testing
// These will be replaced with database data in production

export const brands = [
  {
    id: 1,
    name: 'Apple',
    slug: 'apple',
    logo: 'apple-logo.png',
    description: 'American technology company',
    active: true,
    deviceTypes: [1, 2, 3, 4] // References device type IDs
  },
  {
    id: 2,
    name: 'Samsung',
    slug: 'samsung',
    logo: 'samsung-logo.png',
    description: 'South Korean technology company',
    active: true,
    deviceTypes: [1, 2, 3, 4]
  },
  {
    id: 3,
    name: 'Google',
    slug: 'google',
    logo: 'google-logo.png',
    description: 'American technology company',
    active: true,
    deviceTypes: [1, 2]
  },
  {
    id: 4,
    name: 'OnePlus',
    slug: 'oneplus',
    logo: 'oneplus-logo.png',
    description: 'Chinese technology company',
    active: true,
    deviceTypes: [1]
  },
  {
    id: 5,
    name: 'Dell',
    slug: 'dell',
    logo: 'dell-logo.png',
    description: 'American computer technology company',
    active: true,
    deviceTypes: [3]
  }
];
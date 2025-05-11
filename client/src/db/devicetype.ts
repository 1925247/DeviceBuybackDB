export interface DeviceType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const deviceTypes: DeviceType[] = [
  {
    id: '1',
    name: 'Smartphone',
    slug: 'smartphone',
    icon: 'smartphone',
    active: true,
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-04-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'Laptop',
    slug: 'laptop',
    icon: 'laptop',
    active: true,
    createdAt: '2023-01-15T11:00:00Z',
    updatedAt: '2023-04-20T14:45:00Z',
  },
  {
    id: '3',
    name: 'Tablet',
    slug: 'tablet',
    icon: 'tablet',
    active: true,
    createdAt: '2023-01-15T11:30:00Z',
    updatedAt: '2023-04-20T14:45:00Z',
  },
  {
    id: '4',
    name: 'Smartwatch',
    slug: 'smartwatch',
    icon: 'watch',
    active: true,
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-04-20T14:45:00Z',
  },
  {
    id: '5',
    name: 'Headphones',
    slug: 'headphones',
    icon: 'headphones',
    active: false,
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2023-04-20T14:45:00Z',
  },
];

export const deviceTypeOptions = [
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'smartwatch', label: 'Smartwatch' },
  { value: 'headphones', label: 'Headphones' },
];

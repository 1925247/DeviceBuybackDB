// /home/project/db/currencies.ts

// Define the possible currency codes as a union type.
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'INR';

// Define the database type for a currency.
export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
}

// Export an array of currency objects using the defined type.
export const currencyOptions: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
];

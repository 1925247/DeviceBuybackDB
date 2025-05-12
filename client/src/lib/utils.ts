import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as a currency string
 * @param value The amount to format
 * @param currency The currency code (default: USD)
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Generates a slug from a string
 * @param text The text to slugify
 * @returns Slugified string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Truncates a string to a specified length
 * @param text The text to truncate
 * @param length Maximum length before truncation (default: 100)
 * @returns Truncated string with ellipsis if needed
 */
export function truncateText(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Formats a date to a readable string
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions (default: medium date format)
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { 
    dateStyle: 'medium' 
  },
  locale: string = 'en-US'
): string {
  const dateObject = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat(locale, options).format(dateObject);
}

/**
 * Generates a random SKU code
 * @param prefix Optional prefix for the SKU
 * @returns Random SKU string
 */
export function generateSKU(prefix: string = ''): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sku = prefix ? `${prefix}-` : '';
  
  for (let i = 0; i < 8; i++) {
    sku += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return sku;
}

/**
 * Calculates discount price
 * @param originalPrice Original price
 * @param discountPercent Discount percentage (0-100)
 * @returns Discounted price
 */
export function calculateDiscountPrice(originalPrice: number, discountPercent: number): number {
  return originalPrice - (originalPrice * (discountPercent / 100));
}

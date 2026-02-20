import { IP_ADDRESS, PORT } from '@env';

/**
 * Builds the API base URL, handling both local dev and Vercel production.
 * - Local: http://10.2.199.6:3000
 * - Vercel: https://your-app.vercel.app (no port)
 * IP_ADDRESS can be: hostname (nomi-cyan.vercel.app) or full URL (https://nomi-cyan.vercel.app/)
 */
export const getApiBaseUrl = (): string => {
  let address = (IP_ADDRESS ?? '').trim();
  const port = PORT?.toString().trim() || '';
  
  // If they passed a full URL (starts with http), normalize and return (no double https)
  if (address.startsWith('https://') || address.startsWith('http://')) {
    address = address.replace(/\/+$/, ''); // strip trailing slashes
    return address;
  }
  
  // If it's a Vercel hostname or port is 443, use HTTPS and omit port
  const isVercel = address.includes('.vercel.app') || port === '443';
  
  if (isVercel) {
    return `https://${address}`;
  }
  
  // For local dev, use HTTP with port
  return `http://${address}:${port}`;
};

export const API_BASE_URL = getApiBaseUrl();

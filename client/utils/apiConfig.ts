import { IP_ADDRESS, PORT } from '@env';

/**
 * Builds the API base URL.
 * - EAS/TestFlight: use EXPO_PUBLIC_API_URL (set in EAS dashboard for production builds).
 * - Local: use .env IP_ADDRESS and PORT (or EXPO_PUBLIC_API_URL if set).
 */
export const getApiBaseUrl = (): string => {
  // EAS builds: .env is not in the repo, so use EXPO_PUBLIC_* set in EAS Environment Variables
  const explicit = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || '';
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }

  let address = (IP_ADDRESS ?? '').trim();
  const port = PORT?.toString().trim() || '';
  if (!address) return '';

  // Full URL (starts with http)
  if (address.startsWith('https://') || address.startsWith('http://')) {
    return address.replace(/\/+$/, '');
  }
  // Vercel hostname or port 443
  if (address.includes('.vercel.app') || port === '443') {
    return `https://${address}`;
  }
  // Local dev
  return `http://${address}:${port}`;
};

export const API_BASE_URL = getApiBaseUrl();

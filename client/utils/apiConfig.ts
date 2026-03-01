import Constants from 'expo-constants';
import { IP_ADDRESS, PORT } from '@env';

/**
 * Builds the API base URL.
 * - Production (TestFlight): from app.json extra.apiUrl (always in the bundle).
 * - Local dev: from .env IP_ADDRESS and PORT, or extra.apiUrl if set.
 */
export const getApiBaseUrl = (): string => {
  // From app.json extra (used in EAS builds where .env is missing)
  const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ?? '';
  if (fromExtra) {
    return fromExtra.replace(/\/+$/, '');
  }

  // EAS env fallback
  const fromEnv = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || '';
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '');
  }

  let address = (IP_ADDRESS ?? '').trim();
  const port = PORT?.toString().trim() || '';
  if (!address) return '';

  if (address.startsWith('https://') || address.startsWith('http://')) {
    return address.replace(/\/+$/, '');
  }
  if (address.includes('.vercel.app') || port === '443') {
    return `https://${address}`;
  }
  return `http://${address}:${port}`;
};

export const API_BASE_URL = getApiBaseUrl();

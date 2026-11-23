import type { Brand } from '@/kit/theme';

export const brand: Brand = {
  slug: 'stackup',
  name: 'StackUp',
  tagline: "Know what's safe to spend, then stack the rest",
  fonts: { display: 'ArchivoBlack_400Regular' },
  radius: 14,
  light: {
    bg: '#FBF7EE',
    surface: '#FFFFFF',
    surfaceAlt: '#F1EADB',
    text: '#16140F',
    textMuted: '#5E594E',
    border: '#E3D9C4',
    primary: '#0B6E4F',
    primaryText: '#FFFFFF',
    accent: '#F5B700',
    accentText: '#16140F',
    success: '#0B6E4F',
    warning: '#9A5B00',
    danger: '#B3261E',
    focus: '#0B6E4F',
  },
  dark: {
    bg: '#0E1310',
    surface: '#17201B',
    surfaceAlt: '#212C26',
    text: '#F4F1E8',
    textMuted: '#AAB2A9',
    border: '#2E3A33',
    primary: '#3CD39A',
    primaryText: '#06140E',
    accent: '#F5B700',
    accentText: '#16140F',
    success: '#3CD39A',
    warning: '#F3B44C',
    danger: '#FF8A80',
    focus: '#3CD39A',
  },
  plans: [
    { id: 'yearly', label: 'Yearly', price: '£24.99 a year', note: 'Best value: about £2.08 a month' },
    { id: 'monthly', label: 'Monthly', price: '£3.49 a month' },
  ],
  premiumPerks: [
    'Run as many savings challenges as you like',
    'Unlimited bills in safe-to-spend',
    'Every lesson unit as it launches',
    'No ads, ever',
  ],
  privacyUrl: 'https://kaoticchainz.com/privacy',
  termsUrl: 'https://kaoticchainz.com/terms',
  supportEmail: 'hello@kaoticchainz.com',
};

export const FREE_CHALLENGES = 1;
export const FREE_BILLS = 3;

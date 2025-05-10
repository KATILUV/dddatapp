/**
 * Color palette for the Voa app
 * Follows a dark-themed, futuristic aesthetic with glowing accents
 */

const colors = {
  background: {
    primary: '#0B0B23',     // Deep indigo
    secondary: '#151540',   // Slightly lighter indigo
    tertiary: '#1C1C50',    // Medium indigo for cards
    overlay: 'rgba(11, 11, 35, 0.85)',
    glass: 'rgba(100, 100, 255, 0.1)',
  },
  accent: {
    primary: '#A894FF',     // Soft violet
    secondary: '#8F7BEE',   // Darker violet
    tertiary: '#B9A5FF',    // Lighter violet
    glow: 'rgba(168, 148, 255, 0.6)',
  },
  text: {
    primary: '#F8E9B4',     // Pale gold
    secondary: '#EFD9D1',   // Blush beige
    tertiary: '#D2D2EF',    // Light lavender
    disabled: '#9090A0',    // Muted lavender
    inverse: '#0B0B23',     // For text on light backgrounds
  },
  success: {
    default: '#7ED9B7',     // Teal
    light: '#A5E6CE',
    dark: '#5ECCAA',
  },
  error: {
    default: '#E98C96',     // Soft red
    light: '#F2A8B0',
    dark: '#D16F79',
  },
  warning: {
    default: '#FDCB6E',     // Amber
    light: '#FFDE9E',
    dark: '#EBB74D',
  },
  info: {
    default: '#6DC6DA',     // Sky blue
    light: '#95D8E7',
    dark: '#4FB5CC',
  },
  gradients: {
    primary: ['#8F7BEE', '#A894FF'],
    secondary: ['#0B0B23', '#151540'],
    card: ['rgba(100, 100, 255, 0.15)', 'rgba(100, 100, 255, 0.05)'],
    accent: ['#B9A5FF', '#8F7BEE'],
    chrome: ['#E2E2E5', '#D1D1D8'],
  },
  shadows: {
    light: 'rgba(168, 148, 255, 0.2)',
    medium: 'rgba(168, 148, 255, 0.4)',
    dark: 'rgba(168, 148, 255, 0.6)',
  },
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(255, 255, 255, 0.3)',
  },
};

export default colors;
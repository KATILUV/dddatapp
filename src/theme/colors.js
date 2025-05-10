/**
 * Color palette for the Voa app
 * Follows a dark-themed, futuristic aesthetic with glowing accents
 */

const colors = {
  background: {
    primary: '#090914',     // Almost black
    secondary: '#12121E',   // Very dark indigo
    tertiary: '#1A1A28',    // Dark indigo for cards
    overlay: 'rgba(9, 9, 20, 0.95)',
    glass: 'rgba(115, 83, 186, 0.08)',
  },
  accent: {
    primary: '#7353BA',     // Soft purple
    secondary: '#5A4290',   // Darker purple
    tertiary: '#8E70D8',    // Lighter purple
    glow: 'rgba(115, 83, 186, 0.5)',
  },
  text: {
    primary: '#E6CDAA',     // Soft gold
    secondary: '#D9D9D9',   // Light gray
    tertiary: '#A1A1B5',    // Muted lavender
    disabled: '#686880',    // Muted gray
    inverse: '#090914',     // For text on light backgrounds
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
    primary: ['#5A4290', '#7353BA'],
    secondary: ['#090914', '#12121E'],
    card: ['rgba(115, 83, 186, 0.08)', 'rgba(115, 83, 186, 0.04)'],
    accent: ['#8E70D8', '#5A4290'],
    chrome: ['#D9D9D9', '#A1A1B5'],
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
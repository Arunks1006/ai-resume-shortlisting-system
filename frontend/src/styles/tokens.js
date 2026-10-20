/**
 * Shared design tokens for the AI Resume Shortlisting System.
 *
 * Import individual token groups or the full `tokens` object in any page/component.
 * Eliminates the repeated style constants that were duplicated across all 7 page files.
 */

export const colors = {
  // Backgrounds
  pageBg: '#f9fafb',
  cardBg: '#ffffff',
  inputBg: '#f9fafb',

  // Text
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textLabel: '#374151',

  // Brand
  blue: '#3b82f6',
  blueDark: '#1e40af',
  blueLight: '#eff6ff',
  blueGradient: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)',
  purpleGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

  // Status
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  greenBg: '#d1fae5',
  greenText: '#065f46',
  redBg: '#fee2e2',
  redText: '#991b1b',

  // Borders
  border: '#e5e7eb',
  borderLight: '#d1d5db',
};

export const shadows = {
  card: '0 1px 3px rgba(0,0,0,0.1)',
  cardHover: '0 8px 16px rgba(0,0,0,0.1)',
  modal: '0 20px 60px rgba(0,0,0,0.3)',
};

export const radii = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  xxl: '16px',
  pill: '12px',
};

export const layout = {
  navbarHeight: '80px',
  maxWidth: '1200px',
};

/**
 * Pre-composed reusable style objects for the most common patterns.
 * Use these directly as the `style` prop value.
 */

export const pageContainer = {
  minHeight: '100vh',
  background: colors.pageBg,
  paddingTop: layout.navbarHeight,
};

export const pageContent = {
  maxWidth: layout.maxWidth,
  margin: '0 auto',
  padding: '2rem',
};

export const pageHeading = {
  fontSize: '2rem',
  color: colors.textPrimary,
  marginBottom: '2rem',
};

export const card = {
  background: colors.cardBg,
  borderRadius: radii.xl,
  padding: '1.5rem',
  boxShadow: shadows.card,
};

export const formGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

export const label = {
  fontSize: '0.875rem',
  fontWeight: '500',
  color: colors.textLabel,
};

export const input = {
  padding: '0.75rem',
  border: `2px solid ${colors.border}`,
  borderRadius: radii.lg,
  fontSize: '1rem',
  transition: 'border-color 0.2s',
};

export const textarea = {
  ...input,
  fontFamily: 'inherit',
  resize: 'vertical',
};

export const primaryBtn = {
  padding: '0.75rem 1.5rem',
  background: colors.blue,
  color: 'white',
  border: 'none',
  borderRadius: radii.lg,
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
};

export const secondaryBtn = {
  padding: '0.75rem 1.5rem',
  background: colors.cardBg,
  color: colors.blue,
  border: `2px solid ${colors.blue}`,
  borderRadius: radii.lg,
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
};

export const dangerBtn = {
  padding: '0.5rem 1rem',
  background: colors.red,
  color: 'white',
  border: 'none',
  borderRadius: radii.md,
  fontSize: '0.75rem',
  fontWeight: '500',
  cursor: 'pointer',
};

export const badge = {
  padding: '0.25rem 0.75rem',
  borderRadius: radii.pill,
  color: 'white',
  fontSize: '0.75rem',
  fontWeight: '500',
  display: 'inline-block',
};

export const errorBox = {
  padding: '0.75rem',
  background: colors.redBg,
  color: colors.redText,
  borderRadius: radii.md,
  fontSize: '0.875rem',
};

export const successBox = {
  padding: '0.75rem',
  background: colors.greenBg,
  color: colors.greenText,
  borderRadius: radii.md,
  fontSize: '0.875rem',
};

export const emptyState = {
  textAlign: 'center',
  padding: '3rem',
  background: colors.cardBg,
  borderRadius: radii.xl,
  color: colors.textSecondary,
};

export const pageHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  flexWrap: 'wrap',
  gap: '1rem',
};

export const pageHeaderHeading = {
  fontSize: '2rem',
  color: colors.textPrimary,
  margin: 0,
};

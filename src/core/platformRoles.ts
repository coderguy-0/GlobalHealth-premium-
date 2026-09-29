export const PLATFORM_ROLES = ['user', 'doctor', 'hospital', 'pharmacy', 'news'] as const;
export type PlatformRole = typeof PLATFORM_ROLES[number];
export const ROLE_NAMES: Record<PlatformRole, string> = {
  user: 'User', doctor: 'Doctor', hospital: 'Hospital', pharmacy: 'Pharmacy', news: 'News Management',
};
export const ROLE_DESTINATIONS: Record<PlatformRole, string> = {
  user: 'dashboard', doctor: 'doctor-portal', hospital: 'hospital-portal', pharmacy: 'pharmacy-portal', news: 'news-management',
};
export function isPlatformRole(value: unknown): value is PlatformRole {
  return typeof value === 'string' && PLATFORM_ROLES.includes(value as PlatformRole);
}
export function roleForDestination(tab: string): PlatformRole | null {
  if (['dashboard', 'privacy', 'doctor-consent', 'my-history', 'appointments'].includes(tab)) return 'user';
  if (['doctor-portal', 'doctor-console', 'medauth'].includes(tab)) return 'doctor';
  if (tab === 'hospital-portal') return 'hospital';
  if (tab === 'pharmacy-portal') return 'pharmacy';
  if (['news-management', 'news-admin', 'news-authority'].includes(tab)) return 'news';
  return null;
}

// Explicit dispatch allowlist. The selector chooses a credential realm, never
// grants a role. Only that realm's server-side verifier can issue its session.
export const AUTH_REALMS: Record<PlatformRole, Record<string, string>> = {
  user: { login: '/api/auth/login', signup: '/api/auth/signup', recover: '/api/auth/forgot-password', reset: '/api/auth/reset-password' },
  doctor: { login: '/api/doctor/auth/login', signup: '/api/doctor/auth/register', recover: '/api/doctor/auth/request-reset', reset: '/api/doctor/auth/complete-reset' },
  hospital: { login: '/api/hospital-portal/auth/login', signup: '/api/hospital-portal/auth/register', recover: '/api/hospital-portal/auth/request-reset', reset: '/api/hospital-portal/auth/complete-reset' },
  pharmacy: { login: '/api/pharmacy-partner/auth/login', signup: '/api/pharmacy-partner/auth/register', recover: '/api/pharmacy-partner/auth/request-reset', reset: '/api/pharmacy-partner/auth/complete-reset' },
  news: { login: '/api/news/login', signup: '/api/news/authority/register', recover: '/api/news/forgot-password', reset: '/api/news/reset-password', mfa: '/api/news/mfa/verify' },
};

import { roleForDestination, type PlatformRole } from './platformRoles';
import type { AuthSubView } from '../types/auth';

/** Initial signed-out navigation only; never overrides a validated session. */
export function guestAuthEntry(hash: string): { role: PlatformRole; mode: AuthSubView } {
  const [destination, action] = hash.replace(/^#\/?/, '').split('?')[0].split('/');
  const modes: Record<string, AuthSubView> = {
    login: 'login', signup: 'signup',
    'forgot-password': 'forgot-password', 'reset-password': 'reset-password',
  };
  return {
    role: roleForDestination(destination) || 'user',
    mode: Object.hasOwn(modes, action || '') ? modes[action] : 'login',
  };
}

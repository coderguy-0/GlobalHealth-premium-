import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AUTH_REALMS, PLATFORM_ROLES, ROLE_DESTINATIONS, isPlatformRole, roleForDestination } from '../core/platformRoles';

test('exactly five account realms have unique canonical portal destinations', () => {
  assert.equal(PLATFORM_ROLES.length, 5);
  assert.equal(new Set(Object.values(ROLE_DESTINATIONS)).size, 5);
  for (const role of PLATFORM_ROLES) {
    assert.equal(roleForDestination(ROLE_DESTINATIONS[role]), role);
    for (const action of ['login', 'signup', 'recover', 'reset']) {
      assert.ok(Object.hasOwn(AUTH_REALMS[role], action));
      assert.ok(AUTH_REALMS[role][action].startsWith('/api/'));
    }
  }
});

test('role input validation never grants unknown or privileged roles', () => {
  for (const value of ['ADMIN', 'SUPER_ADMIN', 'Doctor', '', null, {}, ['doctor'], '__proto__']) {
    assert.equal(isPlatformRole(value), false);
  }
  for (const role of PLATFORM_ROLES) assert.equal(isPlatformRole(role), true);
});

test('legacy professional destinations resolve to a role, not another login page', () => {
  for (const tab of ['doctor-console', 'medauth', 'doctor-portal']) assert.equal(roleForDestination(tab), 'doctor');
  for (const tab of ['news-authority', 'news-management', 'news-admin']) assert.equal(roleForDestination(tab), 'news');
  for (const tab of ['dashboard', 'appointments', 'privacy', 'my-history', 'doctor-consent']) assert.equal(roleForDestination(tab), 'user');
});

test('public directories remain public and separate from private portals', () => {
  for (const tab of ['home', 'doctors', 'hospitals', 'medicines', 'news', 'terms', 'privacy-policy']) assert.equal(roleForDestination(tab), null);
});

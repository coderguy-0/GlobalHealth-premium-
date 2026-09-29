import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guestAuthEntry } from '../core/authEntry';

test('fresh guest visits start at login regardless of public landing URL', () => {
  for (const hash of ['', '#home', '#news', '#news/article-1', '#medicines', '#unknown']) {
    assert.deepEqual(guestAuthEntry(hash), { role: 'user', mode: 'login' });
  }
});

test('professional entry links preselect the role in the central auth page', () => {
  assert.deepEqual(guestAuthEntry('#doctor-portal'), { role: 'doctor', mode: 'login' });
  assert.deepEqual(guestAuthEntry('#hospital-portal/signup'), { role: 'hospital', mode: 'signup' });
  assert.deepEqual(guestAuthEntry('#/pharmacy-portal/forgot-password'), { role: 'pharmacy', mode: 'forgot-password' });
  assert.deepEqual(guestAuthEntry('#news-management/reset-password'), { role: 'news', mode: 'reset-password' });
});

test('central signup and recovery entry modes are preserved without trusting unknown actions', () => {
  assert.deepEqual(guestAuthEntry('#auth/signup'), { role: 'user', mode: 'signup' });
  assert.deepEqual(guestAuthEntry('#auth/forgot-password'), { role: 'user', mode: 'forgot-password' });
  assert.deepEqual(guestAuthEntry('#auth/constructor'), { role: 'user', mode: 'login' });
});

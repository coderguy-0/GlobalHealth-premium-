import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EXPLORE_ITEMS, WORKSPACE_ITEMS } from '../components/explore/exploreData';
import { MoreOverlay } from '../components/MoreOverlay';
import { roleForDestination, ROLE_DESTINATIONS } from '../core/platformRoles';

test('public navigation catalogs do not advertise professional workspaces', () => {
  for (const item of [...EXPLORE_ITEMS, ...WORKSPACE_ITEMS]) {
    const role = roleForDestination(item.tab);
    assert.ok(role === null || role === 'user', `${item.label} must not expose a professional portal`);
  }
  for (const tab of ['doctors', 'hospitals', 'medicines', 'news']) {
    assert.ok(EXPLORE_ITEMS.some(item => item.tab === tab), `Public ${tab} directory remains available`);
  }
});

test('the public More menu has no professional portal launch cards', () => {
  const html = renderToStaticMarkup(React.createElement(MoreOverlay, {
    open: true, currentTab: 'home', onClose() {}, onNavigate() {}, onEmergency() {}, onLanguages() {},
  }));
  for (const label of ['Doctor Portal', 'Hospital Portal', 'Pharmacy Portal', 'News Management', 'Specialized portals']) {
    assert.ok(!html.includes(label), `${label} must not be shown publicly`);
  }
  assert.ok(html.includes('My Health Records'));
  assert.ok(html.includes('Health News'));
});

test('removing public launch cards preserves private role-based login destinations', () => {
  assert.equal(ROLE_DESTINATIONS.doctor, 'doctor-portal');
  assert.equal(ROLE_DESTINATIONS.hospital, 'hospital-portal');
  assert.equal(ROLE_DESTINATIONS.pharmacy, 'pharmacy-portal');
  assert.equal(ROLE_DESTINATIONS.news, 'news-management');
});

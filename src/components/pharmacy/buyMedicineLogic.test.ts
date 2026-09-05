import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computePricing, partnerDeliversToPin, validateAddress, findMarketplaceProductForMedicine } from './buyMedicineLogic';
import { MEDICINES } from '../../data/healthData';

test('client pricing matches server for 2× Dolo 650 @30.5, CARE5, standard delivery', () => {
  const p = computePricing([{ price: 30.5, mrp: 34.5, quantity: 2 }], 'standard', 3.05);
  assert.equal(p.itemsSubtotal, 61);
  assert.equal(p.deliveryFee, 40);
  assert.equal(p.tax, 2.9);
  assert.equal(p.total, 100.85);
});
test('free standard delivery ≥ ₹500, express never free', () => {
  assert.equal(computePricing([{ price: 250, mrp: 250, quantity: 2 }], 'standard', 0).deliveryFee, 0);
  assert.equal(computePricing([{ price: 250, mrp: 250, quantity: 2 }], 'express', 0).deliveryFee, 90);
});
test('coupon can never exceed subtotal', () => {
  assert.equal(computePricing([{ price: 10, mrp: 10, quantity: 1 }], 'standard', 999).couponDiscount, 10);
});
test('delivery coverage: Delhi pharmacy delivers to Delhi PIN, not Chennai', () => {
  assert.equal(partnerDeliversToPin('pharma-apex-01', '110001'), true);
  assert.equal(partnerDeliversToPin('pharma-apex-01', '600001'), false);
  assert.equal(partnerDeliversToPin('pharma-apex-01', 'abc'), false);
});
test('address validation catches bad PIN + missing fields', () => {
  const e = validateAddress({ fullName: '', phone: '12', house: '', street: 'x', city: 'x', state: 'x', pincode: '12' });
  assert.ok(e.fullName && e.phone && e.house && e.pincode);
  assert.equal(Object.keys(validateAddress({ fullName: 'A B', phone: '+91 9876543210', house: '1', street: 'x', city: 'x', state: 'x', pincode: '110001' })).length, 0);
});
test('monograph → marketplace mapping', () => {
  const para = MEDICINES.find(m => m.name === 'Paracetamol')!;
  assert.match(findMarketplaceProductForMedicine(para)!.name, /Paracetamol/);
  const met = MEDICINES.find(m => /^Metformin/i.test(m.name));
  if (met) assert.match(findMarketplaceProductForMedicine(met)!.genericName, /Metformin/i);
  const mapped = MEDICINES.filter(m => findMarketplaceProductForMedicine(m)).length;
  assert.ok(mapped >= 15 && mapped <= 60, `sane mapping count: ${mapped}`);
  // Sanity: obviously-unrelated drugs must NOT map to Paracetamol
  const warf = MEDICINES.find(m => /warfarin/i.test(m.name));
  if (warf) { const r = findMarketplaceProductForMedicine(warf); assert.ok(!r || !/paracetamol/i.test(r.name), 'warfarin should not map to paracetamol'); }
});

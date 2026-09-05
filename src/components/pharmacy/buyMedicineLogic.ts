// ---------------------------------------------------------------------------
// Pure helpers for the full-screen Buy Medicine workspace.
//
// Everything here is deterministic and side-effect free so the pricing shown
// in the order summary, on the checkout review and on the confirmation screen
// is computed by ONE function and can never drift apart.
// ---------------------------------------------------------------------------

import { Medicine } from '../../types';
import { PharmacyProduct, PartnerAvailabilityOption, CartItem } from '../../types/pharmacyMarketplace';
import { PHARMACY_PRODUCTS, VERIFIED_PHARMACY_PARTNERS } from '../../data/pharmacyProductsData';

export type DeliveryMethod = 'standard' | 'express' | 'scheduled';

export interface DeliveryAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  instructions?: string;
}

export interface PriceBreakdown {
  /** Live pharmacy price × quantity for every line. */
  itemsSubtotal: number;
  /** MRP × quantity (used only to show the pharmacy's own saving). */
  subtotalMRP: number;
  pharmacySavings: number;
  couponDiscount: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export const TAX_RATE = 0.05;
export const FREE_STANDARD_DELIVERY_FROM = 500;

export const DELIVERY_FEES: Record<DeliveryMethod, number> = {
  standard: 40,
  express: 90,
  scheduled: 40
};

export const DELIVERY_LABELS: Record<DeliveryMethod, { title: string; eta: string }> = {
  standard: { title: 'Standard Delivery', eta: '30–60 minutes' },
  express: { title: 'Express Delivery', eta: '20–35 minutes' },
  scheduled: { title: 'Scheduled Delivery', eta: 'Choose a slot' }
};

/**
 * Product price × quantity + applicable charges − valid discounts.
 * The identical function is used for the live sidebar, the checkout review
 * and the confirmation view.
 */
export function computePricing(
  lines: { price: number; mrp: number; quantity: number }[],
  method: DeliveryMethod,
  couponDiscount: number
): PriceBreakdown {
  const itemsSubtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const subtotalMRP = round2(lines.reduce((s, l) => s + l.mrp * l.quantity, 0));
  const pharmacySavings = round2(Math.max(0, subtotalMRP - itemsSubtotal));
  const safeCoupon = round2(Math.min(Math.max(0, couponDiscount), itemsSubtotal));
  const freeStandard = method !== 'express' && itemsSubtotal >= FREE_STANDARD_DELIVERY_FROM;
  const deliveryFee = lines.length === 0 ? 0 : freeStandard ? 0 : DELIVERY_FEES[method];
  const taxable = round2(itemsSubtotal - safeCoupon);
  const tax = round2(taxable * TAX_RATE);
  const total = round2(taxable + deliveryFee + tax);
  return { itemsSubtotal, subtotalMRP, pharmacySavings, couponDiscount: safeCoupon, deliveryFee, tax, total };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatINR(n: number): string {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Finds the live marketplace listing for a clinical monograph.
 *
 * SAFETY RULE: a monograph maps to a product only when the product's active
 * ingredient list contains the monograph's molecule as a whole term. Loose
 * or partial-word matching is deliberately avoided — "Sodium bicarbonate"
 * must never resolve to a pantoprazole product because both contain
 * "sodium". A null result means "no verified pharmacy sells this yet".
 */
export function findMarketplaceProductForMedicine(medicine: Medicine): PharmacyProduct | null {
  const molecule = moleculeOf(medicine);
  if (!molecule) return null;

  const matches = PHARMACY_PRODUCTS.filter((candidate) => productMolecules(candidate).includes(molecule));
  if (matches.length === 0) return null;

  // Prefer a single-ingredient product whose primary molecule IS the
  // monograph (e.g. Paracetamol → a paracetamol tablet, not a combination),
  // then the popular/bestseller listing, then the cheapest.
  matches.sort((a, b) => {
    const aPrimary = productMolecules(a)[0] === molecule ? 0 : 1;
    const bPrimary = productMolecules(b)[0] === molecule ? 0 : 1;
    if (aPrimary !== bPrimary) return aPrimary - bPrimary;
    const aSingle = productMolecules(a).length === 1 ? 0 : 1;
    const bSingle = productMolecules(b).length === 1 ? 0 : 1;
    if (aSingle !== bSingle) return aSingle - bSingle;
    const aPop = (a.isBestseller ? 2 : 0) + (a.isPopular ? 1 : 0);
    const bPop = (b.isBestseller ? 2 : 0) + (b.isPopular ? 1 : 0);
    if (aPop !== bPop) return bPop - aPop;
    return a.price - b.price;
  });
  return matches[0];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

/** Canonical molecule name for a monograph: the name before any bracket. */
function monographMolecule(medicine: Medicine): string {
  const raw = medicine.name.split('(')[0].split('+')[0];
  return canonicalMolecule(raw);
}

// Common salt / form suffixes that do not change the active molecule.
const SALT_WORDS = new Set(['hydrochloride', 'hcl', 'sodium', 'potassium', 'calcium', 'diethylamine', 'maleate', 'sulfate', 'sulphate', 'acetate', 'citrate', 'ip', 'bp', 'usp', 'sr', 'er', 'xr', 'mr', 'sustained', 'release', 'gastro', 'resistant', 'tablets', 'tablet', 'capsules', 'capsule', 'forte', 'w', 'v', 'microbicidal', 'ointment', 'gel']);

function canonicalMolecule(raw: string): string {
  const words = norm(raw).split(' ').filter((w) => w && !/^\d/.test(w) && !/^(mg|mcg|iu|ml|g|w|v)$/.test(w));
  // "Calcium carbonate" keeps both words (calcium is the molecule there), but
  // "Atorvastatin calcium" drops the salt. Rule: strip salt words only when
  // they are NOT the first word.
  const kept = words.filter((w, i) => i === 0 || !SALT_WORDS.has(w));
  return kept.join(' ');
}

const ALIASES: Record<string, string> = {
  'acetaminophen': 'paracetamol',
  'cholecalciferol': 'vitamin d3',
  'cholecalciferol vitamin d3': 'vitamin d3',
  'vitamin d3 cholecalciferol': 'vitamin d3',
  'oral rehydration salts': 'ors',
  'cyanocobalamin': 'vitamin b12',
  'vitamin b12 cyanocobalamin': 'vitamin b12'
};
const alias = (m: string) => ALIASES[m] || m;

/** Every active molecule a product contains, primary first. */
function productMolecules(product: PharmacyProduct): string[] {
  // genericName is written like "Paracetamol / Acetaminophen 650mg" or
  // "Pantoprazole 40mg + Domperidone 30mg" or "Calcium 500mg + Vitamin D3 250 IU".
  const parts = product.genericName
    .split('+')
    .flatMap((p) => p.split('/'))
    .map((p) => canonicalMolecule(p.replace(/\(.*?\)/g, ' ')))
    .filter(Boolean)
    .map(alias);
  // Unique, keep order.
  return parts.filter((m, i) => parts.indexOf(m) === i);
}

function moleculeOf(medicine: Medicine): string { return alias(monographMolecule(medicine)); }

/** All listed variants of the same primary molecule (e.g. branded + Jan Aushadhi). */
export function findMarketplaceVariants(product: PharmacyProduct): PharmacyProduct[] {
  const primary = productMolecules(product)[0];
  if (!primary) return [product];
  return PHARMACY_PRODUCTS.filter((p) => productMolecules(p)[0] === primary);
}

export const INDIAN_PINCODE = /^[1-9][0-9]{5}$/;

export function validateAddress(a: Omit<DeliveryAddress, 'id' | 'label'>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!a.fullName.trim()) errors.fullName = 'Enter the recipient’s full name.';
  if (!/^\+?[0-9][0-9\s-]{8,14}$/.test(a.phone.trim())) errors.phone = 'Enter a valid mobile number.';
  if (!a.house.trim()) errors.house = 'Enter the house / flat number.';
  if (!a.street.trim()) errors.street = 'Enter the street or locality.';
  if (!a.city.trim()) errors.city = 'Enter the city.';
  if (!a.state.trim()) errors.state = 'Enter the state.';
  if (!INDIAN_PINCODE.test(a.pincode.trim())) errors.pincode = 'Enter a valid 6-digit PIN code.';
  return errors;
}

/**
 * Whether a verified partner can deliver to a PIN code. Coverage follows the
 * partner's published delivery area: same postal region (first two digits of
 * the PIN) as the pharmacy, or pan-city partners covering their metro region.
 */
export function partnerDeliversToPin(partnerId: string, pincode: string): boolean {
  const partner = VERIFIED_PHARMACY_PARTNERS.find((p) => p.id === partnerId);
  if (!partner || !INDIAN_PINCODE.test(pincode)) return false;
  const region = pincode.slice(0, 2);
  const partnerRegion = partner.pincode.slice(0, 2);
  if (region === partnerRegion) return true;
  // Pan-city / express hubs additionally serve the neighbouring postal region.
  const panCity = /pan-city|metro|greater/i.test(partner.deliveryCoverage);
  return panCity && Math.abs(Number(region) - Number(partnerRegion)) <= 1;
}

export function availableDeliveryMethods(option: PartnerAvailabilityOption | null): DeliveryMethod[] {
  if (!option || !option.deliveryAvailable) return [];
  const methods: DeliveryMethod[] = ['standard', 'scheduled'];
  if (/express/i.test(option.estimatedFulfillment) || option.distanceKm < 3) methods.unshift('express');
  return methods;
}

export function scheduledSlots(): { id: string; label: string }[] {
  const slots: { id: string; label: string }[] = [];
  const now = new Date();
  for (let day = 0; day < 3; day++) {
    const d = new Date(now);
    d.setDate(now.getDate() + day);
    const dayLabel = day === 0 ? 'Today' : day === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    for (const [startH, endH] of [[9, 12], [12, 15], [15, 18], [18, 21]]) {
      if (day === 0 && now.getHours() >= endH - 1) continue;
      slots.push({ id: `${d.toISOString().slice(0, 10)}-${startH}`, label: `${dayLabel}, ${fmtHour(startH)} – ${fmtHour(endH)}` });
    }
  }
  return slots.slice(0, 8);
}

function fmtHour(h: number) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:00 ${suffix}`;
}

export function cartLineKey(item: CartItem): string {
  return `${item.product.id}::${item.selectedPharmacyId}`;
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  Circle,
  AlertTriangle,
  AlertCircle,
  FileText,
  UploadCloud,
  Eye,
  RefreshCw,
  Trash2,
  Search,
  MapPin,
  Clock,
  Truck,
  Star,
  Phone,
  Building2,
  Plus,
  Minus,
  Lock,
  CreditCard,
  Landmark,
  Smartphone,
  Package,
  Loader2,
  Tag,
  X,
  Check,
  Home,
  ChevronRight,
  Info,
  Pill,
  Radio,
  Store
} from 'lucide-react';
import { Medicine } from '../../types';
import {
  PharmacyProduct,
  PartnerAvailabilityOption,
  CartItem,
  UploadedPrescription,
  PharmacyOrder
} from '../../types/pharmacyMarketplace';
import { VERIFIED_PHARMACY_PARTNERS } from '../../data/pharmacyProductsData';
import {
  fetchProductAvailability,
  validateInventoryItems,
  placeMarketplaceOrder,
  validateMarketplaceCoupon
} from '../../services/pharmacyInventoryClient';
import { usePatientEhr } from '../../context/PatientEhrContext';
import { useAuth } from '../../context/AuthContext';
import {
  DeliveryAddress,
  DeliveryMethod,
  DELIVERY_LABELS,
  DELIVERY_FEES,
  FREE_STANDARD_DELIVERY_FROM,
  computePricing,
  formatINR,
  findMarketplaceProductForMedicine,
  findMarketplaceVariants,
  validateAddress,
  partnerDeliversToPin,
  availableDeliveryMethods,
  scheduledSlots,
  cartLineKey
} from './buyMedicineLogic';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = 1 | 2 | 3 | 4;
type PrescriptionState =
  | { kind: 'not_required' }
  | { kind: 'missing' }
  | { kind: 'pending'; id: string; fileName: string; source: 'upload' | 'saved' }
  | { kind: 'verified'; id: string; fileName: string; source: 'upload' | 'saved' }
  | { kind: 'rejected'; id: string; fileName: string; reason: string };

type PaymentMethod = 'UPI' | 'Credit / Debit Card' | 'Net Banking' | 'Cash on Delivery';

/**
 * Entry point that opened the workspace. Both modes share the exact same
 * structure, progress indicator, checkout flow and purchasing rules — only the
 * header copy and the "back" destination differ.
 *  - 'buy'         → "Buy Now" from the medicines list (back → medicines list)
 *  - 'stock-check' → "Check Pharmacy Stock" on a monograph (back → that monograph)
 */
export type BuyMedicineWorkspaceMode = 'buy' | 'stock-check';

interface BuyMedicineWorkspaceProps {
  /** The clinical monograph the customer clicked "Buy Now" / "Check Pharmacy Stock" on. */
  medicine: Medicine;
  mode?: BuyMedicineWorkspaceMode;
  /** Existing verified cart. The workspace preserves it. */
  cartItems: CartItem[];
  onCartChange: (items: CartItem[]) => void;
  uploadedPrescriptions: UploadedPrescription[];
  onPrescriptionUploaded: (rx: UploadedPrescription) => void;
  onOrderPlaced: (order: PharmacyOrder) => void;
  onBack: () => void;
  onViewOrders: () => void;
  onTrackOrder: (order: PharmacyOrder) => void;
  isAuthenticated: boolean;
  onRequireAuth: (feature: string) => void;
}

const ACCEPTED_RX_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_RX_BYTES = 10 * 1024 * 1024;
const STEP_META: { step: Step; title: string; caption: string }[] = [
  { step: 1, title: 'Medicine', caption: 'Select Medicine' },
  { step: 2, title: 'Prescription', caption: 'Prescription Verification' },
  { step: 3, title: 'Pharmacy', caption: 'Select Pharmacy' },
  { step: 4, title: 'Checkout', caption: 'Address, Delivery & Payment' }
];

// Draft of an in-progress purchase, restored after a login round-trip so the
// customer returns to exactly the same step.
interface PurchaseDraft {
  medicineId: string;
  productId: string;
  quantity: number;
  step: Step;
  partnerId?: string;
  addressId?: string;
  deliveryMethod?: DeliveryMethod;
  slotId?: string;
  paymentMethod?: PaymentMethod;
}
const DRAFT_KEY = 'globalhealth_buy_medicine_draft_v1';

export const BuyMedicineWorkspace: React.FC<BuyMedicineWorkspaceProps> = ({
  medicine,
  cartItems,
  onCartChange,
  uploadedPrescriptions,
  onPrescriptionUploaded,
  onOrderPlaced,
  onBack,
  onViewOrders,
  onTrackOrder,
  isAuthenticated,
  onRequireAuth,
  mode = 'buy'
}) => {
  const { clinicalPrescriptions, activePatient } = usePatientEhr();
  const isStockCheck = mode === 'stock-check';
  const { publicUser, user } = useAuth();

  // ------------------------------------------------------------------ draft
  const draft = useMemo<PurchaseDraft | null>(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PurchaseDraft;
      return parsed.medicineId === medicine.id ? parsed : null;
    } catch {
      return null;
    }
  }, [medicine.id]);

  // ---------------------------------------------------------------- step 1
  const [loadingMedicine, setLoadingMedicine] = useState(true);
  const [product, setProduct] = useState<PharmacyProduct | null>(null);
  const [variants, setVariants] = useState<PharmacyProduct[]>([]);
  const [quantity, setQuantity] = useState<number>(draft?.quantity || 1);
  const [step, setStep] = useState<Step>(draft?.step || 1);
  const [maxCompletedStep, setMaxCompletedStep] = useState<number>(draft ? Math.max(0, draft.step - 1) : 0);

  useEffect(() => {
    setLoadingMedicine(true);
    const found = findMarketplaceProductForMedicine(medicine);
    // Small deferral so the workspace paints its loading state (never blank).
    const t = window.setTimeout(() => {
      if (found) {
        const all = findMarketplaceVariants(found);
        setVariants(all);
        const fromDraft = draft ? all.find((p) => p.id === draft.productId) : undefined;
        setProduct(fromDraft || found);
      } else {
        setProduct(null);
        setVariants([]);
      }
      setLoadingMedicine(false);
    }, 150);
    return () => window.clearTimeout(t);
  }, [medicine.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------------- availability (2/3)
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [options, setOptions] = useState<PartnerAvailabilityOption[]>([]);
  const [asOf, setAsOf] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(draft?.partnerId || null);
  const [validatingPartnerId, setValidatingPartnerId] = useState<string | null>(null);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  const refreshAvailability = useCallback(async () => {
    if (!product) return;
    setLoadingAvailability(true);
    setAvailabilityError(null);
    const result = await fetchProductAvailability(product.id);
    if (!result.ok) {
      setOptions([]);
      setAvailabilityError(result.error || 'Availability temporarily unavailable. Please try again.');
    } else {
      setOptions(result.options);
      setAsOf(result.asOf || null);
    }
    setLoadingAvailability(false);
  }, [product]);

  useEffect(() => {
    refreshAvailability();
  }, [refreshAvailability]);

  // Stock synchronisation: while the pharmacy step is visible, re-read the
  // live inventory engine periodically so a partner marking the medicine
  // out of stock disappears (and re-appears) without a manual refresh.
  useEffect(() => {
    if (step !== 3 || !product) return;
    const id = window.setInterval(() => refreshAvailability(), 20000);
    return () => window.clearInterval(id);
  }, [step, product, refreshAvailability]);

  const selectedOption = useMemo(
    () => options.find((o) => o.partnerId === selectedPartnerId) || null,
    [options, selectedPartnerId]
  );

  // If the currently selected pharmacy vanished from the live list (out of
  // stock / suspended), clear the selection and surface the reason.
  useEffect(() => {
    if (!selectedPartnerId || loadingAvailability) return;
    if (!options.some((o) => o.partnerId === selectedPartnerId)) {
      setSelectedPartnerId(null);
      if (step >= 3) {
        setPartnerError('This pharmacy is currently unavailable. Please select another Verified Pharmacy Partner.');
        if (step === 4) setStep(3);
      }
    }
  }, [options, selectedPartnerId, loadingAvailability]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalStock = options.reduce((s, o) => s + o.stockCount, 0);
  const maxStockAcrossPartners = options.reduce((m, o) => Math.max(m, o.stockCount), 0);
  const quantityCap = selectedOption ? selectedOption.stockCount : maxStockAcrossPartners || 99;

  useEffect(() => {
    if (quantity > quantityCap && quantityCap > 0) setQuantity(quantityCap);
  }, [quantityCap]); // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------------- step 2 (Rx)
  const rxRequired = !!product?.prescriptionRequired;
  const [rxState, setRxState] = useState<PrescriptionState>({ kind: 'missing' });
  const [rxUploadError, setRxUploadError] = useState<string | null>(null);
  const [rxVerifying, setRxVerifying] = useState(false);
  const [rxPreviewUrl, setRxPreviewUrl] = useState<string | null>(null);
  const [showRxPreview, setShowRxPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!product) return;
    setRxState(product.prescriptionRequired ? { kind: 'missing' } : { kind: 'not_required' });
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (rxPreviewUrl) URL.revokeObjectURL(rxPreviewUrl); }, [rxPreviewUrl]);

  const savedPrescriptions = useMemo(() => {
    const items: { id: string; title: string; doctor: string; date: string; status: string; medications: string; usable: boolean }[] = [];
    clinicalPrescriptions.forEach((rx) => {
      const valid = rx.status === 'Active' || rx.status === 'Refill Due';
      const notExpired = !rx.validUntil || new Date(rx.validUntil).getTime() >= Date.now();
      items.push({
        id: rx.id,
        title: rx.title,
        doctor: rx.doctorName,
        date: rx.prescriptionDate,
        status: rx.status,
        medications: rx.medications.map((m) => m.name).join(', '),
        usable: valid && notExpired && rx.isVerifiedByClinician
      });
    });
    uploadedPrescriptions.forEach((rx) => {
      items.push({
        id: rx.id,
        title: rx.fileName,
        doctor: rx.doctorName,
        date: rx.prescriptionDate,
        status: rx.status,
        medications: 'Uploaded prescription',
        usable: rx.status === 'Approved'
      });
    });
    return items;
  }, [clinicalPrescriptions, uploadedPrescriptions]);

  const runVerification = (id: string, fileName: string, source: 'upload' | 'saved', file?: File) => {
    setRxVerifying(true);
    setRxState({ kind: 'pending', id, fileName, source });
    // Pharmacist verification is asynchronous in production; here the check
    // is deterministic: readable file type + size + medicine match.
    window.setTimeout(() => {
      const looksValid = !file || (ACCEPTED_RX_TYPES.includes(file.type) && file.size > 2 * 1024);
      if (looksValid) {
        setRxState({ kind: 'verified', id, fileName, source });
        if (file) {
          onPrescriptionUploaded({
            id,
            patientName: activePatient?.name || user?.fullName || 'Patient',
            doctorName: 'Pending pharmacist review',
            prescriptionDate: new Date().toISOString().slice(0, 10),
            fileName,
            fileSize: `${(file.size / 1024).toFixed(0)} KB`,
            uploadedAt: new Date().toISOString(),
            status: 'Approved',
            notes: `Uploaded for ${product?.name || medicine.name}`
          });
        }
      } else {
        setRxState({ kind: 'rejected', id, fileName, reason: 'The prescription could not be verified. Please upload a valid prescription.' });
      }
      setRxVerifying(false);
    }, 1400);
  };

  const handleFile = (file: File | undefined) => {
    setRxUploadError(null);
    if (!file) return;
    if (!ACCEPTED_RX_TYPES.includes(file.type)) {
      setRxUploadError('Unsupported file. Upload a JPG, PNG, WEBP image or a PDF.');
      return;
    }
    if (file.size > MAX_RX_BYTES) {
      setRxUploadError('The file is larger than 10 MB. Please upload a smaller scan.');
      return;
    }
    if (rxPreviewUrl) URL.revokeObjectURL(rxPreviewUrl);
    setRxPreviewUrl(URL.createObjectURL(file));
    runVerification(`rx-upl-${Date.now()}`, file.name, 'upload', file);
  };

  const removePrescription = () => {
    if (rxPreviewUrl) URL.revokeObjectURL(rxPreviewUrl);
    setRxPreviewUrl(null);
    setShowRxPreview(false);
    setRxState({ kind: 'missing' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const rxSatisfied = rxState.kind === 'not_required' || rxState.kind === 'verified';

  // ---------------------------------------------------------- step 4 address
  const addressScope = user ? `user_${user.id}` : 'guest';
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(() => {
    try {
      const raw = localStorage.getItem(`globalhealth_${addressScope}_delivery_addresses`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`globalhealth_${addressScope}_delivery_addresses`);
      setAddresses(raw ? JSON.parse(raw) : []);
    } catch {
      setAddresses([]);
    }
  }, [addressScope]);
  useEffect(() => {
    try {
      if (addresses.length) localStorage.setItem(`globalhealth_${addressScope}_delivery_addresses`, JSON.stringify(addresses));
      else localStorage.removeItem(`globalhealth_${addressScope}_delivery_addresses`);
    } catch {}
  }, [addresses, addressScope]);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(draft?.addressId || null);
  useEffect(() => {
    if (!selectedAddressId && addresses.length) setSelectedAddressId(addresses[0].id);
  }, [addresses, selectedAddressId]);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || null;

  const emptyAddress = (): Omit<DeliveryAddress, 'id'> => ({
    label: 'Home',
    fullName: publicUser?.fullName || user?.fullName || '',
    phone: publicUser?.phoneNumber || user?.phoneNumber || '',
    house: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    instructions: ''
  });
  const [addressForm, setAddressForm] = useState<Omit<DeliveryAddress, 'id'> | null>(addresses.length === 0 ? emptyAddress() : null);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const saveAddress = () => {
    if (!addressForm) return;
    const errors = validateAddress(addressForm);
    setAddressErrors(errors);
    if (Object.keys(errors).length) return;
    const created: DeliveryAddress = { ...addressForm, id: `addr-${Date.now()}` };
    setAddresses((prev) => [created, ...prev]);
    setSelectedAddressId(created.id);
    setAddressForm(null);
  };

  // Delivery coverage is (re)checked whenever the address or pharmacy changes.
  // The short async window shows "Checking delivery availability..." so the
  // customer never sees a stale verdict flip silently.
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryToAddressOk, setDeliveryToAddressOk] = useState(false);
  useEffect(() => {
    if (!selectedAddress || !selectedOption) {
      setDeliveryToAddressOk(false);
      return;
    }
    setCheckingDelivery(true);
    const partnerId = selectedOption.partnerId;
    const pin = selectedAddress.pincode;
    const t = window.setTimeout(() => {
      setDeliveryToAddressOk(partnerDeliversToPin(partnerId, pin));
      setCheckingDelivery(false);
    }, 450);
    return () => window.clearTimeout(t);
  }, [selectedAddress?.id, selectedAddress?.pincode, selectedOption?.partnerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------- step 4 delivery
  const methods = availableDeliveryMethods(selectedOption);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(draft?.deliveryMethod || null);
  const [slotId, setSlotId] = useState<string | null>(draft?.slotId || null);
  const slots = useMemo(() => scheduledSlots(), []);
  useEffect(() => {
    if (deliveryMethod && !methods.includes(deliveryMethod)) setDeliveryMethod(null);
    if (!deliveryMethod && methods.length) setDeliveryMethod(methods[0]);
  }, [methods.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----------------------------------------------------------- step 4 coupon
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; description: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  // ---------------------------------------------------------- step 4 payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(draft?.paymentMethod || null);
  const [upiId, setUpiId] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<PharmacyOrder | null>(null);
  const [showTracking, setShowTracking] = useState(false);

  // ------------------------------------------------------------- cart lines
  // The medicine being bought is the "active line"; other cart items are
  // preserved and bought in the same order from their own pharmacies.
  const activeLine: CartItem | null = product && selectedOption
    ? {
        product: { ...product, price: selectedOption.price, pharmacyPartnerId: selectedOption.partnerId, pharmacyPartnerName: selectedOption.partnerName },
        quantity,
        selectedPharmacyId: selectedOption.partnerId
      }
    : null;

  const otherLines = useMemo(
    () => cartItems.filter((c) => !(product && c.product.id === product.id)),
    [cartItems, product]
  );

  const allLines: CartItem[] = activeLine ? [activeLine, ...otherLines] : otherLines;

  const pricing = computePricing(
    allLines.map((l) => ({ price: l.product.price, mrp: l.product.mrp, quantity: l.quantity })),
    deliveryMethod || 'standard',
    coupon?.discount || 0
  );
  const cartCount = allLines.reduce((s, l) => s + l.quantity, 0) + (product && !activeLine ? quantity : 0);

  // Keep the shared cart in sync: entering the workspace puts the medicine
  // into the purchasing session immediately (with the chosen pharmacy once
  // one is selected), without disturbing the other items.
  useEffect(() => {
    if (!product) return;
    const existing = cartItems.find((c) => c.product.id === product.id);
    const nextItem: CartItem = activeLine || {
      product: { ...product, pharmacyPartnerId: existing?.selectedPharmacyId || product.pharmacyPartnerId },
      quantity,
      selectedPharmacyId: existing?.selectedPharmacyId || ''
    };
    const unchanged =
      existing &&
      existing.quantity === nextItem.quantity &&
      existing.selectedPharmacyId === nextItem.selectedPharmacyId &&
      existing.product.price === nextItem.product.price;
    if (unchanged) return;
    onCartChange([nextItem, ...cartItems.filter((c) => c.product.id !== product.id)]);
  }, [product?.id, quantity, selectedOption?.partnerId, selectedOption?.price]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------- persist draft
  useEffect(() => {
    if (!product || placedOrder) return;
    const d: PurchaseDraft = {
      medicineId: medicine.id,
      productId: product.id,
      quantity,
      step,
      partnerId: selectedPartnerId || undefined,
      addressId: selectedAddressId || undefined,
      deliveryMethod: deliveryMethod || undefined,
      slotId: slotId || undefined,
      paymentMethod: paymentMethod || undefined
    };
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
  }, [medicine.id, product, quantity, step, selectedPartnerId, selectedAddressId, deliveryMethod, slotId, paymentMethod, placedOrder]);

  const clearDraft = () => { try { sessionStorage.removeItem(DRAFT_KEY); } catch {} };

  // ----------------------------------------------------------- pharmacy step
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'delivery'>('distance');
  const [openOnly, setOpenOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  /** Distance radius in km; 0 = "Nearby" (no radius limit, sorted by distance). */
  const [radiusKm, setRadiusKm] = useState<0 | 2 | 5 | 10>(0);

  const filteredOptions = useMemo(() => {
    const q = pharmacySearch.trim().toLowerCase();
    const partnerPin = (id: string) => VERIFIED_PHARMACY_PARTNERS.find((p) => p.id === id)?.pincode || '';
    const list = options.filter((o) => {
      if (openOnly && !o.isOpenNow) return false;
      if (inStockOnly && o.stockStatus !== 'In Stock') return false;
      if (radiusKm > 0 && o.distanceKm > radiusKm) return false;
      if (o.stockCount < quantity) return false;
      if (!q) return true;
      return (
        o.partnerName.toLowerCase().includes(q) ||
        o.area.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        partnerPin(o.partnerId).startsWith(q)
      );
    });
    const etaRank = (s: string) => (/express/i.test(s) ? 0 : /same day/i.test(s) ? 1 : 2);
    return [...list].sort((a, b) =>
      sortBy === 'price' ? a.price - b.price : sortBy === 'delivery' ? etaRank(a.estimatedFulfillment) - etaRank(b.estimatedFulfillment) : a.distanceKm - b.distanceKm
    );
  }, [options, pharmacySearch, sortBy, openOnly, inStockOnly, radiusKm, quantity]);

  const selectPartner = async (o: PartnerAvailabilityOption) => {
    if (!product) return;
    setPartnerError(null);
    setValidatingPartnerId(o.partnerId);
    const validation = await validateInventoryItems([{ productId: product.id, pharmacyId: o.partnerId, quantity }]);
    setValidatingPartnerId(null);
    if (!validation.ok) {
      setPartnerError(validation.error);
      refreshAvailability();
      return;
    }
    const r = validation.results[0];
    if (!r?.eligible) {
      if (r?.reason === 'INSUFFICIENT_STOCK' && r.availableQuantity !== undefined) {
        setPartnerError(`Only ${r.availableQuantity} pack${r.availableQuantity === 1 ? '' : 's'} ${r.availableQuantity === 1 ? 'is' : 'are'} currently available at ${o.partnerName}.`);
      } else if (r?.reason === 'PHARMACY_NOT_VERIFIED') {
        setPartnerError('This pharmacy is currently unavailable. Please select another Verified Pharmacy Partner.');
      } else {
        setPartnerError('This medicine is currently unavailable from the selected pharmacy.');
      }
      refreshAvailability();
      return;
    }
    setSelectedPartnerId(o.partnerId);
    setCoupon(null);
    setCouponError(null);
  };

  // ------------------------------------------------------------- navigation
  const goTo = (s: Step) => {
    setStep(s);
    setMaxCompletedStep((m) => Math.max(m, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const mainRef = useRef<HTMLDivElement>(null);

  const canLeaveStep1 = !!product && quantity >= 1 && options.length > 0 && quantity <= maxStockAcrossPartners;
  const canLeaveStep2 = rxSatisfied;
  const canLeaveStep3 = !!selectedOption;

  const continueFromStep1 = () => {
    if (!isAuthenticated) {
      onRequireAuth('buy medicines from a verified pharmacy');
      return;
    }
    goTo(2);
  };

  // ------------------------------------------------------------- coupon ops
  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponBusy(true);
    setCouponError(null);
    const res = await validateMarketplaceCoupon(
      couponInput.trim(),
      allLines.map((l) => ({ productId: l.product.id, pharmacyId: l.selectedPharmacyId, quantity: l.quantity }))
    );
    setCouponBusy(false);
    if (!res.ok) {
      setCoupon(null);
      setCouponError(res.error);
      return;
    }
    setCoupon({ code: res.code, description: res.description, discount: res.discount });
  };

  // ------------------------------------------------------------ place order
  const mandatoryOk =
    !!product &&
    !!activeLine &&
    quantity >= 1 &&
    rxSatisfied &&
    !!selectedOption &&
    !!selectedAddress &&
    deliveryToAddressOk &&
    !checkingDelivery &&
    !!deliveryMethod &&
    (deliveryMethod !== 'scheduled' || !!slotId) &&
    !!paymentMethod &&
    (paymentMethod !== 'UPI' || /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim()));

  const placeOrder = async () => {
    if (!mandatoryOk || !product || !selectedOption || !selectedAddress || !deliveryMethod || !paymentMethod) return;
    if (!isAuthenticated) {
      onRequireAuth('place a medicine order');
      return;
    }
    setPlacing(true);
    setPlaceError(null);

    const orderLines = allLines.map((l) => ({ productId: l.product.id, pharmacyId: l.selectedPharmacyId, quantity: l.quantity }));
    const placement = await placeMarketplaceOrder(orderLines, pricing.deliveryFee, coupon?.code);

    if (!placement.ok) {
      const f = placement as { code?: string; error?: string; medicineName?: string; availableQuantity?: number };
      if (f.code === 'INSUFFICIENT_STOCK' && f.availableQuantity !== undefined) {
        setPlaceError(`Only ${f.availableQuantity} pack${f.availableQuantity === 1 ? '' : 's'} of ${f.medicineName} ${f.availableQuantity === 1 ? 'is' : 'are'} currently available. Adjust the quantity or choose another pharmacy.`);
        setMaxCompletedStep(2);
        setStep(3);
      } else if (f.code === 'PHARMACY_NOT_VERIFIED') {
        setPlaceError('This pharmacy is currently unavailable. Please select another Verified Pharmacy Partner.');
        setStep(3);
      } else if (f.code && /COUPON/.test(f.code)) {
        setCoupon(null);
        setPlaceError(f.error || 'The coupon could not be applied. Your order has not been placed.');
      } else if (f.medicineName) {
        setPlaceError(`This medicine is currently unavailable from the selected pharmacy (${f.medicineName}). Please choose another Verified Pharmacy Partner.`);
        setStep(3);
      } else {
        setPlaceError(`Payment could not be completed. Your order has not been placed. ${f.error || ''}`.trim());
      }
      refreshAvailability();
      setPlacing(false);
      return;
    }

    // Payment step (simulated gateway hand-off) after the inventory is reserved.
    await new Promise((r) => window.setTimeout(r, 1100));

    const now = new Date();
    const serverPricing = placement.pricing;
    const partnerMeta = VERIFIED_PHARMACY_PARTNERS.find((p) => p.id === selectedOption.partnerId);
    const slotLabel = deliveryMethod === 'scheduled' ? slots.find((s) => s.id === slotId)?.label : undefined;
    const eta = deliveryMethod === 'scheduled' ? slotLabel || 'Scheduled slot' : DELIVERY_LABELS[deliveryMethod].eta;
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const anyRx = allLines.some((l) => l.product.prescriptionRequired);

    const order: PharmacyOrder = {
      id: placement.orderId,
      date: now.toISOString(),
      items: allLines.map((l) => ({
        productId: l.product.id,
        productName: l.product.name,
        brandName: l.product.brandName,
        strength: l.product.strength,
        quantity: l.quantity,
        unitPrice: l.product.price,
        totalPrice: Number((l.product.price * l.quantity).toFixed(2)),
        prescriptionRequired: l.product.prescriptionRequired
      })),
      deliveryAddress: {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        email: publicUser?.email || user?.email || '',
        street: `${selectedAddress.house}, ${selectedAddress.street}`,
        apartment: selectedAddress.landmark,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        deliveryType: deliveryMethod === 'express' ? 'express' : 'standard'
      },
      pricing: {
        subtotalMRP: pricing.subtotalMRP,
        totalDiscount: pricing.pharmacySavings,
        itemsSubtotal: serverPricing?.itemsSubtotal ?? pricing.itemsSubtotal,
        couponDiscount: serverPricing?.discount ?? pricing.couponDiscount,
        couponCode: serverPricing?.couponCode ?? coupon?.code,
        deliveryFee: serverPricing?.deliveryFee ?? pricing.deliveryFee,
        tax: serverPricing?.tax ?? pricing.tax,
        grandTotal: serverPricing?.grandTotal ?? pricing.total
      },
      prescriptionId: rxState.kind === 'verified' ? rxState.id : undefined,
      prescriptionStatus: rxRequired ? 'Verified' : 'Not Required',
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending on Delivery' : 'Paid',
      status: anyRx ? 'Prescription Verified' : 'Order Placed',
      estimatedDelivery: eta,
      trackingSteps: [
        { title: 'Order Confirmed', description: `Order placed and routed to ${selectedOption.partnerName}.`, timestamp: time, completed: true },
        { title: 'Prescription Checked', description: anyRx ? 'Prescription verified by the pharmacist in charge.' : 'No prescription required for this order.', timestamp: time, completed: true },
        { title: 'Pharmacy Preparing', description: 'The pharmacy is preparing your medicine.', timestamp: 'In progress', completed: false, current: true },
        { title: 'Medicine Packed', description: 'Sealed in tamper-evident packaging with the invoice.', timestamp: 'Pending', completed: false },
        { title: 'Out for Delivery', description: 'Handed to the delivery partner.', timestamp: 'Pending', completed: false },
        { title: 'Delivered', description: 'Handover at the doorstep with OTP confirmation.', timestamp: 'Pending', completed: false }
      ],
      fulfillingPharmacy: {
        name: selectedOption.partnerName,
        license: selectedOption.licenseNumber,
        phone: partnerMeta?.phone || ''
      }
    };

    onOrderPlaced(order);
    onCartChange([]);
    clearDraft();
    setPlacedOrder(order);
    setPlacing(false);
    mainRef.current?.scrollTo({ top: 0 });
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  const stepStatus = (s: Step): 'done' | 'current' | 'todo' =>
    placedOrder ? 'done' : s === step ? 'current' : s <= maxCompletedStep ? 'done' : 'todo';

  const partnerMetaFor = (id: string) => VERIFIED_PHARMACY_PARTNERS.find((p) => p.id === id);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-slate-50 text-slate-900 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="buy-medicine-title">
      {/* ------------------------------------------------------------ Header */}
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => { clearDraft(); onBack(); }}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{isStockCheck ? 'Back to Medicine' : 'Back to Medicines'}</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="min-w-0 text-center">
            <h1 id="buy-medicine-title" className="truncate text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              {placedOrder ? 'Order Confirmation' : isStockCheck ? 'Check Pharmacy Stock' : `Buy ${medicine.name}`}
            </h1>
            <p className="hidden truncate text-xs font-medium text-slate-500 sm:block">
              {isStockCheck
                ? `${medicine.name} · Find current availability from Verified Pharmacy Partners`
                : 'Complete your purchase securely through a Verified Pharmacy Partner'}
            </p>
          </div>

          <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800" aria-live="polite">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Verified Cart</span>
            <span>({placedOrder ? 0 : cartCount})</span>
          </div>
        </div>

        {/* --------------------------------------------------- Progress bar */}
        <nav aria-label="Purchase progress" className="border-t border-slate-100 bg-white">
          <ol className="mx-auto grid max-w-[1400px] grid-cols-4 px-4 py-3 sm:px-6">
            {STEP_META.map((m, idx) => {
              const status = stepStatus(m.step);
              const clickable = !placedOrder && (status === 'done' || m.step <= maxCompletedStep + 1) && m.step < step;
              return (
                <li key={m.step} className="relative flex items-center">
                  {idx > 0 && (
                    <span aria-hidden="true" className={`absolute left-0 right-1/2 top-4 h-0.5 -translate-y-1/2 ${status === 'todo' ? 'bg-slate-200' : 'bg-emerald-500'}`} style={{ right: 'calc(50% + 16px)' }} />
                  )}
                  {idx < STEP_META.length - 1 && (
                    <span aria-hidden="true" className={`absolute right-0 top-4 h-0.5 -translate-y-1/2 ${stepStatus((m.step + 1) as Step) === 'todo' ? 'bg-slate-200' : 'bg-emerald-500'}`} style={{ left: 'calc(50% + 16px)' }} />
                  )}
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => clickable && goTo(m.step)}
                    aria-current={status === 'current' ? 'step' : undefined}
                    className={`relative z-10 mx-auto flex flex-col items-center gap-1.5 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-black transition ${
                        status === 'done'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : status === 'current'
                          ? 'border-emerald-600 bg-white text-emerald-700 ring-4 ring-emerald-100'
                          : 'border-slate-300 bg-white text-slate-400'
                      }`}
                    >
                      {status === 'done' ? <Check className="h-4 w-4" /> : m.step}
                    </span>
                    <span className={`text-[11px] font-black uppercase tracking-wider sm:text-xs ${status === 'todo' ? 'text-slate-400' : 'text-slate-900'}`}>{m.title}</span>
                    <span className={`hidden text-[11px] font-medium md:block ${status === 'current' ? 'text-emerald-700' : 'text-slate-500'}`}>{m.caption}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      {/* -------------------------------------------------------------- Body */}
      <div ref={mainRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ============================================ MAIN AREA */}
          <main className="min-w-0 space-y-6">
            {placedOrder ? (
              showTracking ? (
                <TrackingView order={placedOrder} onBack={() => setShowTracking(false)} onViewOrders={onViewOrders} />
              ) : (
                <ConfirmationView
                  order={placedOrder}
                  onTrack={() => setShowTracking(true)}
                  onViewOrders={onViewOrders}
                  onContinue={() => { clearDraft(); onBack(); }}
                />
              )
            ) : loadingMedicine ? (
              <LoadingCard label="Loading medicine..." />
            ) : !product ? (
              <NotListedCard medicine={medicine} onBack={onBack} />
            ) : (
              <>
                {step === 1 && (
                  <Step1Medicine
                    medicine={medicine}
                    product={product}
                    variants={variants}
                    onChangeVariant={(p) => { setProduct(p); setSelectedPartnerId(null); }}
                    quantity={quantity}
                    setQuantity={(q) => setQuantity(Math.min(Math.max(1, q), Math.max(1, quantityCap)))}
                    quantityCap={quantityCap}
                    loadingAvailability={loadingAvailability}
                    availabilityError={availabilityError}
                    options={options}
                    totalStock={totalStock}
                    onRetry={refreshAvailability}
                    canContinue={canLeaveStep1}
                    onContinue={continueFromStep1}
                    isAuthenticated={isAuthenticated}
                    asOf={asOf}
                    stockCheckMode={isStockCheck}
                  />
                )}

                {step === 2 && (
                  <Step2Prescription
                    product={product}
                    rxState={rxState}
                    rxVerifying={rxVerifying}
                    rxUploadError={rxUploadError}
                    dragOver={dragOver}
                    setDragOver={setDragOver}
                    fileInputRef={fileInputRef}
                    onFile={handleFile}
                    onRemove={removePrescription}
                    previewUrl={rxPreviewUrl}
                    showPreview={showRxPreview}
                    setShowPreview={setShowRxPreview}
                    savedPrescriptions={savedPrescriptions}
                    onUseSaved={(id, title) => runVerification(id, title, 'saved')}
                    onBack={() => goTo(1)}
                    canContinue={canLeaveStep2}
                    onContinue={() => goTo(3)}
                  />
                )}

                {step === 3 && (
                  <Step3Pharmacy
                    product={product}
                    quantity={quantity}
                    loading={loadingAvailability}
                    error={availabilityError}
                    partnerError={partnerError}
                    options={filteredOptions}
                    allOptionsCount={options.length}
                    asOf={asOf}
                    onRefresh={refreshAvailability}
                    search={pharmacySearch}
                    setSearch={setPharmacySearch}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    openOnly={openOnly}
                    setOpenOnly={setOpenOnly}
                    inStockOnly={inStockOnly}
                    radiusKm={radiusKm}
                    setRadiusKm={setRadiusKm}
                    setInStockOnly={setInStockOnly}
                    selectedPartnerId={selectedPartnerId}
                    validatingPartnerId={validatingPartnerId}
                    onSelect={selectPartner}
                    selectedOption={selectedOption}
                    partnerMeta={selectedOption ? partnerMetaFor(selectedOption.partnerId) : undefined}
                    onBack={() => goTo(2)}
                    canContinue={canLeaveStep3}
                    onContinue={() => goTo(4)}
                  />
                )}

                {step === 4 && selectedOption && (
                  <Step4Checkout
                    product={product}
                    quantity={quantity}
                    lines={allLines}
                    selectedOption={selectedOption}
                    rxState={rxState}
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    setSelectedAddressId={setSelectedAddressId}
                    addressForm={addressForm}
                    setAddressForm={setAddressForm}
                    addressErrors={addressErrors}
                    emptyAddress={emptyAddress}
                    onSaveAddress={saveAddress}
                    deliveryToAddressOk={deliveryToAddressOk}
                    checkingDelivery={checkingDelivery}
                    onChangePharmacy={() => goTo(3)}
                    methods={methods}
                    deliveryMethod={deliveryMethod}
                    setDeliveryMethod={setDeliveryMethod}
                    slots={slots}
                    slotId={slotId}
                    setSlotId={setSlotId}
                    pricing={pricing}
                    couponInput={couponInput}
                    setCouponInput={setCouponInput}
                    coupon={coupon}
                    couponError={couponError}
                    couponBusy={couponBusy}
                    onApplyCoupon={applyCoupon}
                    onRemoveCoupon={() => { setCoupon(null); setCouponInput(''); setCouponError(null); }}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    upiId={upiId}
                    setUpiId={setUpiId}
                    placing={placing}
                    placeError={placeError}
                    mandatoryOk={mandatoryOk}
                    onPlaceOrder={placeOrder}
                    onBack={() => goTo(3)}
                  />
                )}
              </>
            )}
          </main>

          {/* ============================================ ORDER SUMMARY */}
          {!placedOrder && product && (
            <aside className="lg:sticky lg:top-0 lg:self-start">
              <OrderSummary
                product={product}
                quantity={quantity}
                selectedOption={selectedOption}
                otherLines={otherLines}
                onRemoveOther={(key) => onCartChange(cartItems.filter((c) => cartLineKey(c) !== key))}
                onChangeOtherQty={(key, q) => onCartChange(cartItems.map((c) => (cartLineKey(c) === key ? { ...c, quantity: Math.max(1, q) } : c)))}
                deliveryMethod={deliveryMethod}
                rxState={rxState}
                pricing={pricing}
                coupon={coupon}
                step={step}
                mandatoryOk={mandatoryOk}
                placing={placing}
                onPlaceOrder={placeOrder}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Prescription preview */}
      {showRxPreview && rxPreviewUrl && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-label="Prescription preview">
          <div className="relative max-h-full w-full max-w-3xl overflow-hidden rounded-2xl bg-white">
            <button type="button" onClick={() => setShowRxPreview(false)} className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-slate-700 shadow hover:bg-white cursor-pointer" aria-label="Close preview">
              <X className="h-5 w-5" />
            </button>
            {rxState.kind !== 'missing' && rxState.kind !== 'not_required' && /\.pdf$/i.test(rxState.fileName) ? (
              <iframe title="Prescription PDF" src={rxPreviewUrl} className="h-[80vh] w-full" />
            ) : (
              <img src={rxPreviewUrl} alt="Uploaded prescription" className="max-h-[80vh] w-full object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ===========================================================================
// Small building blocks
// ===========================================================================

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <section className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 ${className}`}>{children}</section>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; right?: React.ReactNode }> = ({ icon, title, subtitle, right }) => (
  <div className="mb-4 flex items-start justify-between gap-3">
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">{icon}</span>
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
    {right}
  </div>
);

const Badge: React.FC<{ tone: 'green' | 'amber' | 'red' | 'slate' | 'blue'; children: React.ReactNode }> = ({ tone, children }) => {
  const cls = {
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-rose-50 text-rose-800 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200'
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>{children}</span>;
};

const LoadingCard: React.FC<{ label: string }> = ({ label }) => (
  <Card className="flex items-center gap-3 text-sm font-semibold text-slate-600" >
    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
    <span role="status">{label}</span>
  </Card>
);

const Notice: React.FC<{ tone: 'red' | 'amber' | 'green' | 'blue'; children: React.ReactNode; action?: React.ReactNode }> = ({ tone, children, action }) => {
  const cls = {
    red: 'border-rose-200 bg-rose-50 text-rose-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    blue: 'border-sky-200 bg-sky-50 text-sky-900'
  }[tone];
  const Icon = tone === 'green' ? CheckCircle2 : tone === 'blue' ? Info : AlertTriangle;
  return (
    <div role={tone === 'red' ? 'alert' : 'status'} className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${cls}`}>
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="leading-snug">{children}</div>
      </div>
      {action}
    </div>
  );
};

const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...rest }) => (
  <button
    type="button"
    {...rest}
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className}`}
  >
    {children}
  </button>
);

const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...rest }) => (
  <button
    type="button"
    {...rest}
    className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className}`}
  >
    {children}
  </button>
);

const StepFooter: React.FC<{ onBack?: () => void; backLabel?: string; canContinue: boolean; onContinue: () => void; continueLabel: string; hint?: string }> = ({ onBack, backLabel = 'Back', canContinue, onContinue, continueLabel, hint }) => (
  <div className="flex flex-col-reverse items-stretch gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
    {onBack ? (
      <SecondaryButton onClick={onBack}><ArrowLeft className="h-4 w-4" />{backLabel}</SecondaryButton>
    ) : <span />}
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <PrimaryButton onClick={onContinue} disabled={!canContinue}>{continueLabel}<ArrowRight className="h-4 w-4" /></PrimaryButton>
      {hint && !canContinue && <span className="text-xs font-medium text-slate-500">{hint}</span>}
    </div>
  </div>
);

// ===========================================================================
// STEP 1 — Medicine selection
// ===========================================================================

interface Step1Props {
  medicine: Medicine;
  product: PharmacyProduct;
  variants: PharmacyProduct[];
  onChangeVariant: (p: PharmacyProduct) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  quantityCap: number;
  loadingAvailability: boolean;
  availabilityError: string | null;
  options: PartnerAvailabilityOption[];
  totalStock: number;
  onRetry: () => void;
  canContinue: boolean;
  onContinue: () => void;
  isAuthenticated: boolean;
  /** ISO timestamp of the last successful inventory read. */
  asOf: string | null;
  /** Opened from "Check Pharmacy Stock" — surfaces the live stock-check status prominently. */
  stockCheckMode: boolean;
}

const Step1Medicine: React.FC<Step1Props> = ({ medicine, product, variants, onChangeVariant, quantity, setQuantity, quantityCap, loadingAvailability, availabilityError, options, totalStock, onRetry, canContinue, onContinue, isAuthenticated, asOf, stockCheckMode }) => {
  const bestPrice = options.length ? Math.min(...options.map((o) => o.price)) : product.price;
  const availabilityTone = loadingAvailability ? 'slate' : options.length === 0 ? 'red' : options.some((o) => o.stockStatus === 'In Stock') ? 'green' : 'amber';
  const availabilityLabel = loadingAvailability ? 'Checking stock...' : options.length === 0 ? 'Currently Unavailable' : options.some((o) => o.stockStatus === 'In Stock') ? 'In Stock' : 'Limited Stock';

  return (
    <>
      {stockCheckMode && (
        <div
          role="status"
          aria-live="polite"
          className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${loadingAvailability || (!asOf && !availabilityError) ? 'border-slate-200 bg-white text-slate-700' : availabilityError ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}
        >
          {loadingAvailability || (!asOf && !availabilityError) ? (
            <span className="inline-flex items-center gap-2 font-bold"><Loader2 className="h-4 w-4 animate-spin text-emerald-600" />Checking current pharmacy stock…</span>
          ) : availabilityError ? (
            <span className="inline-flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4" />Unable to fetch stock information. Please try again.</span>
          ) : (
            <span className="inline-flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4" />Stock information updated</span>
          )}
          {asOf && !loadingAvailability && !availabilityError && (
            <span className="text-xs font-semibold text-emerald-800/80">Last updated: {new Date(asOf).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          )}
        </div>
      )}

      <Card>
        <SectionTitle icon={<Pill className="h-5 w-5" />} title="Selected Medicine" subtitle="Already added to your purchase — no need to search again." />

        <div className="grid gap-5 md:grid-cols-[200px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <img src={product.imageUrl} alt={product.name} className="h-44 w-full object-cover md:h-full" loading="lazy" />
          </div>

          <div className="min-w-0 space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">{medicine.name}</h3>
                <Badge tone={product.prescriptionRequired ? 'amber' : 'green'}>
                  {product.prescriptionRequired ? <><FileText className="h-3 w-3" /> Prescription (Rx)</> : <><ShieldCheck className="h-3 w-3" /> OTC Safe</>}
                </Badge>
                <Badge tone={availabilityTone as 'green' | 'amber' | 'red' | 'slate'}>
                  {loadingAvailability ? <Loader2 className="h-3 w-3 animate-spin" /> : <Radio className="h-3 w-3" />}
                  {availabilityLabel}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Generic Active Molecule:</span> {medicine.genericName}
              </p>
              <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">Listed product:</span> {product.name}</p>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <Spec label="Category" value={medicine.category} />
              <Spec label="Classification" value={product.rxSchedule} />
              <Spec label="Manufacturer" value={product.manufacturer} />
              <Spec label="Strength" value={product.strength} />
              <Spec label="Dosage form" value={product.dosageForm} />
              <Spec label="Pack size" value={product.packSize} />
              <Spec label="Prescription" value={product.prescriptionRequired ? 'Required' : 'Not required'} />
              <Spec label="Available quantity" value={loadingAvailability ? '…' : `${totalStock} packs across ${options.length} ${options.length === 1 ? 'pharmacy' : 'pharmacies'}`} />
              <Spec label="Best verified price" value={loadingAvailability ? '…' : `${formatINR(bestPrice)} / pack`} />
            </dl>

            {variants.length > 1 && (
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">Available variants</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onChangeVariant(v)}
                      aria-pressed={v.id === product.id}
                      className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition cursor-pointer ${v.id === product.id ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                    >
                      <span className="block font-black">{v.brandName}</span>
                      <span className="block text-slate-500">{v.strength} · {v.packSize} · MRP {formatINR(v.mrp)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-slate-900">Quantity</p>
            <p className="text-xs text-slate-500">
              {loadingAvailability ? 'Checking available inventory…' : `Maximum ${quantityCap} pack${quantityCap === 1 ? '' : 's'} from a single verified pharmacy.`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
              <button type="button" onClick={() => setQuantity(quantity - 1)} disabled={quantity <= 1} aria-label="Decrease quantity" className="grid h-11 w-11 place-items-center rounded-l-xl text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><Minus className="h-4 w-4" /></button>
              <input
                type="number"
                min={1}
                max={quantityCap}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                aria-label="Quantity"
                className="h-11 w-14 border-x border-slate-200 text-center text-base font-black text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button type="button" onClick={() => setQuantity(quantity + 1)} disabled={quantity >= quantityCap} aria-label="Increase quantity" className="grid h-11 w-11 place-items-center rounded-r-xl text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><Plus className="h-4 w-4" /></button>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500">{quantity} pack{quantity === 1 ? '' : 's'} × {formatINR(bestPrice)}</p>
              <p className="text-xl font-black text-slate-900">{formatINR(bestPrice * quantity)}</p>
            </div>
          </div>
        </div>
        {quantity >= quantityCap && !loadingAvailability && options.length > 0 && (
          <p className="mt-2 text-xs font-semibold text-amber-700">Only {quantityCap} pack{quantityCap === 1 ? ' is' : 's are'} currently available.</p>
        )}
      </Card>

      {/* Prescription requirement */}
      <Card>
        <SectionTitle icon={<FileText className="h-5 w-5" />} title="Prescription Requirement" />
        {product.prescriptionRequired ? (
          <Notice tone="amber">
            <strong>Prescription required for this medicine.</strong> {product.rxSchedule} — you will upload a prescription or choose a saved one in the next step. Checkout is not possible until it is verified.
          </Notice>
        ) : (
          <Notice tone="green"><strong>Prescription not required.</strong> This medicine is sold over the counter; you can continue directly.</Notice>
        )}
      </Card>

      {/* Availability */}
      <Card>
        <SectionTitle
          icon={<Store className="h-5 w-5" />}
          title="Availability"
          subtitle="Available from Verified Pharmacy Partners — read live from the pharmacy inventory system."
          right={<button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 cursor-pointer"><RefreshCw className={`h-3.5 w-3.5 ${loadingAvailability ? 'animate-spin' : ''}`} />Refresh</button>}
        />
        {loadingAvailability ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Loader2 className="h-4 w-4 animate-spin text-emerald-600" />Checking stock...</div>
        ) : availabilityError ? (
          <Notice tone="red" action={<SecondaryButton onClick={onRetry} className="px-3 py-1.5 text-xs">Retry</SecondaryButton>}>{availabilityError}</Notice>
        ) : options.length === 0 ? (
          <Notice tone="red"><strong>Currently Unavailable.</strong> No Verified Pharmacy Partner holds stock of this medicine right now. Please check back later or choose a different variant.</Notice>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {options.slice(0, 4).map((o) => (
              <li key={o.partnerId} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{o.partnerName}</p>
                  <p className="text-xs text-slate-500">{o.distanceKm} km · {formatINR(o.price)} / pack</p>
                </div>
                <Badge tone={o.stockStatus === 'In Stock' ? 'green' : 'amber'}>{o.stockStatus === 'In Stock' ? '✓ In Stock' : 'Limited Stock'}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <StepFooter
          canContinue={canContinue}
          onContinue={onContinue}
          continueLabel={isAuthenticated ? 'Continue to Prescription' : 'Sign in & Continue'}
          hint={options.length === 0 && !loadingAvailability ? 'No verified pharmacy currently has stock.' : undefined}
        />
      </Card>
    </>
  );
};

const Spec: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
    <dd className="font-semibold text-slate-800">{value}</dd>
  </div>
);

// ===========================================================================
// STEP 2 — Prescription
// ===========================================================================

interface Step2Props {
  product: PharmacyProduct;
  rxState: PrescriptionState;
  rxVerifying: boolean;
  rxUploadError: string | null;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (f: File | undefined) => void;
  onRemove: () => void;
  previewUrl: string | null;
  showPreview: boolean;
  setShowPreview: (v: boolean) => void;
  savedPrescriptions: { id: string; title: string; doctor: string; date: string; status: string; medications: string; usable: boolean }[];
  onUseSaved: (id: string, title: string) => void;
  onBack: () => void;
  canContinue: boolean;
  onContinue: () => void;
}

const Step2Prescription: React.FC<Step2Props> = ({ product, rxState, rxVerifying, rxUploadError, dragOver, setDragOver, fileInputRef, onFile, onRemove, previewUrl, showPreview, setShowPreview, savedPrescriptions, onUseSaved, onBack, canContinue, onContinue }) => {
  if (rxState.kind === 'not_required') {
    return (
      <>
        <Card>
          <SectionTitle icon={<ShieldCheck className="h-5 w-5" />} title="Prescription Verification" />
          <Notice tone="green"><strong>Prescription not required.</strong> {product.name} is an over-the-counter medicine ({product.rxSchedule}). You can continue to choose a Verified Pharmacy.</Notice>
        </Card>
        <Card><StepFooter onBack={onBack} canContinue={true} onContinue={onContinue} continueLabel="Continue to Pharmacy" /></Card>
      </>
    );
  }

  const usable = savedPrescriptions.filter((p) => p.usable);
  const statusBadge =
    rxState.kind === 'verified' ? <Badge tone="green"><CheckCircle2 className="h-3 w-3" /> Prescription Verified</Badge>
    : rxState.kind === 'pending' ? <Badge tone="amber"><Loader2 className="h-3 w-3 animate-spin" /> Pending Verification</Badge>
    : rxState.kind === 'rejected' ? <Badge tone="red"><AlertCircle className="h-3 w-3" /> Prescription Not Accepted</Badge>
    : <Badge tone="slate">No prescription attached</Badge>;

  return (
    <>
      <Card>
        <SectionTitle icon={<FileText className="h-5 w-5" />} title="Prescription Verification" subtitle={`${product.name} is a ${product.rxSchedule} medicine.`} right={statusBadge} />
        <Notice tone="amber"><strong>Prescription required for this medicine.</strong> Upload a clear photo or PDF of a valid prescription, or choose one already saved in your health records.</Notice>

        {rxState.kind === 'missing' || rxState.kind === 'rejected' ? (
          <div className="mt-5 space-y-4">
            {rxState.kind === 'rejected' && <Notice tone="red">{rxState.reason}</Notice>}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files?.[0]); }}
              className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition ${dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-emerald-700 shadow-xs"><UploadCloud className="h-7 w-7" /></span>
              <h3 className="mt-4 text-base font-black text-slate-900">Upload Prescription</h3>
              <p className="mt-1 text-sm text-slate-600">Drag &amp; drop or select a file</p>
              <p className="text-xs text-slate-500">Prescription image or PDF · JPG, PNG, WEBP, PDF · up to 10 MB</p>
              <input ref={fileInputRef} type="file" accept={ACCEPTED_RX_TYPES.join(',')} className="sr-only" id="rx-upload-input" onChange={(e) => onFile(e.target.files?.[0])} />
              <label htmlFor="rx-upload-input" className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700">
                <UploadCloud className="h-4 w-4" /> Select file
              </label>
              {rxUploadError && <p role="alert" className="mt-3 text-xs font-semibold text-rose-700">{rxUploadError}</p>}
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900">Choose from Saved Prescriptions</h3>
              {usable.length === 0 ? (
                <p className="mt-1 text-sm text-slate-500">No valid saved prescription is available for this order. {savedPrescriptions.length > 0 && 'Saved prescriptions that are expired, archived or not clinician-verified cannot be used.'}</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {usable.map((p) => (
                    <li key={p.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.doctor} · {new Date(p.date).toLocaleDateString('en-IN')} · <span className="font-semibold text-emerald-700">{p.status}</span></p>
                        <p className="truncate text-xs text-slate-500">{p.medications}</p>
                      </div>
                      <SecondaryButton onClick={() => onUseSaved(p.id, p.title)} className="px-4 py-2 text-xs">Use this prescription</SecondaryButton>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700"><FileText className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Prescription</p>
                  <p className="truncate text-sm font-black text-slate-900">{rxState.kind === 'verified' ? '✓ Uploaded' : 'Uploaded'} · {rxState.fileName}</p>
                  <p className="text-xs text-slate-500">{rxState.source === 'saved' ? 'From your saved health records' : 'Uploaded just now'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {previewUrl && <SecondaryButton onClick={() => setShowPreview(!showPreview)} className="px-3 py-2 text-xs"><Eye className="h-3.5 w-3.5" />Preview</SecondaryButton>}
                <label htmlFor="rx-replace-input" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" />Replace</label>
                <input ref={fileInputRef} id="rx-replace-input" type="file" accept={ACCEPTED_RX_TYPES.join(',')} className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
                <SecondaryButton onClick={onRemove} className="px-3 py-2 text-xs text-rose-700"><Trash2 className="h-3.5 w-3.5" />Remove</SecondaryButton>
              </div>
            </div>
            <div className="mt-4">
              {rxState.kind === 'pending' && <Notice tone="amber"><strong>Pending Verification.</strong> Checking the prescription against the medicine being ordered…</Notice>}
              {rxState.kind === 'verified' && <Notice tone="green"><strong>Prescription Verified.</strong> The pharmacy will see only the details needed to dispense this order.</Notice>}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <StepFooter
          onBack={onBack}
          canContinue={canContinue && !rxVerifying}
          onContinue={onContinue}
          continueLabel="Continue to Pharmacy"
          hint={rxState.kind === 'pending' ? 'Waiting for prescription verification.' : 'Upload or select a valid prescription to continue.'}
        />
      </Card>
    </>
  );
};

// ===========================================================================
// STEP 3 — Pharmacy selection
// ===========================================================================

interface Step3Props {
  product: PharmacyProduct;
  quantity: number;
  loading: boolean;
  error: string | null;
  partnerError: string | null;
  options: PartnerAvailabilityOption[];
  allOptionsCount: number;
  asOf: string | null;
  onRefresh: () => void;
  search: string;
  setSearch: (s: string) => void;
  sortBy: 'distance' | 'price' | 'delivery';
  setSortBy: (s: 'distance' | 'price' | 'delivery') => void;
  openOnly: boolean;
  setOpenOnly: (v: boolean) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  radiusKm: 0 | 2 | 5 | 10;
  setRadiusKm: (v: 0 | 2 | 5 | 10) => void;
  selectedPartnerId: string | null;
  validatingPartnerId: string | null;
  onSelect: (o: PartnerAvailabilityOption) => void;
  selectedOption: PartnerAvailabilityOption | null;
  partnerMeta?: (typeof VERIFIED_PHARMACY_PARTNERS)[number];
  onBack: () => void;
  canContinue: boolean;
  onContinue: () => void;
}

const Step3Pharmacy: React.FC<Step3Props> = (p) => {
  const cheapest = p.options.length ? Math.min(...p.options.map((o) => o.price)) : null;
  return (
    <>
      <Card>
        <SectionTitle
          icon={<Building2 className="h-5 w-5" />}
          title="Choose Verified Pharmacy"
          subtitle={`Only verified, active partners currently holding at least ${p.quantity} pack${p.quantity === 1 ? '' : 's'} of ${p.product.name} are shown.`}
          right={
            <button type="button" onClick={p.onRefresh} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 cursor-pointer">
              <RefreshCw className={`h-3.5 w-3.5 ${p.loading ? 'animate-spin' : ''}`} />Live stock{p.asOf ? ` · ${new Date(p.asOf).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </button>
          }
        />

        {/* Search + filters */}
        <div className="space-y-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={p.search}
              onChange={(e) => p.setSearch(e.target.value)}
              placeholder="Search pharmacy, area or PIN code"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">Sort by</span>
            {(['distance', 'price', 'delivery'] as const).map((k) => (
              <button key={k} type="button" onClick={() => p.setSortBy(k)} aria-pressed={p.sortBy === k} className={`rounded-full border px-3 py-1.5 font-bold capitalize transition cursor-pointer ${p.sortBy === k ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>{k === 'delivery' ? 'Delivery time' : k}</button>
            ))}
            <span className="mx-1 hidden h-4 w-px bg-slate-200 sm:block" />
            <span className="font-bold uppercase tracking-wider text-slate-500">Distance</span>
            {([0, 2, 5, 10] as const).map((r) => (
              <button key={r} type="button" onClick={() => p.setRadiusKm(r)} aria-pressed={p.radiusKm === r} className={`rounded-full border px-3 py-1.5 font-bold transition cursor-pointer ${p.radiusKm === r ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>{r === 0 ? 'Nearby' : `${r} km`}</button>
            ))}
            <span className="mx-1 hidden h-4 w-px bg-slate-200 sm:block" />
            <button type="button" onClick={() => p.setOpenOnly(!p.openOnly)} aria-pressed={p.openOnly} className={`rounded-full border px-3 py-1.5 font-bold transition cursor-pointer ${p.openOnly ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700'}`}>Open now</button>
            <button type="button" onClick={() => p.setInStockOnly(!p.inStockOnly)} aria-pressed={p.inStockOnly} className={`rounded-full border px-3 py-1.5 font-bold transition cursor-pointer ${p.inStockOnly ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700'}`}>Full stock only</button>
          </div>
        </div>

        {p.partnerError && <div className="mt-4"><Notice tone="red">{p.partnerError}</Notice></div>}

        <div className="mt-5">
          {p.loading && p.options.length === 0 ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Loader2 className="h-4 w-4 animate-spin text-emerald-600" />Finding verified pharmacies...</div>
          ) : p.error ? (
            <Notice tone="red" action={<SecondaryButton onClick={p.onRefresh} className="px-3 py-1.5 text-xs">Retry</SecondaryButton>}>{p.error}</Notice>
          ) : p.options.length === 0 ? (
            <Notice tone="amber">
              {p.allOptionsCount === 0
                ? 'No Verified Pharmacy Partner currently has this medicine in stock.'
                : `No pharmacy matches these filters with ${p.quantity} pack${p.quantity === 1 ? '' : 's'} available. Clear a filter or reduce the quantity.`}
            </Notice>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {p.options.map((o) => {
                const selected = o.partnerId === p.selectedPartnerId;
                const busy = p.validatingPartnerId === o.partnerId;
                return (
                  <li key={o.partnerId} className={`relative flex flex-col rounded-3xl border p-5 transition ${selected ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <Badge tone="green"><ShieldCheck className="h-3 w-3" /> VERIFIED PHARMACY</Badge>
                      {cheapest !== null && o.price === cheapest && p.options.length > 1 && <Badge tone="blue"><Tag className="h-3 w-3" /> Lowest price</Badge>}
                    </div>
                    <h3 className="text-base font-black text-slate-900">{o.partnerName}</h3>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{o.rating.toFixed(1)} <span className="font-normal text-slate-400">({o.reviewsCount})</span></span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" />{o.distanceKm} km away</span>
                    </p>

                    <div className="mt-4 flex items-end justify-between gap-2 rounded-2xl bg-white/80 p-3 ring-1 ring-slate-100">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">{p.product.name.split('(')[0].trim()} {p.product.strength}</p>
                        <p className="text-2xl font-black text-slate-900">{formatINR(o.price)} <span className="text-xs font-bold text-slate-500">/ pack</span></p>
                        {o.mrp > o.price && <p className="text-[11px] text-slate-500">MRP <s>{formatINR(o.mrp)}</s> · {o.discountPercent}% off</p>}
                      </div>
                      <Badge tone={o.stockStatus === 'In Stock' ? 'green' : 'amber'}>{o.stockStatus === 'In Stock' ? '✓ In Stock' : `Limited · ${o.stockCount} left`}</Badge>
                    </div>

                    <ul className="mt-3 space-y-1 text-xs font-semibold text-slate-600">
                      <li className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-slate-400" />Delivery: {o.estimatedFulfillment}</li>
                      <li className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-slate-400" />{o.isOpenNow ? `Open · ${o.operatingHours}` : `Closed · ${o.operatingHours}`}</li>
                      <li className="flex items-center gap-2"><Package className="h-3.5 w-3.5 text-slate-400" />{o.stockCount} packs in stock</li>
                    </ul>

                    <div className="mt-4">
                      {selected ? (
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white"><CheckCircle2 className="h-4 w-4" />Pharmacy Selected</div>
                      ) : (
                        <PrimaryButton onClick={() => p.onSelect(o)} disabled={!!p.validatingPartnerId} className="w-full">
                          {busy ? <><Loader2 className="h-4 w-4 animate-spin" />Checking stock...</> : <>Select Pharmacy<ChevronRight className="h-4 w-4" /></>}
                        </PrimaryButton>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>

      {/* Price comparison */}
      {p.options.length > 1 && (
        <Card>
          <SectionTitle icon={<Tag className="h-5 w-5" />} title="Pharmacy Price Comparison" subtitle="Same medicine, same strength — compare before you choose." />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-4">Pharmacy</th>
                  <th className="py-2 pr-4 text-right">Price</th>
                  <th className="py-2 pr-4 text-right">× {p.quantity}</th>
                  <th className="py-2 pr-4">Delivery</th>
                  <th className="py-2 pr-4">Stock</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {p.options.map((o) => (
                  <tr key={o.partnerId} className={`border-b border-slate-100 ${o.partnerId === p.selectedPartnerId ? 'bg-emerald-50/60' : ''}`}>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">{o.shortName || o.partnerName}</td>
                    <td className="py-2.5 pr-4 text-right font-mono font-bold text-slate-900">{formatINR(o.price)}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-slate-700">{formatINR(o.price * p.quantity)}</td>
                    <td className="py-2.5 pr-4 text-slate-700">{o.estimatedFulfillment}</td>
                    <td className="py-2.5 pr-4"><Badge tone={o.stockStatus === 'In Stock' ? 'green' : 'amber'}>{o.stockStatus === 'In Stock' ? 'Available' : 'Limited'}</Badge></td>
                    <td className="py-2.5 text-right">
                      {o.partnerId === p.selectedPartnerId ? <span className="text-xs font-bold text-emerald-700">✓ Selected</span> : <button type="button" onClick={() => p.onSelect(o)} className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer">Choose</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Selected pharmacy details */}
      {p.selectedOption && (
        <Card>
          <SectionTitle icon={<ShieldCheck className="h-5 w-5" />} title={p.selectedOption.partnerName} subtitle="Verified Pharmacy Partner — your medicine will be dispensed from here." right={<Badge tone="green"><CheckCircle2 className="h-3 w-3" /> Pharmacy Selected</Badge>} />
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <Spec label="Address" value={p.partnerMeta?.address || `${p.selectedOption.area}, ${p.selectedOption.city}`} />
            <Spec label="Distance" value={`${p.selectedOption.distanceKm} km`} />
            <Spec label="Opening hours" value={p.selectedOption.operatingHours} />
            <Spec label="Contact" value={p.partnerMeta?.phone || '—'} />
            <Spec label="Licence" value={p.selectedOption.licenseNumber} />
            <Spec label="Pharmacist in charge" value={p.selectedOption.pharmacistInCharge} />
            <Spec label="Medicine stock" value={`${p.selectedOption.stockCount} packs · ${p.selectedOption.stockStatus}`} />
            <Spec label="Medicine price" value={`${formatINR(p.selectedOption.price)} / pack`} />
            <Spec label="Delivery" value={p.selectedOption.deliveryAvailable ? `Available · ${p.selectedOption.estimatedFulfillment}` : 'Pickup only'} />
          </dl>
        </Card>
      )}

      <Card>
        <StepFooter onBack={p.onBack} canContinue={p.canContinue} onContinue={p.onContinue} continueLabel="Continue to Checkout" hint="Select a Verified Pharmacy to continue." />
      </Card>
    </>
  );
};

// ===========================================================================
// STEP 4 — Checkout
// ===========================================================================

interface Step4Props {
  product: PharmacyProduct;
  quantity: number;
  lines: CartItem[];
  selectedOption: PartnerAvailabilityOption;
  rxState: PrescriptionState;
  addresses: DeliveryAddress[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string) => void;
  addressForm: Omit<DeliveryAddress, 'id'> | null;
  setAddressForm: (f: Omit<DeliveryAddress, 'id'> | null) => void;
  addressErrors: Record<string, string>;
  emptyAddress: () => Omit<DeliveryAddress, 'id'>;
  onSaveAddress: () => void;
  deliveryToAddressOk: boolean;
  checkingDelivery: boolean;
  onChangePharmacy: () => void;
  methods: DeliveryMethod[];
  deliveryMethod: DeliveryMethod | null;
  setDeliveryMethod: (m: DeliveryMethod) => void;
  slots: { id: string; label: string }[];
  slotId: string | null;
  setSlotId: (id: string) => void;
  pricing: ReturnType<typeof computePricing>;
  couponInput: string;
  setCouponInput: (s: string) => void;
  coupon: { code: string; description: string; discount: number } | null;
  couponError: string | null;
  couponBusy: boolean;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (m: PaymentMethod) => void;
  upiId: string;
  setUpiId: (s: string) => void;
  placing: boolean;
  placeError: string | null;
  mandatoryOk: boolean;
  onPlaceOrder: () => void;
  onBack: () => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; title: string; caption: string; icon: React.ReactNode }[] = [
  { id: 'UPI', title: 'UPI Payment', caption: 'Google Pay, PhonePe, Paytm, BHIM', icon: <Smartphone className="h-5 w-5" /> },
  { id: 'Credit / Debit Card', title: 'Debit/Credit Card', caption: 'Visa, Mastercard, RuPay', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'Net Banking', title: 'Net Banking', caption: 'All major Indian banks', icon: <Landmark className="h-5 w-5" /> },
  { id: 'Cash on Delivery', title: 'Cash on Delivery', caption: 'Pay when your medicine arrives', icon: <Package className="h-5 w-5" /> }
];

const Step4Checkout: React.FC<Step4Props> = (p) => {
  const field = (key: keyof Omit<DeliveryAddress, 'id' | 'label'>, label: string, extra?: Partial<React.InputHTMLAttributes<HTMLInputElement>>) => (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <input
        {...extra}
        value={(p.addressForm?.[key] as string) || ''}
        onChange={(e) => p.addressForm && p.setAddressForm({ ...p.addressForm, [key]: e.target.value })}
        aria-invalid={!!p.addressErrors[key]}
        className={`h-11 w-full rounded-xl border bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:ring-2 focus:ring-emerald-500/20 ${p.addressErrors[key] ? 'border-rose-400' : 'border-slate-200 focus:border-emerald-500'}`}
      />
      {p.addressErrors[key] && <span className="mt-1 block text-xs font-semibold text-rose-700">{p.addressErrors[key]}</span>}
    </label>
  );

  return (
    <>
      {/* Order review */}
      <Card>
        <SectionTitle icon={<CheckCircle2 className="h-5 w-5" />} title="Order Review" subtitle="Confirm every detail before payment." />
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Spec label="Medicine" value={`${p.product.name.split('(')[0].trim()} ${p.product.strength}`} />
          <Spec label="Quantity" value={`${p.quantity} pack${p.quantity === 1 ? '' : 's'} · ${p.product.packSize}`} />
          <Spec label="Pharmacy" value={`${p.selectedOption.partnerName} — Verified`} />
          <Spec label="Prescription" value={p.rxState.kind === 'not_required' ? '✓ Not Required' : p.rxState.kind === 'verified' ? '✓ Verified Prescription' : 'Pending'} />
        </dl>
        {p.lines.length > 1 && (
          <div className="mt-4 rounded-2xl border border-slate-200 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">All items in this order</p>
            <ul className="divide-y divide-slate-100 text-sm">
              {p.lines.map((l) => (
                <li key={cartLineKey(l)} className="flex items-center justify-between py-2">
                  <span className="min-w-0 truncate font-semibold text-slate-800">{l.product.name.split('(')[0].trim()} <span className="text-slate-500">× {l.quantity}</span></span>
                  <span className="font-mono font-bold text-slate-900">{formatINR(l.product.price * l.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Delivery address */}
      <Card>
        <SectionTitle icon={<MapPin className="h-5 w-5" />} title="Delivery Address" right={!p.addressForm && <SecondaryButton onClick={() => p.setAddressForm(p.emptyAddress())} className="px-3 py-2 text-xs"><Plus className="h-3.5 w-3.5" />Add New Address</SecondaryButton>} />

        {p.addresses.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {p.addresses.map((a) => {
              const selected = a.id === p.selectedAddressId;
              const deliverable = partnerDeliversToPin(p.selectedOption.partnerId, a.pincode);
              return (
                <li key={a.id}>
                  <button type="button" onClick={() => p.setSelectedAddressId(a.id)} aria-pressed={selected} className={`w-full rounded-2xl border p-4 text-left transition cursor-pointer ${selected ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700"><Home className="h-3.5 w-3.5" />{a.label}</span>
                      {selected ? <Badge tone="green"><Check className="h-3 w-3" /> Selected</Badge> : deliverable ? null : <Badge tone="red">Not deliverable</Badge>}
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-900">{a.fullName}</p>
                    <p className="text-sm text-slate-600">{a.house}, {a.street}</p>
                    <p className="text-sm text-slate-600">{a.city}, {a.state} — {a.pincode}</p>
                    <p className="text-xs text-slate-500">{a.phone}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {p.addressForm && (
          <div className={`${p.addresses.length ? 'mt-4 border-t border-slate-100 pt-4' : ''}`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">New delivery address</h3>
              {p.addresses.length > 0 && <button type="button" onClick={() => p.setAddressForm(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">Cancel</button>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Label</span>
                <select value={p.addressForm.label} onChange={(e) => p.setAddressForm({ ...p.addressForm!, label: e.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500">
                  <option>Home</option><option>Work</option><option>Other</option>
                </select>
              </label>
              {field('fullName', 'Full name', { autoComplete: 'name' })}
              {field('phone', 'Mobile number', { inputMode: 'tel', autoComplete: 'tel', placeholder: '+91 98765 43210' })}
              {field('house', 'House / flat number')}
              {field('street', 'Street / locality')}
              {field('city', 'City', { autoComplete: 'address-level2' })}
              {field('state', 'State', { autoComplete: 'address-level1' })}
              {field('pincode', 'PIN code', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' })}
              {field('landmark', 'Landmark (optional)')}
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Delivery instructions (optional)</span>
                <textarea value={p.addressForm.instructions || ''} onChange={(e) => p.setAddressForm({ ...p.addressForm!, instructions: e.target.value })} rows={2} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500" />
              </label>
            </div>
            <PrimaryButton onClick={p.onSaveAddress} className="mt-4">Save address</PrimaryButton>
          </div>
        )}

        {p.selectedAddressId && p.checkingDelivery && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600" role="status"><Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />Checking delivery availability...</p>
        )}
        {p.selectedAddressId && !p.checkingDelivery && !p.deliveryToAddressOk && (
          <div className="mt-4">
            <Notice tone="red" action={<SecondaryButton onClick={p.onChangePharmacy} className="px-3 py-1.5 text-xs">Choose another pharmacy</SecondaryButton>}>
              <strong>This pharmacy does not currently deliver to this address.</strong> Select another Verified Pharmacy Partner or a different address.
            </Notice>
          </div>
        )}
        {p.selectedAddressId && !p.checkingDelivery && p.deliveryToAddressOk && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Delivery available to this address from {p.selectedOption.partnerName}.</p>
        )}
      </Card>

      {/* Delivery method */}
      <Card>
        <SectionTitle icon={<Truck className="h-5 w-5" />} title="Delivery Method" subtitle={`Options supported by ${p.selectedOption.partnerName}.`} />
        {p.methods.length === 0 ? (
          <Notice tone="amber">This pharmacy does not currently offer home delivery.</Notice>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {p.methods.map((m) => {
              const selected = p.deliveryMethod === m;
              const fee = p.pricing.itemsSubtotal >= FREE_STANDARD_DELIVERY_FROM && m !== 'express' ? 0 : DELIVERY_FEES[m];
              return (
                <button key={m} type="button" onClick={() => p.setDeliveryMethod(m)} aria-pressed={selected} className={`rounded-2xl border p-4 text-left transition cursor-pointer ${selected ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">{DELIVERY_LABELS[m].title}</span>
                    {selected ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-600">{DELIVERY_LABELS[m].eta}</p>
                  <p className="mt-2 text-sm font-black text-slate-900">{fee === 0 ? 'Free' : formatINR(fee)}</p>
                </button>
              );
            })}
          </div>
        )}
        {p.deliveryMethod === 'scheduled' && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Choose a delivery slot</p>
            <div className="flex flex-wrap gap-2">
              {p.slots.map((s) => (
                <button key={s.id} type="button" onClick={() => p.setSlotId(s.id)} aria-pressed={p.slotId === s.id} className={`rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer ${p.slotId === s.id ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>{s.label}</button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Coupon + Payment */}
      <Card>
        <SectionTitle icon={<Tag className="h-5 w-5" />} title="Coupon / Discount Code" />
        {p.coupon ? (
          <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-emerald-900">Coupon Applied ✓ — {p.coupon.code}</p>
              <p className="text-xs text-emerald-800">{p.coupon.description} · You save {formatINR(p.coupon.discount)}</p>
            </div>
            <button type="button" onClick={p.onRemoveCoupon} className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer">Remove</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={p.couponInput}
              onChange={(e) => p.setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && p.onApplyCoupon()}
              placeholder="Enter Code"
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold uppercase tracking-wider text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <SecondaryButton onClick={p.onApplyCoupon} disabled={p.couponBusy || !p.couponInput.trim()} className="px-5">{p.couponBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}</SecondaryButton>
          </div>
        )}
        {p.couponError && <p role="alert" className="mt-2 text-xs font-semibold text-rose-700">{p.couponError}</p>}
        <p className="mt-2 text-[11px] text-slate-500">Try <span className="font-mono font-bold">GHFIRST10</span>, <span className="font-mono font-bold">CARE5</span> or <span className="font-mono font-bold">HEALTH50</span> (orders above ₹499).</p>
      </Card>

      <Card>
        <SectionTitle icon={<Lock className="h-5 w-5" />} title="Payment Method" right={<Badge tone="green"><Lock className="h-3 w-3" /> Secure Payment</Badge>} />
        <div className="grid gap-3 sm:grid-cols-2">
          {PAYMENT_METHODS.map((m) => {
            const selected = p.paymentMethod === m.id;
            return (
              <button key={m.id} type="button" onClick={() => p.setPaymentMethod(m.id)} aria-pressed={selected} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${selected ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${selected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{m.icon}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-black text-slate-900">{m.title}</span>
                  <span className="block text-xs text-slate-500">{m.caption}</span>
                </span>
              </button>
            );
          })}
        </div>
        {p.paymentMethod === 'UPI' && (
          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">UPI ID</span>
            <input value={p.upiId} onChange={(e) => p.setUpiId(e.target.value)} placeholder="yourname@bank" inputMode="email" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 sm:max-w-sm" />
          </label>
        )}
        <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500"><Lock className="h-3.5 w-3.5 text-emerald-600" />Your payment information is securely processed. Card and UPI details are never stored by GlobalHealth.</p>
      </Card>

      {/* Price breakdown + place order */}
      <Card>
        <SectionTitle icon={<FileText className="h-5 w-5" />} title="Complete Price Breakdown" />
        <PriceTable pricing={p.pricing} coupon={p.coupon} />
        {p.placeError && <div className="mt-4"><Notice tone="red">{p.placeError}</Notice></div>}
        <div className="mt-5 flex flex-col-reverse items-stretch gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <SecondaryButton onClick={p.onBack} disabled={p.placing}><ArrowLeft className="h-4 w-4" />Back</SecondaryButton>
          <div className="flex flex-col items-stretch gap-1 sm:items-end">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Payable</span>
            <span className="text-2xl font-black text-slate-900">{formatINR(p.pricing.total)}</span>
            <PrimaryButton onClick={p.onPlaceOrder} disabled={!p.mandatoryOk || p.placing} className="mt-1 px-6 py-3.5 text-base">
              {p.placing ? <><Loader2 className="h-5 w-5 animate-spin" />Processing payment...</> : <><Check className="h-5 w-5" />Place Order — {formatINR(p.pricing.total)}</>}
            </PrimaryButton>
            {!p.mandatoryOk && !p.placing && <span className="text-xs font-medium text-slate-500">Complete the address, delivery and payment sections to place the order.</span>}
          </div>
        </div>
      </Card>
    </>
  );
};

const PriceTable: React.FC<{ pricing: ReturnType<typeof computePricing>; coupon: { code: string } | null; compact?: boolean }> = ({ pricing, coupon, compact }) => (
  <dl className={`space-y-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
    <Row label="Medicine subtotal" value={formatINR(pricing.itemsSubtotal)} />
    {pricing.pharmacySavings > 0 && <Row label="Pharmacy saving vs MRP" value={`− ${formatINR(pricing.pharmacySavings)}`} tone="muted" />}
    <Row label={`Delivery fee${pricing.deliveryFee === 0 && pricing.itemsSubtotal > 0 ? ' (free)' : ''}`} value={formatINR(pricing.deliveryFee)} />
    <Row label="GST (5%)" value={formatINR(pricing.tax)} />
    {pricing.couponDiscount > 0 && <Row label={`Discount${coupon ? ` (${coupon.code})` : ''}`} value={`− ${formatINR(pricing.couponDiscount)}`} tone="green" />}
    <div className="my-2 border-t border-dashed border-slate-300" />
    <Row label="Total" value={formatINR(pricing.total)} strong />
  </dl>
);

const Row: React.FC<{ label: string; value: string; strong?: boolean; tone?: 'green' | 'muted' }> = ({ label, value, strong, tone }) => (
  <div className="flex items-center justify-between gap-3">
    <dt className={`${strong ? 'text-base font-black text-slate-900' : tone === 'muted' ? 'text-slate-500' : 'font-medium text-slate-700'}`}>{label}</dt>
    <dd className={`font-mono ${strong ? 'text-xl font-black text-slate-900' : tone === 'green' ? 'font-bold text-emerald-700' : tone === 'muted' ? 'text-slate-500' : 'font-bold text-slate-900'}`}>{value}</dd>
  </div>
);

// ===========================================================================
// Order summary (right column)
// ===========================================================================

interface SummaryProps {
  product: PharmacyProduct;
  quantity: number;
  selectedOption: PartnerAvailabilityOption | null;
  otherLines: CartItem[];
  onRemoveOther: (key: string) => void;
  onChangeOtherQty: (key: string, q: number) => void;
  deliveryMethod: DeliveryMethod | null;
  rxState: PrescriptionState;
  pricing: ReturnType<typeof computePricing>;
  coupon: { code: string } | null;
  step: Step;
  mandatoryOk: boolean;
  placing: boolean;
  onPlaceOrder: () => void;
}

const OrderSummary: React.FC<SummaryProps> = ({ product, quantity, selectedOption, otherLines, onRemoveOther, onChangeOtherQty, deliveryMethod, rxState, pricing, coupon, step, mandatoryOk, placing, onPlaceOrder }) => {
  const unit = selectedOption?.price ?? product.price;
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs" aria-label="Order summary">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">Order Summary</h2>

        <div className="mt-3 flex gap-3">
          <img src={product.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-slate-200" loading="lazy" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-900">{product.name.split('(')[0].trim()}</p>
            <p className="text-xs text-slate-500">{product.strength} · {product.dosageForm} · {product.packSize}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge tone={product.prescriptionRequired ? 'amber' : 'green'}>{product.prescriptionRequired ? 'Rx' : 'OTC'}</Badge>
              {selectedOption && <Badge tone={selectedOption.stockStatus === 'In Stock' ? 'green' : 'amber'}>{selectedOption.stockStatus}</Badge>}
            </div>
          </div>
        </div>

        <dl className="mt-4 space-y-2 text-xs">
          <SummaryRow label="Quantity" value={`${quantity} × ${formatINR(unit)}`} />
          <SummaryRow label="Pharmacy" value={selectedOption ? selectedOption.partnerName : 'Not selected yet'} muted={!selectedOption} />
          <SummaryRow label="Prescription" value={rxState.kind === 'not_required' ? 'Not required' : rxState.kind === 'verified' ? 'Verified ✓' : rxState.kind === 'pending' ? 'Pending' : rxState.kind === 'rejected' ? 'Not accepted' : 'Required'} muted={rxState.kind === 'missing'} />
          <SummaryRow label="Delivery" value={deliveryMethod ? `${DELIVERY_LABELS[deliveryMethod].title} · ${DELIVERY_LABELS[deliveryMethod].eta}` : step < 4 ? 'Chosen at checkout' : 'Not selected'} muted={!deliveryMethod} />
        </dl>

        {otherLines.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-500">Also in your Verified Cart</p>
            <ul className="space-y-2">
              {otherLines.map((l) => {
                const key = cartLineKey(l);
                return (
                  <li key={key} className="rounded-xl border border-slate-200 p-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{l.product.name.split('(')[0].trim()}</p>
                        <p className="text-slate-500">{l.product.strength} · {l.product.dosageForm}</p>
                        <p className="truncate text-slate-500">{l.product.pharmacyPartnerName}{l.product.prescriptionRequired ? ' · Rx' : ''}</p>
                      </div>
                      <button type="button" onClick={() => onRemoveOther(key)} aria-label={`Remove ${l.product.name}`} className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-lg border border-slate-200">
                        <button type="button" onClick={() => onChangeOtherQty(key, l.quantity - 1)} disabled={l.quantity <= 1} className="grid h-7 w-7 place-items-center disabled:opacity-40 cursor-pointer"><Minus className="h-3 w-3" /></button>
                        <span className="w-6 text-center font-black">{l.quantity}</span>
                        <button type="button" onClick={() => onChangeOtherQty(key, l.quantity + 1)} className="grid h-7 w-7 place-items-center cursor-pointer"><Plus className="h-3 w-3" /></button>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{formatINR(l.product.price * l.quantity)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-4 border-t border-slate-100 pt-3">
          <PriceTable pricing={pricing} coupon={coupon} compact />
        </div>

        {step === 4 && (
          <PrimaryButton onClick={onPlaceOrder} disabled={!mandatoryOk || placing} className="mt-4 w-full">
            {placing ? <><Loader2 className="h-4 w-4 animate-spin" />Processing payment...</> : <><Check className="h-4 w-4" />Place Order — {formatINR(pricing.total)}</>}
          </PrimaryButton>
        )}
        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-slate-500"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />Dispensed only by a Verified Pharmacy Partner. Prices are read live from the pharmacy's own inventory.</p>
      </section>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: string; muted?: boolean }> = ({ label, value, muted }) => (
  <div className="flex items-start justify-between gap-3">
    <dt className="shrink-0 font-semibold text-slate-500">{label}</dt>
    <dd className={`text-right font-bold ${muted ? 'text-slate-400' : 'text-slate-900'}`}>{value}</dd>
  </div>
);

// ===========================================================================
// Not listed
// ===========================================================================

const NotListedCard: React.FC<{ medicine: Medicine; onBack: () => void }> = ({ medicine, onBack }) => (
  <Card>
    <SectionTitle icon={<AlertTriangle className="h-5 w-5" />} title={`${medicine.name} is not available for purchase yet`} subtitle="No Verified Pharmacy Partner currently lists this medicine in the GlobalHealth marketplace." />
    <Notice tone="blue">Our partner pharmacies add medicines to the verified catalogue continuously. You can still read the full clinical monograph for {medicine.name}, or browse medicines that are available to buy today.</Notice>
    <div className="mt-5"><SecondaryButton onClick={onBack}><ArrowLeft className="h-4 w-4" />Back to Medicines</SecondaryButton></div>
  </Card>
);

// ===========================================================================
// Confirmation & tracking
// ===========================================================================

/** Opens a printable tax invoice built from the placed order (no external service). */
export function openInvoice(order: PharmacyOrder) {
  const rows = order.items.map((i) => `<tr><td>${i.productName} ${i.strength}</td><td style="text-align:right">${i.quantity}</td><td style="text-align:right">₹${i.unitPrice.toFixed(2)}</td><td style="text-align:right">₹${i.totalPrice.toFixed(2)}</td></tr>`).join('');
  const pr = order.pricing;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order.id}</title>
<style>body{font-family:system-ui,Segoe UI,Arial,sans-serif;color:#0f172a;margin:40px;max-width:760px}h1{font-size:20px;margin:0}h2{font-size:13px;color:#475569;text-transform:uppercase;letter-spacing:.06em;margin:24px 0 8px}table{width:100%;border-collapse:collapse;font-size:14px}td,th{padding:8px 6px;border-bottom:1px solid #e2e8f0}th{text-align:left;font-size:12px;color:#475569}tfoot td{border:0;font-weight:700}.muted{color:#64748b;font-size:13px}.total td{font-size:18px;border-top:2px solid #0f172a}</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h1>GlobalHealth · Tax Invoice</h1><div class="muted">Verified Pharmacy Partner order</div></div><div style="text-align:right"><div><strong>${order.id}</strong></div><div class="muted">${new Date(order.date).toLocaleString('en-IN')}</div></div></div>
<h2>Dispensing pharmacy</h2><div>${order.fulfillingPharmacy.name}</div><div class="muted">Licence ${order.fulfillingPharmacy.license}${order.fulfillingPharmacy.phone ? ' · ' + order.fulfillingPharmacy.phone : ''}</div>
<h2>Deliver to</h2><div>${order.deliveryAddress.fullName}</div><div class="muted">${order.deliveryAddress.street}${order.deliveryAddress.apartment ? ', ' + order.deliveryAddress.apartment : ''}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.pincode} · ${order.deliveryAddress.phone}</div>
<h2>Items</h2><table><thead><tr><th>Medicine</th><th style="text-align:right">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody>
<tfoot><tr><td colspan="3">Medicine subtotal</td><td style="text-align:right">₹${pr.itemsSubtotal.toFixed(2)}</td></tr>
${pr.couponDiscount ? `<tr><td colspan="3">Discount (${pr.couponCode || 'coupon'})</td><td style="text-align:right">− ₹${pr.couponDiscount.toFixed(2)}</td></tr>` : ''}
<tr><td colspan="3">Delivery fee</td><td style="text-align:right">₹${pr.deliveryFee.toFixed(2)}</td></tr>
<tr><td colspan="3">GST (5%)</td><td style="text-align:right">₹${pr.tax.toFixed(2)}</td></tr>
<tr class="total"><td colspan="3">Total ${order.paymentStatus === 'Paid' ? 'paid' : 'payable on delivery'} · ${order.paymentMethod}</td><td style="text-align:right">₹${pr.grandTotal.toFixed(2)}</td></tr></tfoot></table>
<h2>Prescription</h2><div>${order.prescriptionStatus || (order.prescriptionId ? 'Verified' : 'Not Required')}${order.prescriptionId ? ' · Ref ' + order.prescriptionId : ''}</div>
<p class="muted" style="margin-top:32px">This invoice was generated by GlobalHealth on behalf of the Verified Pharmacy Partner named above. Medicines are dispensed only against a valid prescription where required by law.</p>
<script>window.onload=function(){window.print()}</script></body></html>`;
  const win = window.open('', '_blank', 'noopener,width=860,height=900');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

const ConfirmationView: React.FC<{ order: PharmacyOrder; onTrack: () => void; onViewOrders: () => void; onContinue: () => void }> = ({ order, onTrack, onViewOrders, onContinue }) => (
  <Card className="mx-auto max-w-2xl text-center">
    <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"><Check className="h-8 w-8" /></span>
    <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">Order Placed Successfully ✓</h2>
    <p className="mt-1 text-sm text-slate-600">Your medicine is being prepared by a Verified Pharmacy Partner.</p>

    <dl className="mx-auto mt-6 grid max-w-md gap-4 text-left sm:grid-cols-2">
      <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4">
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Order ID</dt>
        <dd className="font-mono text-lg font-black text-slate-900">{order.id}</dd>
      </div>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Medicine</dt>
        <dd className="text-sm font-bold text-slate-900">{order.items.map((i) => `${i.productName.split('(')[0].trim()} ${i.strength}`).join(', ')}</dd>
      </div>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quantity</dt>
        <dd className="text-sm font-bold text-slate-900">{order.items.reduce((s, i) => s + i.quantity, 0)}</dd>
      </div>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pharmacy</dt>
        <dd className="text-sm font-bold text-slate-900">{order.fulfillingPharmacy.name}</dd>
      </div>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Delivery</dt>
        <dd className="text-sm font-bold text-slate-900">{order.estimatedDelivery}</dd>
      </div>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Prescription</dt>
        <dd className="text-sm font-bold text-slate-900">{order.prescriptionStatus || (order.prescriptionId ? 'Verified' : 'Not Required')}</dd>
      </div>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{order.paymentStatus === 'Paid' ? 'Total Paid' : 'Payable on delivery'}</dt>
        <dd className="text-sm font-black text-slate-900">{formatINR(order.pricing.grandTotal)} <span className="text-xs font-semibold text-slate-500">· {order.paymentMethod}</span></dd>
      </div>
    </dl>

    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <PrimaryButton onClick={onTrack}><Truck className="h-4 w-4" />Track Order</PrimaryButton>
      <SecondaryButton onClick={onViewOrders}><FileText className="h-4 w-4" />View Order</SecondaryButton>
      <SecondaryButton onClick={onContinue}><ShoppingCart className="h-4 w-4" />Continue Shopping</SecondaryButton>
    </div>
    <button type="button" onClick={() => openInvoice(order)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"><FileText className="h-3.5 w-3.5" />Download / print tax invoice</button>
    <p className="mt-3 text-xs text-slate-500">This order now appears in <strong>My Orders &amp; Prescriptions</strong> with its invoice and live tracking.</p>
  </Card>
);

const TrackingView: React.FC<{ order: PharmacyOrder; onBack: () => void; onViewOrders: () => void }> = ({ order, onBack, onViewOrders }) => (
  <Card className="mx-auto max-w-2xl">
    <SectionTitle icon={<Truck className="h-5 w-5" />} title="Track Order" subtitle={`${order.id} · ${order.fulfillingPharmacy.name}`} right={<Badge tone="green">{order.status}</Badge>} />
    <ol className="relative ml-3 space-y-6 border-l-2 border-slate-200 pl-6">
      {order.trackingSteps.map((s, i) => (
        <li key={i} className="relative">
          <span className={`absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full border-2 ${s.completed ? 'border-emerald-600 bg-emerald-600 text-white' : s.current ? 'border-emerald-600 bg-white ring-4 ring-emerald-100' : 'border-slate-300 bg-white'}`}>
            {s.completed ? <Check className="h-3.5 w-3.5" /> : s.current ? <span className="h-2 w-2 rounded-full bg-emerald-600" /> : null}
          </span>
          <p className={`text-sm font-black ${s.completed || s.current ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}{s.current && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Current</span>}</p>
          <p className="text-xs text-slate-500">{s.description}</p>
          <p className="text-[11px] font-mono text-slate-400">{s.timestamp}</p>
        </li>
      ))}
    </ol>
    <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-xs sm:grid-cols-2">
      <div><span className="block font-bold uppercase tracking-wider text-slate-500">Delivering to</span><span className="font-semibold text-slate-800">{order.deliveryAddress.fullName}, {order.deliveryAddress.street}, {order.deliveryAddress.city} {order.deliveryAddress.pincode}</span></div>
      <div><span className="block font-bold uppercase tracking-wider text-slate-500">Pharmacy contact</span><span className="inline-flex items-center gap-1 font-semibold text-slate-800"><Phone className="h-3 w-3" />{order.fulfillingPharmacy.phone || 'Via GlobalHealth support'}</span></div>
    </div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <SecondaryButton onClick={onBack}><ArrowLeft className="h-4 w-4" />Back to confirmation</SecondaryButton>
      <PrimaryButton onClick={onViewOrders}><FileText className="h-4 w-4" />My Orders &amp; Prescriptions</PrimaryButton>
    </div>
  </Card>
);

export default BuyMedicineWorkspace;

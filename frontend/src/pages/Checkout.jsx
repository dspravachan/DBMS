import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Smartphone, Building2, CheckCircle, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const PAYMENT_METHODS = [
  { id: 'wallet',     label: 'Wallet',             icon: Wallet },
  { id: 'card',       label: 'Credit/Debit Card',  icon: CreditCard },
  { id: 'upi',        label: 'UPI',                icon: Smartphone },
  { id: 'netbanking', label: 'Net Banking',         icon: Building2 },
];

export default function Checkout() {
  const location  = useLocation();
  const navigate  = useNavigate();

  // ── CartContext is the single source of truth for display ──────────────────
  const { cartItems, clearCart } = useCart();

  // Coupon / total passed from Cart page via navigation state
  const { coupon, total: passedTotal } = location.state || {};

  const [address,          setAddress]          = useState('');
  const [method,           setMethod]           = useState('wallet');
  const [walletBalance,    setWalletBalance]    = useState(0);
  const [processing,       setProcessing]       = useState(false);
  const [success,          setSuccess]          = useState(false);
  const [syncing,          setSyncing]          = useState(false);
  const [membershipInfo,   setMembershipInfo]   = useState(null); // { name, subscription_discount }

  // Track if we've already done the backend sync this session
  const syncDone = useRef(false);

  // ── Compute totals from local cart (never trust a stale server response) ──
  const subtotal          = cartItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const couponDiscount    = coupon?.discount_amount ? parseFloat(coupon.discount_amount) : 0;
  const afterCoupon       = subtotal - couponDiscount;
  const membershipDiscount = membershipInfo
    ? parseFloat(((afterCoupon * membershipInfo.subscription_discount) / 100).toFixed(2))
    : 0;
  // If a pre-calculated total was passed (from Cart page), trust it; otherwise compute locally
  const orderTotal = passedTotal != null
    ? parseFloat(passedTotal) - membershipDiscount
    : subtotal - couponDiscount - membershipDiscount;

  // ── Fetch wallet balance + membership info ────────────────────────────────
  useEffect(() => {
    api.get('/wallet')
      .then(r => setWalletBalance(parseFloat(r.data.data?.balance || 0)))
      .catch(() => {});
    api.get('/memberships/my')
      .then(r => { if (r.data.data?.subscription_discount > 0) setMembershipInfo(r.data.data); })
      .catch(() => {});
  }, []);

  // ── Sync local cart → backend DB so POST /orders can read it ──────────────
  // Runs once when cartItems are ready (length > 0) and not yet synced.
  useEffect(() => {
    if (syncDone.current || cartItems.length === 0) return;

    const sync = async () => {
      setSyncing(true);
      try {
        // Clear backend cart first to avoid restaurant-mismatch errors
        await api.delete('/cart').catch(() => {});
        // Push all local items
        for (const item of cartItems) {
          await api.post('/cart', {
            food_id:  item.food_id,
            quantity: item.quantity,
          }).catch(() => {});
        }
        syncDone.current = true;
      } catch {
        // Silent – order will still attempt with whatever is in the DB
      } finally {
        setSyncing(false);
      }
    };

    sync();
  }, [cartItems]);   // re-runs when cartItems first become non-empty

  // ── Handle payment ────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (cartItems.length === 0) return toast.error('Your cart is empty');
    if (!address.trim())        return toast.error('Please enter a delivery address');
    if (method === 'wallet' && walletBalance < orderTotal) {
      return toast.error(`Insufficient balance. Need ₹${(orderTotal - walletBalance).toFixed(2)} more.`);
    }

    setProcessing(true);
    try {
      // Re-sync just before placing (handles edge case where sync hadn't finished)
      if (!syncDone.current) {
        await api.delete('/cart').catch(() => {});
        for (const item of cartItems) {
          await api.post('/cart', { food_id: item.food_id, quantity: item.quantity }).catch(() => {});
        }
      }

      await api.post('/orders', {
        delivery_address:    address,
        coupon_code:         coupon?.code || null,
        special_instructions: '',
        payment_method:      method,
      });

      clearCart();
      setSuccess(true);
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={48} className="text-green-400" />
        </motion.div>
        <h2 className="text-white text-2xl font-bold mb-2">Order Placed!</h2>
        <p className="text-gray-400">Redirecting to your orders…</p>
      </motion.div>
    </div>
  );

  // ── Empty cart guard ──────────────────────────────────────────────────────
  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-[#0F1115] pt-24 flex flex-col items-center justify-center gap-4">
      <ShoppingBag size={56} className="text-gray-600" />
      <p className="text-white text-xl font-bold">Your cart is empty</p>
      <p className="text-gray-500 text-sm">Add items before checking out</p>
      <button
        onClick={() => navigate('/restaurants')}
        className="mt-2 bg-[#FF8C42] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#FF7A2B] transition-colors"
      >
        Browse Restaurants
      </button>
    </div>
  );

  // ── Main checkout UI ──────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#0F1115] pt-24 pb-16 px-4"
    >
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── Left column ── */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-[#1A1D24] rounded-2xl p-6 border border-white/5">
              <h3 className="text-white font-semibold mb-4">Delivery Address</h3>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter your full delivery address…"
                rows={4}
                className="w-full bg-[#22252E] text-white rounded-xl px-4 py-3 border border-white/10 focus:border-[#FF8C42] outline-none resize-none text-sm"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-[#1A1D24] rounded-2xl p-6 border border-white/5">
              <h3 className="text-white font-semibold mb-4">Payment Method</h3>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                  <label
                    key={id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      method === id ? 'border-[#FF8C42] bg-[#FF8C42]/5' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input type="radio" name="method" value={id}
                      checked={method === id} onChange={() => setMethod(id)}
                      className="hidden"
                    />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method === id ? 'bg-[#FF8C42]/20' : 'bg-[#22252E]'}`}>
                      <Icon size={18} className={method === id ? 'text-[#FF8C42]' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${method === id ? 'text-white' : 'text-gray-300'}`}>{label}</p>
                      {id === 'wallet' && (
                        <p className="text-xs text-gray-500">Balance: ₹{walletBalance.toFixed(2)}</p>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === id ? 'border-[#FF8C42]' : 'border-gray-600'}`}>
                      {method === id && <div className="w-2.5 h-2.5 rounded-full bg-[#FF8C42]" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column: Order Summary ── */}
          <div className="bg-[#1A1D24] rounded-2xl p-6 border border-white/5 h-fit">
            <h3 className="text-white font-semibold mb-4">Order Summary</h3>

            {/* Item list */}
            <div className="space-y-3 mb-6">
              {cartItems.map(item => (
                <div key={item.food_id} className="flex justify-between text-sm items-start gap-2">
                  <span className="text-gray-300 truncate flex-1">
                    {item.food_name || item.name} × {item.quantity}
                  </span>
                  <span className="text-gray-400 shrink-0">
                    ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Coupon ({coupon.code})</span>
                  <span>− ₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {membershipInfo && membershipDiscount > 0 && (
                <div className="flex justify-between text-sm text-purple-400">
                  <span>👑 {membershipInfo.name} ({membershipInfo.subscription_discount}% off)</span>
                  <span>− ₹{membershipDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-1">
                <span className="text-white">Total</span>
                <span className="text-[#FF8C42]">₹{orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Wallet warning */}
            {method === 'wallet' && walletBalance < orderTotal && (
              <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 text-sm">
                Insufficient balance. Need ₹{(orderTotal - walletBalance).toFixed(2)} more.
                <button onClick={() => navigate('/wallet')} className="underline ml-1">Recharge</button>
              </div>
            )}

            {/* Sync indicator */}
            {syncing && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-3 border border-gray-500 border-t-white rounded-full animate-spin" />
                Syncing cart with server…
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={processing || syncing || orderTotal <= 0}
              className="w-full mt-6 bg-[#FF8C42] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#FF7A2B] transition-all hover:shadow-[0_0_30px_rgba(255,140,66,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing
                ? <><div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> Processing…</>
                : syncing
                  ? <><div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> Preparing order…</>
                  : `Pay ₹${orderTotal.toFixed(2)}`
              }
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

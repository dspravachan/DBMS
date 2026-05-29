import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

export default function Cart() {
  // CartContext is the single source of truth for cart items
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, order_amount: subtotal });
      setCoupon(res.data.data);
      toast.success('Coupon applied! 🎉');
    } catch (err) {
      // 401 means not logged in — show friendly message, do NOT clear cart
      if (err.response?.status === 401) {
        toast.error('Please log in to apply coupons');
      } else {
        toast.error(err.response?.data?.message || 'Invalid coupon');
      }
      setCoupon(null);
    } finally { setCouponLoading(false); }
  };

  const subtotal = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
  const discount = coupon
    ? (coupon.discount_type === 'percent'
        ? Math.min(subtotal * coupon.discount_value / 100, coupon.max_discount || Infinity)
        : coupon.discount_value)
    : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0F1115] pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Your <span className="text-[#FF8C42]">Cart</span></h1>
        <p className="text-gray-500 text-sm mb-8">{cartItems.reduce((s,i)=>s+i.quantity,0)} item{cartItems.reduce((s,i)=>s+i.quantity,0)!==1?'s':''} in your cart</p>

        {cartItems.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl mb-6">Your cart is empty</p>
            <button onClick={() => navigate('/restaurants')}
              className="bg-[#FF8C42] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#FF7A2B] transition-colors">
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, idx) => (
                <motion.div key={item.food_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-[#1A1D24] rounded-2xl p-5 flex items-center gap-4 border border-white/5">
                  <img
                    src={item.image_url || '/images/food_butter_chicken.png'}
                    alt={item.food_name || item.name || 'Food'}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.target.onerror = null; e.target.src = '/images/food_butter_chicken.png'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{item.food_name || item.name}</h3>
                    <p className="text-gray-400 text-sm">{item.restaurant_name || ''}</p>
                    <p className="text-[#FF8C42] font-bold mt-1">₹{parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.food_id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-[#22252E] text-white flex items-center justify-center hover:bg-[#FF8C42] transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="text-white w-8 text-center font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.food_id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-[#22252E] text-white flex items-center justify-center hover:bg-[#FF8C42] transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-white font-bold w-24 text-right">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.food_id)}
                    className="text-red-400 hover:text-red-300 ml-2 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              {/* Coupon */}
              <div className="bg-[#1A1D24] rounded-2xl p-5 border border-white/5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Tag size={16} className="text-[#FF8C42]" /> Apply Coupon</h3>
                <div className="flex gap-2">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="WELCOME10"
                    className="flex-1 bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
                  <button onClick={applyCoupon} disabled={couponLoading}
                    className="bg-[#FF8C42] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#FF7A2B] transition-colors disabled:opacity-50">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {coupon && <p className="text-green-400 text-xs mt-2">✓ {coupon.code} applied — ₹{discount.toFixed(2)} off</p>}
              </div>

              {/* Summary */}
              <div className="bg-[#1A1D24] rounded-2xl p-5 border border-white/5">
                <h3 className="text-white font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span><span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Delivery</span><span className="text-white">₹40</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-base">
                    <span className="text-white">Total</span>
                    <span className="text-[#FF8C42]">₹{(total + 40).toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={() => navigate('/checkout', { state: { coupon, total: total + 40 } })}
                  className="w-full mt-5 bg-[#FF8C42] text-white py-3.5 rounded-xl font-semibold hover:bg-[#FF7A2B] transition-all hover:shadow-[0_0_20px_rgba(255,140,66,0.4)] flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

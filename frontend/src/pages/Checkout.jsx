import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ChevronRight, ShoppingBag, Tag, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { couponService, orderService } from '../services/endpoints';
import { formatPrice } from '../utils/formatters';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // If cart is empty, redirect to products
  if (!cart?.items?.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
        <p className="text-slate-500 mb-8">Add some items before proceeding to checkout.</p>
        <Link to="/products" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    setApplyingCoupon(true);
    try {
      // In a real app, the backend might calculate this based on the cart total
      // Since our API currently takes just the code, we'll calculate it here for display
      // But the final calculation happens on the server during order creation
      const { data } = await couponService.apply({ code: couponCode });
      
      const coupon = data.coupon;
      let calculatedDiscount = 0;
      
      if (cart.total < coupon.min_order_amount) {
        toast.error(`Minimum order amount for this coupon is ${formatPrice(coupon.min_order_amount)}`);
        setApplyingCoupon(false);
        return;
      }

      if (coupon.discount_type === 'percent') {
        calculatedDiscount = cart.total * (coupon.discount_value / 100);
      } else {
        calculatedDiscount = coupon.discount_value;
      }

      // Ensure discount doesn't exceed total
      calculatedDiscount = Math.min(calculatedDiscount, cart.total);

      setAppliedCoupon(coupon);
      setDiscountAmount(calculatedDiscount);
      toast.success('Coupon applied successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid or expired coupon');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const { data } = await orderService.create({
        coupon_code: appliedCoupon ? appliedCoupon.code : null
      });
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = Math.max(0, cart.total - discountAmount);

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Checkout Area */}
          <div className="w-full lg:w-2/3 space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

            {/* Simulated Address/Shipping Section */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                Shipping Address
              </h2>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-900">John Doe</p>
                    <p className="text-slate-500 mt-1 text-sm">123 Tech Park, Phase 1</p>
                    <p className="text-slate-500 text-sm">Bangalore, Karnataka 560001</p>
                    <p className="text-slate-500 mt-2 text-sm">+91 9876543210</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">Default</span>
                </div>
              </div>
            </div>

            {/* Simulated Payment Section */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                Payment Method
              </h2>
              <div className="border border-primary rounded-xl p-4 bg-primary/5 flex items-center gap-4 cursor-pointer relative overflow-hidden">
                <div className="w-5 h-5 rounded-full border-4 border-primary bg-white flex-shrink-0"></div>
                <CreditCard className="text-primary" size={24} />
                <div>
                  <p className="font-medium text-slate-900">Cash on Delivery (COD)</p>
                  <p className="text-slate-500 text-sm">Pay when your order arrives.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img 
                      src={item.product.image_url || 'https://via.placeholder.com/64'} 
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg border border-slate-100"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-slate-500 text-xs mt-1">Qty: {item.quantity}</p>
                      <p className="font-medium text-slate-900 mt-1">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-slate-100 mb-6" />

              {/* Coupon Section */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Discount code"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-primary focus:border-primary uppercase"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={applyingCoupon || !couponCode}
                      className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="text-emerald-500" size={16} />
                      <span className="font-mono text-sm font-semibold text-emerald-700">{appliedCoupon.code}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-slate-400 hover:text-slate-600">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{formatPrice(cart.total)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
              </div>

              <hr className="border-slate-100 mb-6" />

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-2xl font-extrabold text-primary">{formatPrice(finalTotal)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Processing...' : 'Place Order'}
                {!loading && <ChevronRight size={20} />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;

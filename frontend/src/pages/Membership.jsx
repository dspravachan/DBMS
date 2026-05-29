import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const TIER_STYLES = {
  Silver: { gradient: 'from-gray-400 to-gray-600', glow: 'shadow-[0_0_30px_rgba(156,163,175,0.3)]', icon: '🥈' },
  Gold: { gradient: 'from-yellow-400 to-orange-500', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.4)]', icon: '🥇' },
  Platinum: { gradient: 'from-purple-400 to-indigo-600', glow: 'shadow-[0_0_30px_rgba(167,139,250,0.4)]', icon: '💎' },
};

export default function Membership() {
  const [plans, setPlans] = useState([]);
  const [myMembership, setMyMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');

  useEffect(() => {
    Promise.all([
      api.get('/memberships'),
      api.get('/memberships/my').catch(() => ({ data: { data: null } }))
    ]).then(([plansRes, myRes]) => {
      setPlans(plansRes.data.data || []);
      setMyMembership(myRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const purchase = async (membershipId) => {
    setPurchasing(membershipId);
    try {
      // Backend requires both membership_id AND payment_method
      await api.post('/memberships/purchase', {
        membership_id: membershipId,
        payment_method: paymentMethod,
      });
      toast.success('Membership activated! 🎉');
      const myRes = await api.get('/memberships/my');
      setMyMembership(myRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Purchase failed');
    } finally { setPurchasing(null); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF8C42]" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#0F1115] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2 bg-[#FF8C42]/10 text-[#FF8C42] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown size={16} /> Premium Memberships
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-3">Unlock <span className="text-[#FF8C42]">Premium</span> Perks</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Save more on every order with exclusive discounts, free deliveries, and priority support.</p>
          {/* Payment Method Selector */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-gray-400 text-sm">Pay via:</span>
            {['wallet','card','upi','netbanking'].map(m => (
              <button key={m} onClick={() => setPaymentMethod(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                  paymentMethod === m
                    ? 'bg-[#FF8C42] text-white border-[#FF8C42]'
                    : 'bg-transparent text-gray-400 border-white/20 hover:border-[#FF8C42]/50'
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {myMembership && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-[#FF8C42]/20 to-purple-500/20 rounded-2xl p-5 border border-[#FF8C42]/30 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="text-[#FF8C42]" size={24} />
              <div>
                <p className="text-white font-semibold">Current Plan: {myMembership.membership_name}</p>
                <p className="text-gray-400 text-sm">Valid until {new Date(myMembership.end_date).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            <span className="bg-green-500/20 text-green-400 text-sm font-medium px-3 py-1 rounded-full">Active</span>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => {
            const style = TIER_STYLES[plan.name] || TIER_STYLES.Silver;
            const isActive = myMembership?.membership_id === plan.id;
            const perks = typeof plan.perks === 'string' ? JSON.parse(plan.perks) : plan.perks || [];
            const isGold = plan.name === 'Gold';

            return (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={`bg-[#1A1D24] rounded-2xl overflow-hidden border transition-all duration-300 ${isActive ? 'border-[#FF8C42]' : 'border-white/5 hover:border-white/20'} ${isGold ? style.glow : ''} ${isGold ? 'scale-105' : ''}`}>
                {isGold && (
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold text-center py-2 uppercase tracking-wider">
                    ⭐ Most Popular
                  </div>
                )}
                <div className={`bg-gradient-to-br ${style.gradient} p-6 text-center`}>
                  <div className="text-4xl mb-2">{style.icon}</div>
                  <h3 className="text-white font-bold text-xl">{plan.name}</h3>
                  <div className="mt-3">
                    <span className="text-white text-4xl font-bold">₹{plan.price}</span>
                    <span className="text-white/70 text-sm">/{plan.duration_days} days</span>
                  </div>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3 text-sm">
                      <Check size={16} className="text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{plan.subscription_discount}% off all subscriptions</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Check size={16} className="text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{plan.free_deliveries} free deliveries/month</span>
                    </li>
                    {perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <Check size={16} className="text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{perk}</span>
                      </li>
                    ))}
                  </ul>

                  {isActive ? (
                    <div className="w-full py-3 rounded-xl bg-green-500/10 text-green-400 font-semibold text-center text-sm">
                      ✓ Current Plan
                    </div>
                  ) : (
                    <button onClick={() => purchase(plan.id)} disabled={purchasing === plan.id}
                      className={`w-full py-3 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 ${isGold ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg' : 'bg-[#FF8C42]/10 text-[#FF8C42] hover:bg-[#FF8C42] hover:text-white border border-[#FF8C42]/30'}`}>
                      {purchasing === plan.id ? <div className="animate-spin w-4 h-4 border-2 border-current/30 border-t-current rounded-full" /> : <Zap size={15} />}
                      {purchasing === plan.id ? 'Processing...' : `Get ${plan.name}`}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

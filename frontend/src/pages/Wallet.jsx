import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const QUICK_AMOUNTS = [100, 200, 500, 1000];

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);

  useEffect(() => { fetchWallet(); }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet');
      setWallet(res.data.data?.wallet || res.data.data);
      setTransactions(res.data.data?.transactions || []);
    } catch { toast.error('Failed to load wallet'); }
    finally { setLoading(false); }
  };

  const recharge = async (amount) => {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) return toast.error('Enter valid amount');
    setRecharging(true);
    try {
      await api.post('/wallet/recharge', { amount: amt });
      toast.success(`₹${amt} added to wallet!`);
      setCustomAmount('');
      fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Recharge failed');
    } finally { setRecharging(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF8C42]" />
    </div>
  );

  const balance = parseFloat(wallet?.balance || 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#0F1115] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">My <span className="text-[#FF8C42]">Wallet</span></h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Balance Card */}
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="bg-gradient-to-br from-[#FF8C42] to-[#FF5F1F] rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <WalletIcon size={36} className="text-white/80 mb-4" />
            <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Available Balance</p>
            <p className="text-white text-5xl font-bold mt-2">₹{balance.toFixed(2)}</p>
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp size={16} className="text-white/60" />
              <p className="text-white/60 text-sm">MealMatrix Wallet</p>
            </div>
          </motion.div>

          {/* Recharge Card */}
          <div className="bg-[#1A1D24] rounded-3xl p-6 border border-white/5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-[#FF8C42]" /> Recharge Wallet
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {QUICK_AMOUNTS.map(amt => (
                <button key={amt} onClick={() => recharge(amt)} disabled={recharging}
                  className="py-2.5 rounded-xl border border-[#FF8C42]/30 text-[#FF8C42] font-semibold text-sm hover:bg-[#FF8C42] hover:text-white transition-all disabled:opacity-50">
                  +₹{amt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                placeholder="Custom amount"
                className="flex-1 bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
              <button onClick={() => recharge(customAmount)} disabled={recharging}
                className="bg-[#FF8C42] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#FF7A2B] transition-colors disabled:opacity-50">
                {recharging ? '...' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#1A1D24] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-white font-semibold">Transaction History</h3>
          </div>
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No transactions yet</div>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map((tx, idx) => (
                <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                  className="px-5 py-4 flex items-center justify-between hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {tx.type === 'credit'
                        ? <ArrowDownLeft size={18} className="text-green-400" />
                        : <ArrowUpRight size={18} className="text-red-400" />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{tx.description || (tx.type === 'credit' ? 'Wallet Recharge' : 'Payment')}</p>
                      <p className="text-gray-500 text-xs">{new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

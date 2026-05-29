import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  preparing: 'bg-orange-500/20 text-orange-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF8C42]" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0F1115] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Order <span className="text-[#FF8C42]">History</span></h1>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <Package size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#1A1D24] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-5 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FF8C42]/10 rounded-xl flex items-center justify-center">
                      <Package className="text-[#FF8C42]" size={20} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Order #{order.id?.slice(0, 8) || order.id}</p>
                      <p className="text-gray-400 text-sm">{order.restaurant_name} · {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                    <span className="text-[#FF8C42] font-bold">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                    {expanded === order.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === order.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="px-5 pb-5 border-t border-white/5 pt-4">
                        {order.items?.length > 0 ? (
                          <div className="space-y-2 mb-4">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-300">{item.food_name} × {item.quantity}</span>
                                <span className="text-gray-400">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm mb-4">No item details available</p>
                        )}
                        {order.delivery_address && (
                          <p className="text-gray-400 text-xs">📍 {order.delivery_address}</p>
                        )}
                        <button className="mt-3 flex items-center gap-2 text-[#FF8C42] text-sm hover:text-[#FF7A2B] transition-colors">
                          <RefreshCw size={14} /> Reorder
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

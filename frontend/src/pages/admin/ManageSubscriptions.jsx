import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, PauseCircle, PlayCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const STATUS_STYLES = {
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
  expired: 'bg-gray-500/20 text-gray-400',
};

export default function ManageSubscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchSubs(); }, []);

  const fetchSubs = async () => {
    try {
      const r = await api.get('/subscriptions/admin/all');
      setSubs(r.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, action) => {
    try {
      let body = {};
      if (action === 'pause') {
        // Pause requires a paused_until date
        const today = new Date();
        const defaultDate = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];
        const dateInput = window.prompt('Pause until date (YYYY-MM-DD):', defaultDate);
        if (!dateInput) return; // user cancelled
        body = { paused_until: dateInput };
      }
      await api.put(`/subscriptions/${id}/${action}`, body);
      toast.success(`Subscription ${action}d successfully`);
      fetchSubs();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} subscription`);
    }
  };

  const filtered = subs.filter(s => {
    const matchSearch = s.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.plan_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.restaurant_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manage <span className="text-[#FF8C42]">Subscriptions</span></h1>
        <p className="text-gray-400 text-sm mt-1">{subs.length} total subscriptions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, plan..."
            className="w-full bg-[#1A1D24] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
        </div>
        <div className="flex gap-2">
          {['all','active','paused','cancelled','expired'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${filter === s ? 'bg-[#FF8C42] text-white' : 'bg-[#1A1D24] text-gray-400 border border-white/10 hover:border-[#FF8C42]/30'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF8C42]" /></div> : (
        <div className="bg-[#1A1D24] rounded-2xl border border-white/5 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead><tr className="border-b border-white/5">
              {['User','Restaurant','Plan','Start','End','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((s, idx) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{s.user_name}</p>
                    <p className="text-gray-500 text-xs">{s.user_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{s.restaurant_name}</td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm">{s.plan_name}</p>
                    <p className="text-gray-500 text-xs">₹{s.total_amount}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{s.start_date ? new Date(s.start_date).toLocaleDateString('en-IN') : '-'}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{s.end_date ? new Date(s.end_date).toLocaleDateString('en-IN') : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[s.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {s.status === 'active' && (
                        <button onClick={() => updateStatus(s.id, 'pause')} title="Pause"
                          className="p-1.5 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all">
                          <PauseCircle size={16} />
                        </button>
                      )}
                      {s.status === 'paused' && (
                        <button onClick={() => updateStatus(s.id, 'resume')} title="Resume"
                          className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg transition-all">
                          <PlayCircle size={16} />
                        </button>
                      )}
                      {(s.status === 'active' || s.status === 'paused') && (
                        <button onClick={() => updateStatus(s.id, 'cancel')} title="Cancel"
                          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No subscriptions found</div>}
        </div>
      )}
    </div>
  );
}

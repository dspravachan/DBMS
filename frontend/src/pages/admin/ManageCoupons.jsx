import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const EMPTY = { code:'', discount_type:'percent', discount_value:'', min_order_amount:'', max_discount:'', max_uses:'', expires_at:'', is_active:true };

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCoupons(); }, []);
  const fetchCoupons = async () => {
    try { const r = await api.get('/admin/coupons'); setCoupons(r.data.data || []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit = (c) => { setForm({...c, expires_at: c.expires_at ? c.expires_at.slice(0,10) : ''}); setEditing(c.id); setShowModal(true); };

  const handleSave = async () => {
    if (!form.code?.trim()) return toast.error('Coupon code is required');
    setSaving(true);
    try {
      if (editing) { await api.put(`/coupons/${editing}`, form); toast.success('Updated!'); }
      else { await api.post('/coupons', form); toast.success('Coupon created!'); }
      setShowModal(false); fetchCoupons();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete coupon?')) return;
    try { await api.delete(`/coupons/${id}`); toast.success('Deleted'); fetchCoupons(); }
    catch { toast.error('Failed'); }
  };

  const toggleActive = async (c) => {
    try {
      await api.put(`/admin/coupons/${c.id}/toggle`);
      fetchCoupons();
    } catch { toast.error('Failed to toggle coupon status'); }
  };

  const filtered = coupons.filter(c => c.code?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage <span className="text-[#FF8C42]">Coupons</span></h1>
          <p className="text-gray-400 text-sm mt-1">{coupons.length} coupons total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#FF8C42] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#FF7A2B] transition-colors">
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupons..."
          className="w-full bg-[#1A1D24] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF8C42]" /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, idx) => (
            <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.04 }}
              className={`bg-[#1A1D24] rounded-2xl p-5 border transition-all ${c.is_active ? 'border-[#FF8C42]/20' : 'border-white/5 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[#FF8C42] font-bold text-lg font-mono">{c.code}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {c.discount_type === 'percent' ? `${c.discount_value}% off` : `₹${c.discount_value} flat off`}
                  </p>
                </div>
                <button onClick={() => toggleActive(c)}>
                  {c.is_active ? <ToggleRight size={22} className="text-green-400" /> : <ToggleLeft size={22} className="text-gray-500" />}
                </button>
              </div>
              <div className="space-y-1 text-xs text-gray-400 mb-4">
                <p>Min order: ₹{c.min_order_amount || 0}</p>
                {c.max_discount && <p>Max discount: ₹{c.max_discount}</p>}
                <p>Used: {c.used_count}/{c.max_uses || '∞'}</p>
                {c.expires_at && <p>Expires: {new Date(c.expires_at).toLocaleDateString('en-IN')}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="flex-1 py-1.5 rounded-lg border border-blue-400/30 text-blue-400 text-xs flex items-center justify-center gap-1 hover:bg-blue-400/10 transition-all">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(c.id)} className="flex-1 py-1.5 rounded-lg border border-red-400/30 text-red-400 text-xs flex items-center justify-center gap-1 hover:bg-red-400/10 transition-all">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <div className="col-span-3 text-center py-12 text-gray-500">No coupons found</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1A1D24] rounded-2xl w-full max-w-md border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-white font-semibold">{editing ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Coupon Code</label>
                <input value={form.code || ''} onChange={e => setForm(p => ({...p, code: e.target.value.toUpperCase()}))}
                  placeholder="e.g. WELCOME20"
                  className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm font-mono uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Discount Type</label>
                  <select value={form.discount_type} onChange={e => setForm(p => ({...p, discount_type: e.target.value}))}
                    className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm">
                    <option value="percent">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Discount Value</label>
                  <input type="number" value={form.discount_value || ''} onChange={e => setForm(p => ({...p, discount_value: e.target.value}))}
                    className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['min_order_amount','Min Order (₹)'],['max_discount','Max Discount (₹)'],['max_uses','Max Uses']].map(([k,l]) => (
                  <div key={k}>
                    <label className="text-gray-400 text-xs mb-1 block">{l}</label>
                    <input type="number" value={form[k] || ''} onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
                      className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
                  </div>
                ))}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Expiry Date</label>
                  <input type="date" value={form.expires_at || ''} onChange={e => setForm(p => ({...p, expires_at: e.target.value}))}
                    className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#FF8C42] text-white font-semibold hover:bg-[#FF7A2B] text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={14} />{saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

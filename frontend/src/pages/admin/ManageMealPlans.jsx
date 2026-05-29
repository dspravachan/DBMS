import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const EMPTY = { plan_name:'', restaurant_id:'', plan_type:'weekly', meal_type:'veg', price:'', duration_days:'', meals_per_day:2, delivery_frequency:'daily', description:'', is_active:true };

export default function ManageMealPlans() {
  const [plans, setPlans] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/meal-plans'), api.get('/restaurants')])
      .then(([p, r]) => { setPlans(p.data.data || []); setRestaurants(r.data.data || []); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const fetchPlans = async () => { const r = await api.get('/meal-plans'); setPlans(r.data.data || []); };
  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit = (p) => { setForm({...p}); setEditing(p.id); setShowModal(true); };

  const handleSave = async () => {
    if (!form.plan_name?.trim() || !form.restaurant_id) return toast.error('Plan name and restaurant required');
    setSaving(true);
    try {
      if (editing) { await api.put(`/meal-plans/${editing}`, form); toast.success('Updated!'); }
      else { await api.post('/meal-plans', form); toast.success('Plan created!'); }
      setShowModal(false); fetchPlans();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meal plan?')) return;
    try { await api.delete(`/meal-plans/${id}`); toast.success('Deleted'); fetchPlans(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = plans.filter(p => p.plan_name?.toLowerCase().includes(search.toLowerCase()));
  const TYPE_BADGE = { weekly: 'bg-blue-500/20 text-blue-400', monthly: 'bg-purple-500/20 text-purple-400', custom: 'bg-gray-500/20 text-gray-400' };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage <span className="text-[#FF8C42]">Meal Plans</span></h1>
          <p className="text-gray-400 text-sm mt-1">{plans.length} plans total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#FF8C42] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#FF7A2B] transition-colors">
          <Plus size={18} /> Add Plan
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search meal plans..."
          className="w-full bg-[#1A1D24] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF8C42]" /></div> : (
        <div className="bg-[#1A1D24] rounded-2xl border border-white/5 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead><tr className="border-b border-white/5">
              {['Plan','Restaurant','Type','Meal','Price','Duration','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p, idx) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{p.plan_name}</p>
                    <p className="text-gray-500 text-xs">{p.meals_per_day} meals/day</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{p.restaurant_name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${TYPE_BADGE[p.plan_type] || 'bg-gray-500/20 text-gray-400'}`}>{p.plan_type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${p.meal_type === 'veg' ? 'bg-green-500/20 text-green-400' : p.meal_type === 'non-veg' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{p.meal_type}</span>
                  </td>
                  <td className="px-4 py-3 text-[#FF8C42] font-semibold text-sm">₹{p.price}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{p.duration_days} days</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No meal plans found</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1A1D24] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-white font-semibold">{editing ? 'Edit Meal Plan' : 'Add Meal Plan'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Restaurant</label>
                <select value={form.restaurant_id || ''} onChange={e => setForm(p => ({...p,restaurant_id:e.target.value}))}
                  className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm">
                  <option value="">Select restaurant</option>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Plan Name</label>
                <input value={form.plan_name || ''} onChange={e => setForm(p => ({...p,plan_name:e.target.value}))}
                  className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Plan Type</label>
                  <select value={form.plan_type} onChange={e => setForm(p => ({...p,plan_type:e.target.value}))}
                    className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm">
                    <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Meal Type</label>
                  <select value={form.meal_type} onChange={e => setForm(p => ({...p,meal_type:e.target.value}))}
                    className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm">
                    <option value="veg">Veg</option><option value="non-veg">Non-Veg</option><option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['price','Price (₹)','number'],['duration_days','Duration (days)','number'],['meals_per_day','Meals/Day','number']].map(([k,l,t]) => (
                  <div key={k}>
                    <label className="text-gray-400 text-xs mb-1 block">{l}</label>
                    <input type={t} value={form[k] || ''} onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
                      className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Description</label>
                <textarea value={form.description || ''} onChange={e => setForm(p => ({...p,description:e.target.value}))} rows={3}
                  className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm resize-none" />
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

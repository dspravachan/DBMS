import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const EMPTY = { name:'', description:'', price:'', category:'', restaurant_id:'', image_url:'', calories:'', is_veg:true, is_popular:false, is_available:true };

export default function ManageFoods() {
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/foods'), api.get('/restaurants')])
      .then(([f, r]) => { setFoods(f.data.data || []); setRestaurants(r.data.data || []); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const fetchFoods = async () => {
    const r = await api.get('/foods'); setFoods(r.data.data || []);
  };

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit = (f) => { setForm({...f}); setEditing(f.id); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.restaurant_id) return toast.error('Name and restaurant are required');
    setSaving(true);
    try {
      if (editing) { await api.put(`/foods/${editing}`, form); toast.success('Updated!'); }
      else { await api.post('/foods', form); toast.success('Food added!'); }
      setShowModal(false); fetchFoods();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food?')) return;
    try { await api.delete(`/foods/${id}`); toast.success('Deleted'); fetchFoods(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = foods.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()) || f.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage <span className="text-[#FF8C42]">Foods</span></h1>
          <p className="text-gray-400 text-sm mt-1">{foods.length} items total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#FF8C42] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#FF7A2B] transition-colors">
          <Plus size={18} /> Add Food
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search foods..."
          className="w-full bg-[#1A1D24] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF8C42]" /></div> : (
        <div className="bg-[#1A1D24] rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {['Food','Category','Price','Calories','Type','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((f, idx) => (
                <motion.tr key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={f.image_url || '/images/food_butter_chicken.png'} alt={f.name} className="w-10 h-10 rounded-lg object-cover" onError={e => e.target.src='/images/food_butter_chicken.png'} />
                      <div>
                        <p className="text-white text-sm font-medium">{f.name}</p>
                        <p className="text-gray-500 text-xs">{f.restaurant_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{f.category}</td>
                  <td className="px-4 py-3 text-[#FF8C42] font-semibold text-sm">₹{f.price}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{f.calories} kcal</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${f.is_veg ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {f.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${f.is_available ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {f.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(f)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(f.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No foods found</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1A1D24] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-white font-semibold">{editing ? 'Edit Food' : 'Add Food'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Restaurant</label>
                <select value={form.restaurant_id || ''} onChange={e => setForm(p => ({...p, restaurant_id: e.target.value}))}
                  className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm">
                  <option value="">Select restaurant</option>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              {[['name','Name','text'],['category','Category','text'],['price','Price (₹)','number'],['calories','Calories','number'],['image_url','Image URL','url']].map(([k,l,t]) => (
                <div key={k}>
                  <label className="text-gray-400 text-xs mb-1 block">{l}</label>
                  <input type={t} value={form[k] || ''} onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
                    className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
                </div>
              ))}
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Description</label>
                <textarea value={form.description || ''} onChange={e => setForm(p => ({...p,description:e.target.value}))} rows={2}
                  className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm resize-none" />
              </div>
              <div className="flex gap-4">
                {[['is_veg','Vegetarian'],['is_popular','Popular'],['is_available','Available']].map(([k,l]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form[k]} onChange={e => setForm(p => ({...p,[k]:e.target.checked}))} className="w-4 h-4 accent-[#FF8C42]" />
                    <span className="text-gray-300 text-sm">{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white transition-colors text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#FF8C42] text-white font-semibold hover:bg-[#FF7A2B] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={14} />{saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

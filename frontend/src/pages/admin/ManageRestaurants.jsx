import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const EMPTY = { name: '', description: '', cuisine_type: '', address: '', city: '', image_url: '', delivery_time: 30, min_order: 100, owner_name: '' };

export default function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRestaurants(); }, []);

  const fetchRestaurants = async () => {
    try {
      // Use admin endpoint — returns ALL restaurants (active + inactive)
      // The public GET /restaurants only returns is_active=TRUE, causing
      // toggling inactive to look like deletion
      const r = await api.get('/admin/restaurants');
      setRestaurants(r.data.data || []);
    }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit = (r) => { setForm({ ...r }); setEditing(r.id); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name?.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editing) { await api.put(`/restaurants/${editing}`, form); toast.success('Updated!'); }
      else { await api.post('/restaurants', form); toast.success('Restaurant added!'); }
      setShowModal(false); fetchRestaurants();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this restaurant? This cannot be undone. (If it has orders, deletion may fail.)')) return;
    try { await api.delete(`/restaurants/${id}`); toast.success('Restaurant deleted'); fetchRestaurants(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const toggleActive = async (r) => {
    try {
      await api.put(`/admin/restaurants/${r.id}/toggle`);
      toast.success(`Restaurant ${r.is_active ? 'deactivated' : 'activated'}`);
      fetchRestaurants();
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = restaurants.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()) || r.city?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage <span className="text-[#FF8C42]">Restaurants</span></h1>
          <p className="text-gray-400 text-sm mt-1">{restaurants.length} restaurants total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#FF8C42] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#FF7A2B] transition-colors">
          <Plus size={18} /> Add Restaurant
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants..."
          className="w-full bg-[#1A1D24] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF8C42]" /></div> : (
        <div className="bg-[#1A1D24] rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {['Restaurant', 'Cuisine', 'City', 'Rating', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((r, idx) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={r.image_url || '/images/restaurant_indian.png'} alt={r.name}
                        className="w-10 h-10 rounded-lg object-cover" onError={e => e.target.src = '/images/restaurant_indian.png'} />
                      <div>
                        <p className="text-white text-sm font-medium">{r.name}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[150px]">{r.owner_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{r.cuisine_type}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{r.city}</td>
                  <td className="px-4 py-3 text-yellow-400 text-sm">★ {parseFloat(r.rating || 0).toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(r)} title={r.is_active ? 'Click to deactivate' : 'Click to activate'}
                        className="flex items-center gap-1.5 transition-colors">
                        {r.is_active
                          ? <ToggleRight size={28} className="text-green-400" />
                          : <ToggleLeft size={28} className="text-gray-500" />}
                      </button>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        r.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No restaurants found</div>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1A1D24] rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-white font-semibold">{editing ? 'Edit Restaurant' : 'Add Restaurant'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[['name','Name','text'],['cuisine_type','Cuisine Type','text'],['address','Address','text'],['city','City','text'],['image_url','Image URL','url'],['owner_name','Owner Name','text'],['delivery_time','Delivery Time (min)','number'],['min_order','Min Order (₹)','number']].map(([k,l,t]) => (
                <div key={k}>
                  <label className="text-gray-400 text-xs mb-1 block">{l}</label>
                  <input type={t} value={form[k] || ''} onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
                    className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
                </div>
              ))}
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Description</label>
                <textarea value={form.description || ''} onChange={e => setForm(p => ({...p,description:e.target.value}))} rows={3}
                  className="w-full bg-[#22252E] text-white rounded-xl px-4 py-2.5 border border-white/10 focus:border-[#FF8C42] outline-none text-sm resize-none" />
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

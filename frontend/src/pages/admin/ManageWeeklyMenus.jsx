import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const EMPTY_DAY = { breakfast_name:'', lunch_name:'', dinner_name:'', breakfast_calories:'', lunch_calories:'', dinner_calories:'', description:'' };

export default function ManageWeeklyMenus() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [menu, setMenu] = useState(Object.fromEntries(DAYS.map(d => [d, {...EMPTY_DAY}])));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingMenu, setExistingMenu] = useState([]);

  useEffect(() => { api.get('/meal-plans').then(r => setPlans(r.data.data || [])).catch(() => {}); }, []);

  useEffect(() => {
    if (!selectedPlan) return;
    setLoading(true);
    api.get(`/weekly-menu?meal_plan_id=${selectedPlan}`)
      .then(r => {
        const data = r.data.data || [];
        setExistingMenu(data);
        const merged = Object.fromEntries(DAYS.map(d => [d, {...EMPTY_DAY}]));
        data.forEach(row => { if (merged[row.day_of_week]) merged[row.day_of_week] = { breakfast_name: row.breakfast_name||'', lunch_name: row.lunch_name||'', dinner_name: row.dinner_name||'', breakfast_calories: row.breakfast_calories||'', lunch_calories: row.lunch_calories||'', dinner_calories: row.dinner_calories||'', description: row.description||'', id: row.id }; });
        setMenu(merged);
      })
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, [selectedPlan]);

  const handleChange = (day, field, value) => setMenu(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));

  const handleSave = async () => {
    if (!selectedPlan) return toast.error('Select a meal plan first');
    setSaving(true);
    try {
      for (const day of DAYS) {
        const entry = menu[day];
        if (!entry.breakfast_name && !entry.lunch_name && !entry.dinner_name) continue;
        const payload = { meal_plan_id: selectedPlan, day_of_week: day, ...entry, restaurant_id: plans.find(p => p.id === selectedPlan)?.restaurant_id };
        if (entry.id) await api.put(`/weekly-menu/${entry.id}`, payload);
        else await api.post('/weekly-menu', payload);
      }
      toast.success('Weekly menu saved! 🎉');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage <span className="text-[#FF8C42]">Weekly Menus</span></h1>
          <p className="text-gray-400 text-sm mt-1">Set daily meals for each plan</p>
        </div>
        <button onClick={handleSave} disabled={saving || !selectedPlan}
          className="flex items-center gap-2 bg-[#FF8C42] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#FF7A2B] transition-colors disabled:opacity-50">
          <Save size={18} />{saving ? 'Saving...' : 'Save Menu'}
        </button>
      </div>

      {/* Plan Selector */}
      <div className="relative mb-6 max-w-sm">
        <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}
          className="w-full bg-[#1A1D24] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-[#FF8C42] outline-none text-sm appearance-none cursor-pointer">
          <option value="">Select a Meal Plan</option>
          {plans.map(p => <option key={p.id} value={p.id}>{p.plan_name} — {p.restaurant_name}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF8C42]" /></div> : selectedPlan ? (
        <div className="space-y-4">
          {DAYS.map((day, idx) => (
            <motion.div key={day} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-[#1A1D24] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-[#22252E] border-b border-white/5">
                <div className="w-8 h-8 bg-[#FF8C42]/10 rounded-lg flex items-center justify-center">
                  <span className="text-[#FF8C42] text-xs font-bold">{day.slice(0,3)}</span>
                </div>
                <h3 className="text-white font-semibold">{day}</h3>
                {menu[day]?.id && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Saved</span>}
              </div>
              <div className="p-4 grid sm:grid-cols-3 gap-4">
                {[['breakfast','🌅 Breakfast'],['lunch','☀️ Lunch'],['dinner','🌙 Dinner']].map(([meal, label]) => (
                  <div key={meal} className="space-y-2">
                    <p className="text-gray-400 text-xs font-medium">{label}</p>
                    <input value={menu[day][`${meal}_name`] || ''} onChange={e => handleChange(day, `${meal}_name`, e.target.value)}
                      placeholder={`${meal} meal name`}
                      className="w-full bg-[#22252E] text-white rounded-xl px-3 py-2 border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
                    <input type="number" value={menu[day][`${meal}_calories`] || ''} onChange={e => handleChange(day, `${meal}_calories`, e.target.value)}
                      placeholder="Calories (kcal)"
                      className="w-full bg-[#22252E] text-gray-300 rounded-xl px-3 py-2 border border-white/10 focus:border-[#FF8C42] outline-none text-xs" />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-500">
          <p className="text-lg">Select a meal plan to manage its weekly menu</p>
        </div>
      )}
    </div>
  );
}

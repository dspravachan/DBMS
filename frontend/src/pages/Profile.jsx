import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [membership, setMembership] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', address: user.address || '' });
    api.get('/memberships/my').then(r => setMembership(r.data.data)).catch(() => {});
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.data);   // only refreshes user data — token stays intact
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'MM';
  const GRADIENT_COLORS = ['from-orange-500 to-red-500', 'from-purple-500 to-blue-500', 'from-green-500 to-teal-500'];
  const color = GRADIENT_COLORS[user?.id?.charCodeAt(0) % 3 || 0];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#0F1115] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">My <span className="text-[#FF8C42]">Profile</span></h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Avatar & Quick Info */}
          <div className="space-y-4">
            <div className="bg-[#1A1D24] rounded-2xl p-6 border border-white/5 text-center">
              <div className={`w-24 h-24 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4`}>
                {initials}
              </div>
              <h2 className="text-white font-bold text-xl">{user?.name}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-[#FF8C42]/20 text-[#FF8C42]'}`}>
                {user?.role === 'admin' ? '⚡ Admin' : '👤 User'}
              </span>
            </div>

            {/* Membership */}
            {membership ? (
              <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-2xl p-5 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={18} className="text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{membership.name} Member</span>
                </div>
                <p className="text-gray-400 text-xs">Expires: {new Date(membership.end_date).toLocaleDateString('en-IN')}</p>
              </div>
            ) : (
              <button onClick={() => navigate('/membership')}
                className="w-full bg-[#1A1D24] rounded-2xl p-5 border border-[#FF8C42]/20 text-center hover:border-[#FF8C42]/50 transition-colors">
                <Crown size={24} className="text-[#FF8C42] mx-auto mb-2" />
                <p className="text-white font-medium text-sm">Get Membership</p>
                <p className="text-gray-500 text-xs">Unlock perks & discounts</p>
              </button>
            )}

            {/* Quick Links */}
            <div className="bg-[#1A1D24] rounded-2xl border border-white/5 overflow-hidden">
              {[
                { label: 'My Orders', path: '/orders' },
                { label: 'Subscriptions', path: '/my-subscriptions' },
                { label: 'Wallet', path: '/wallet' },
                { label: 'Wishlist', path: '/wishlist' },
              ].map(link => (
                <button key={link.path} onClick={() => navigate(link.path)}
                  className="w-full px-5 py-3.5 text-left text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm border-b border-white/5 last:border-0 flex justify-between items-center">
                  {link.label} <span className="text-gray-600">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Edit Form */}
          <div className="md:col-span-2">
            <div className="bg-[#1A1D24] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Personal Information</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-2 text-[#FF8C42] text-sm hover:text-[#FF7A2B] transition-colors">
                    <Edit2 size={15} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={16} /></button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1.5 bg-[#FF8C42] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#FF7A2B] transition-colors disabled:opacity-50">
                      <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Full Name', icon: User, type: 'text' },
                  { key: 'email', label: 'Email', icon: Mail, type: 'email' },
                  { key: 'phone', label: 'Phone', icon: Phone, type: 'tel' },
                ].map(({ key, label, icon: Icon, type }) => (
                  <div key={key}>
                    <label className="text-gray-400 text-xs mb-1.5 block">{label}</label>
                    <div className="relative">
                      <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        disabled={!editing}
                        className="w-full bg-[#22252E] text-white rounded-xl pl-9 pr-4 py-3 border border-white/10 focus:border-[#FF8C42] outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors" />
                    </div>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-xs mb-1.5 block">Default Address</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3.5 text-gray-500" />
                    <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                      disabled={!editing} rows={3}
                      className="w-full bg-[#22252E] text-white rounded-xl pl-9 pr-4 py-3 border border-white/10 focus:border-[#FF8C42] outline-none text-sm resize-none disabled:opacity-60 disabled:cursor-not-allowed transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

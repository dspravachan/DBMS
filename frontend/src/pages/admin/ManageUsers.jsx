import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Crown, Shield, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const MEMBERSHIP_STYLES = {
  Silver:   { bg: 'bg-gray-500/20',   text: 'text-gray-300',  icon: '🥈' },
  Gold:     { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: '🥇' },
  Platinum: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: '💎' },
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = () => {
    api.get('/admin/users')
      .then(r => setUsers(r.data.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleStatus = async (u) => {
    try {
      await api.put(`/admin/users/${u.id}/toggle`);
      toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const COLORS = ['bg-orange-500','bg-purple-500','bg-blue-500','bg-green-500','bg-red-500','bg-yellow-500'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manage <span className="text-[#FF8C42]">Users</span></h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} registered users</p>
      </div>

      {/* Search + Role Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-[#1A1D24] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-[#FF8C42] outline-none text-sm" />
        </div>
        <div className="flex gap-2">
          {['all','user','admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                roleFilter === r ? 'bg-[#FF8C42] text-white' : 'bg-[#1A1D24] text-gray-400 border border-white/10'
              }`}>{r}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#FF8C42]" />
        </div>
      ) : (
        <div className="bg-[#1A1D24] rounded-2xl border border-white/5 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5">
                {['User','Email','Role','Membership','Wallet','Orders / Subs','Status','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-400 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u, idx) => {
                const memStyle = MEMBERSHIP_STYLES[u.membership_name] || null;
                return (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                    className="hover:bg-white/2 transition-colors">

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 ${COLORS[idx % COLORS.length]} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {initials(u.name)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{u.name}</p>
                          <p className="text-gray-500 text-xs">{u.phone || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-gray-300 text-sm max-w-[180px] truncate">{u.email}</td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit font-medium ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {u.role === 'admin' ? <Shield size={10} /> : null}
                        {u.role}
                      </span>
                    </td>

                    {/* Membership */}
                    <td className="px-4 py-3">
                      {memStyle ? (
                        <div>
                          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit font-medium ${memStyle.bg} ${memStyle.text}`}>
                            <Crown size={10} /> {memStyle.icon} {u.membership_name}
                          </span>
                          {u.membership_end_date && (
                            <p className="text-gray-600 text-xs mt-0.5 pl-1">
                              Expires: {new Date(u.membership_end_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">No Membership</span>
                      )}
                    </td>

                    {/* Wallet */}
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      ₹{parseFloat(u.wallet_balance || 0).toFixed(0)}
                    </td>

                    {/* Orders / Subs */}
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      <span className="block">{u.total_orders} orders</span>
                      <span className="block">{u.total_subscriptions} subs</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleStatus(u)}
                          title={u.is_active ? 'Deactivate user' : 'Activate user'}
                          className={`p-1.5 rounded-lg transition-all ${
                            u.is_active
                              ? 'text-red-400 hover:bg-red-400/10'
                              : 'text-green-400 hover:bg-green-400/10'
                          }`}>
                          {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}

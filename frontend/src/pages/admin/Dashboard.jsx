import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Store, ShoppingBag, TrendingUp, Star, Package, Calendar, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api/axios';

const COLORS = ['#FF8C42', '#FF5F1F', '#FFB347', '#FF6B35', '#E07B39'];

const KPICard = ({ title, value, icon: Icon, change, color = 'text-[#FF8C42]', bg = 'bg-[#FF8C42]/10' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-[#1A1D24] rounded-2xl p-5 border border-white/5 hover:border-[#FF8C42]/20 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon size={22} className={color} />
      </div>
      {change !== undefined && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      )}
    </div>
    <p className="text-gray-400 text-sm mb-1">{title}</p>
    <p className="text-white text-2xl font-bold">{value}</p>
  </motion.div>
);

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(r => setAnalytics(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#0F1115]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF8C42]" />
    </div>
  );

  const revenueData = (analytics?.revenue_by_month || []).map(d => ({
    month: d.month_label || d.month,
    revenue: parseFloat(d.revenue) || 0,
  }));
  if (revenueData.length === 0) revenueData.push(
    { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 61000 }, { month: 'Apr', revenue: 58000 },
    { month: 'May', revenue: 74000 }, { month: 'Jun', revenue: 82000 }
  );

  const subGrowth = (analytics?.subscription_growth || []).map(d => ({
    month: d.month_label || d.month,
    // Backend returns new_subscriptions (not 'count')
    count: parseInt(d.new_subscriptions) || 0,
  }));
  if (subGrowth.length === 0) subGrowth.push(
    { month: 'Jan', count: 12 }, { month: 'Feb', count: 18 },
    { month: 'Mar', count: 24 }, { month: 'Apr', count: 31 },
    { month: 'May', count: 39 }, { month: 'Jun', count: 48 }
  );

  // Real membership distribution from DB (Silver/Gold/Platinum with actual user counts)
  const rawDist = analytics?.plan_distribution || [];
  const planDist = rawDist.length > 0
    ? rawDist.map(d => ({ name: d.name, value: parseInt(d.value) || 0 }))
    : [
        { name: 'Silver', value: 0 },
        { name: 'Gold', value: 0 },
        { name: 'Platinum', value: 0 },
      ];

  const tooltipStyle = { backgroundColor: '#1A1D24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard <span className="text-[#FF8C42]">Overview</span></h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back, Admin 👋</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Users" value={analytics?.total_users?.toLocaleString() ?? '—'} icon={Users} change={12} />
        <KPICard title="Active Subscriptions" value={analytics?.active_subscriptions?.toLocaleString() ?? '—'} icon={Calendar} change={8} bg="bg-purple-500/10" color="text-purple-400" />
        <KPICard title="Total Restaurants" value={analytics?.total_restaurants ?? '—'} icon={Store} change={5} bg="bg-blue-500/10" color="text-blue-400" />
        {/* monthly_revenue now comes from DB */}
        <KPICard title="Monthly Revenue" value={analytics ? `₹${analytics.monthly_revenue?.toLocaleString()}` : '—'} icon={DollarSign} change={15} bg="bg-green-500/10" color="text-green-400" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Today's Deliveries" value={analytics?.daily_deliveries ?? '—'} icon={Package} bg="bg-orange-500/10" color="text-orange-400" />
        <KPICard title="Total Orders" value={analytics?.total_orders?.toLocaleString() ?? '—'} icon={ShoppingBag} change={10} bg="bg-red-500/10" color="text-red-400" />
        {/* avg_rating now comes from DB restaurants table */}
        <KPICard title="Avg Rating" value={analytics ? `${analytics.avg_rating} ★` : '—'} icon={Star} bg="bg-yellow-500/10" color="text-yellow-400" />
        <KPICard title="Total Revenue" value={analytics ? `₹${analytics.total_revenue?.toLocaleString()}` : '—'} icon={TrendingUp} change={22} bg="bg-teal-500/10" color="text-teal-400" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1D24] rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Revenue Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#FF8C42" strokeWidth={2.5} dot={{ fill: '#FF8C42', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1A1D24] rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Subscription Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [v, 'Subscriptions']} />
              <Bar dataKey="count" fill="#FF8C42" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-[#1A1D24] rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={planDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                {planDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {planDist.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-gray-400 flex-1">{item.name}</span>
                <span className="text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Meal Plans */}
        <div className="lg:col-span-2 bg-[#1A1D24] rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Top Meal Plans by Subscriptions</h3>
          <div className="space-y-3">
            {(analytics?.top_meal_plans || [
              { plan_name: 'Monthly Healthy Diet', restaurant_name: 'Green Bowl Co.', subscription_count: 142 },
              { plan_name: 'Office Lunch Combo', restaurant_name: 'SpiceCraft', subscription_count: 98 },
              { plan_name: 'Student Budget Pack', restaurant_name: 'QuickBites', subscription_count: 76 },
              { plan_name: 'Protein Warrior Plan', restaurant_name: 'FitFuel Kitchen', subscription_count: 64 },
            ]).slice(0, 5).map((plan, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#FF8C42]/10 flex items-center justify-center text-[#FF8C42] text-sm font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{plan.plan_name}</p>
                  <p className="text-gray-500 text-xs">{plan.restaurant_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">{plan.subscription_count}</p>
                  <p className="text-gray-500 text-xs">subscribers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

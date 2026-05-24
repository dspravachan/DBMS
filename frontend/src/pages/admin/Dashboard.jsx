import React, { useEffect, useState } from 'react';
import { Users, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { adminService } from '../../services/endpoints';
import { formatPrice } from '../../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: formatPrice(stats?.total_revenue || 0), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Dishes', value: stats?.total_products || 0, icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Welcome to FoodieExpress Admin</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-8">
          Manage your menu items, view orders, create discount coupons, and monitor your restaurant's performance from this dashboard.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/admin/products" className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors">
            Manage Menu
          </a>
          <a href="/admin/orders" className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors">
            View Recent Orders
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

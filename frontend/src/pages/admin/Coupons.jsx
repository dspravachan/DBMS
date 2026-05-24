import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { couponService } from '../../services/endpoints';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '', discount_type: 'percent', discount_value: '', min_order_amount: '0', expiry_date: ''
  });

  const fetchCoupons = async () => {
    try {
      const { data } = await couponService.getAll();
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openModal = () => {
    setFormData({ code: '', discount_type: 'percent', discount_value: '', min_order_amount: '0', expiry_date: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: parseFloat(formData.min_order_amount),
        expiry_date: new Date(formData.expiry_date).toISOString(),
        is_active: true
      };

      await couponService.create(payload);
      toast.success('Coupon created');
      closeModal();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponService.delete(id);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  if (loading) return <div className="h-64 skeleton rounded-3xl"></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Manage Coupons</h1>
        <button 
          onClick={openModal}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => {
          const isExpired = new Date(coupon.expiry_date) < new Date();
          return (
            <div key={coupon.id} className={`bg-white rounded-2xl p-6 border shadow-sm relative ${isExpired || !coupon.is_active ? 'border-red-100 opacity-75' : 'border-emerald-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isExpired || !coupon.is_active ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {isExpired ? 'Expired' : !coupon.is_active ? 'Inactive' : 'Active'}
                </div>
                <button onClick={() => handleDelete(coupon.id)} className="text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h3 className="text-2xl font-bold font-mono text-slate-900 mb-2">{coupon.code}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount:</span>
                  <span className="font-semibold text-slate-900">
                    {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Min Order:</span>
                  <span className="font-semibold text-slate-900">₹{coupon.min_order_amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Expires:</span>
                  <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatDate(coupon.expiry_date)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {coupons.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500">No coupons found. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Coupon</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Coupon Code</label>
                <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-primary focus:border-primary uppercase font-mono" placeholder="SUMMER25" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select required value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-primary focus:border-primary">
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
                  <input type="number" step="0.01" required value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-primary focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Order Amount (₹)</label>
                <input type="number" step="0.01" value={formData.min_order_amount} onChange={e => setFormData({...formData, min_order_amount: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-primary focus:border-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                <input type="datetime-local" required value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-primary focus:border-primary" />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;

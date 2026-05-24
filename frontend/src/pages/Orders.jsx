import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Download } from 'lucide-react';
import { orderService, invoiceService } from '../services/endpoints';
import { formatDate, formatPrice } from '../utils/formatters';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await orderService.getAll();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-amber-100 text-amber-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${statusClasses[status] || 'bg-slate-100 text-slate-800'}`}>
        {status}
      </span>
    );
  };

  const handleDownloadInvoice = async (orderId, e) => {
    e.preventDefault(); // Prevent navigating to order details
    e.stopPropagation();
    try {
      const response = await invoiceService.download(orderId);
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Order History</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 skeleton"></div>)}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
          <Package size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">No orders yet</h2>
        <p className="text-slate-500 mb-8">When you place orders, they will appear here.</p>
        <Link to="/products" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Order History</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Link 
            to={`/orders/${order.id}`} 
            key={order.id}
            className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">Order #{order.id}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-slate-500">Placed on {formatDate(order.created_at)}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                    <p className="font-bold text-slate-900">{formatPrice(order.final_amount)}</p>
                  </div>
                  <button 
                    onClick={(e) => handleDownloadInvoice(order.id, e)}
                    className="p-2 text-slate-400 hover:text-primary bg-slate-50 hover:bg-primary/10 rounded-lg transition-colors tooltip-trigger relative"
                    title="Download Invoice"
                  >
                    <Download size={20} />
                  </button>
                  <div className="p-2 text-slate-300 group-hover:text-primary transition-colors">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-6">
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 flex-shrink-0 bg-slate-50 p-2 pr-4 rounded-xl border border-slate-100">
                      <img 
                        src={item.product?.image_url || 'https://via.placeholder.com/48'} 
                        alt={item.product?.name}
                        className="w-12 h-12 object-cover rounded-lg bg-white"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900 line-clamp-1 w-32">{item.product?.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 text-sm font-medium border border-slate-200">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;

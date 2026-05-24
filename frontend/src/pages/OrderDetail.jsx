import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { orderService, invoiceService } from '../services/endpoints';
import { formatDate, formatPrice } from '../utils/formatters';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await orderService.getById(id);
        setOrder(data);
      } catch (error) {
        toast.error('Failed to fetch order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handleDownloadInvoice = async () => {
    try {
      const response = await invoiceService.download(order.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order.id}.pdf`);
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
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 rounded-3xl"></div>
          <div className="h-40 bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statuses = [
    { id: 'pending', icon: Clock, label: 'Order Placed' },
    { id: 'processing', icon: Package, label: 'Processing' },
    { id: 'shipped', icon: Truck, label: 'Shipped' },
    { id: 'delivered', icon: CheckCircle, label: 'Delivered' }
  ];

  const currentStatusIndex = order.status === 'cancelled' 
    ? -1 
    : statuses.findIndex(s => s.id === order.status);

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link 
          to="/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Order #{order.id}</h1>
              <p className="text-slate-500">Placed on {formatDate(order.created_at)}</p>
            </div>
            
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full font-medium transition-colors"
            >
              <Download size={18} />
              Download Invoice
            </button>
          </div>

          {/* Order Timeline */}
          {order.status === 'cancelled' ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-red-800">Order Cancelled</h3>
              <p className="text-red-600 mt-1">This order was cancelled and will not be fulfilled.</p>
            </div>
          ) : (
            <div className="relative py-8">
              {/* Timeline Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full hidden sm:block"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full hidden sm:block transition-all duration-500"
                style={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%` }}
              ></div>

              <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-8 sm:gap-0">
                {statuses.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-300
                        ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}
                        ${isCurrent ? 'ring-4 ring-emerald-100' : ''}
                      `}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Items */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Items Ordered</h2>
              <ul className="space-y-6">
                {order.items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <img 
                      src={item.product?.image_url || 'https://via.placeholder.com/80'} 
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-xl border border-slate-100 bg-slate-50"
                    />
                    <div className="flex-1 flex justify-between">
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">
                          <Link to={`/products/${item.product_id}`} className="hover:text-primary">
                            {item.product?.name}
                          </Link>
                        </p>
                        <p className="text-sm text-slate-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-slate-900">{formatPrice(item.unit_price * item.quantity)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Summary</h2>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{formatPrice(order.total_amount)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount {order.coupon && `(${order.coupon.code})`}</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
              </div>
              <hr className="border-slate-100 mb-6" />
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-extrabold text-primary">{formatPrice(order.final_amount)}</span>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Shipping To</h2>
              <p className="font-medium text-slate-900">John Doe</p>
              <p className="text-slate-500 mt-1 text-sm">123 Tech Park, Phase 1</p>
              <p className="text-slate-500 text-sm">Bangalore, Karnataka 560001</p>
              <p className="text-slate-500 mt-2 text-sm">+91 9876543210</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md flex">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col animate-slide-in">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag size={24} className="text-primary" />
              Your Cart
            </h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.items?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <ShoppingBag size={48} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Your cart is empty</h3>
                  <p className="text-sm text-slate-500 mt-1">Looks like you haven't added anything yet.</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {cart.items?.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100">
                      <img
                        src={item.product.image_url || 'https://via.placeholder.com/150'}
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-slate-900">
                          <h3 className="line-clamp-2 pr-4"><Link to={`/products/${item.product.id}`}>{item.product.name}</Link></h3>
                          <p className="ml-4 whitespace-nowrap">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{item.product.category?.name}</p>
                      </div>
                      
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={loading || item.quantity <= 1}
                            className="p-1.5 text-slate-500 hover:text-primary disabled:opacity-50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={loading || item.quantity >= item.product.stock}
                            className="p-1.5 text-slate-500 hover:text-primary disabled:opacity-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer / Summary */}
          {cart.items?.length > 0 && (
            <div className="border-t border-slate-100 p-6 bg-slate-50">
              <div className="flex justify-between text-base font-medium text-slate-900 mb-4">
                <p>Subtotal</p>
                <p>{formatPrice(cart.total)}</p>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCheckout}
                  className="flex w-full items-center justify-center rounded-xl border border-transparent bg-primary px-6 py-3.5 text-base font-medium text-white shadow-sm hover:bg-primary-dark transition-colors"
                >
                  Checkout
                </button>
              </div>
              <div className="mt-4 flex justify-center text-center text-sm text-slate-500">
                <p>
                  or{' '}
                  <button
                    type="button"
                    className="font-medium text-primary hover:text-primary-dark"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Browse Menu
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;

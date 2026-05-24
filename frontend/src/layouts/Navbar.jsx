import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, User, LogOut, Menu, X, Package, ShieldCheck } from 'lucide-react';
import CartDrawer from '../components/CartDrawer';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cart, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold">
                  S
                </div>
                <span className="font-bold text-xl tracking-tight hidden sm:block">
                  Shop<span className="text-primary">Vista</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/products" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                Shop All
              </Link>
              <Link to="/products?category=electronics" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                Electronics
              </Link>
              <Link to="/products?category=clothing" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                Clothing
              </Link>
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                      <ShieldCheck size={18} />
                      <span>Admin</span>
                    </Link>
                  )}
                  
                  <Link to="/orders" className="text-slate-600 hover:text-primary transition-colors">
                    <Package size={20} />
                  </Link>
                  
                  <Link to="/wishlist" className="text-slate-600 hover:text-primary transition-colors">
                    <Heart size={20} />
                  </Link>

                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative text-slate-600 hover:text-primary transition-colors"
                  >
                    <ShoppingCart size={20} />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </button>

                  <div className="relative group">
                    <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <User size={16} />
                      </div>
                    </button>
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                      <div className="p-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                    Log in
                  </Link>
                  <Link to="/register" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-colors">
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-4">
              {isAuthenticated && (
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative text-slate-600"
                >
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-slate-900 hover:bg-slate-50">Shop All</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/orders" className="block px-3 py-2 rounded-md text-base font-medium text-slate-900 hover:bg-slate-50">Orders</Link>
                  <Link to="/wishlist" className="block px-3 py-2 rounded-md text-base font-medium text-slate-900 hover:bg-slate-50">Wishlist</Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-indigo-50">Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-900 hover:bg-slate-50">Login</Link>
                  <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-indigo-50">Sign up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Cart Drawer is mounted here at the layout level */}
      {isAuthenticated && <CartDrawer />}
    </>
  );
};

export default Navbar;

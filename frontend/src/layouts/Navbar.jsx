import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, User, LogOut, Menu, X, Package, ShieldCheck, UtensilsCrossed } from 'lucide-react';
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
      <div className="fixed top-0 inset-x-0 z-50 p-4 transition-all duration-300 pointer-events-none">
        <nav className="max-w-7xl mx-auto glass-card rounded-2xl pointer-events-auto transition-all duration-300">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-105 transition-all duration-300">
                  <UtensilsCrossed size={18} />
                </div>
                <span className="font-extrabold text-2xl tracking-tight hidden sm:block text-slate-900 group-hover:text-primary transition-colors">
                  Foodie<span className="text-primary text-gradient">Express</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/products" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200">
                Full Menu
              </Link>
              <Link to="/products?category=burgers" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200">
                Burgers
              </Link>
              <Link to="/products?category=pizza" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200">
                Pizza
              </Link>
              <Link to="/products?category=drinks" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200">
                Drinks
              </Link>
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/5 transition-all">
                      <ShieldCheck size={18} />
                      <span>Admin</span>
                    </Link>
                  )}
                  
                  <Link to="/orders" className="p-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-full transition-all" title="My Orders">
                    <Package size={20} />
                  </Link>
                  
                  <Link to="/wishlist" className="p-2 text-slate-600 hover:text-accent hover:bg-accent/5 rounded-full transition-all" title="Wishlist">
                    <Heart size={20} />
                  </Link>

                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                  >
                    <ShoppingCart size={20} />
                    {cartItemCount > 0 && (
                      <span className="absolute 0 right-0 bg-accent text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                        {cartItemCount}
                      </span>
                    )}
                  </button>

                  <div className="relative group ml-2">
                    <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors focus:outline-none">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 border border-primary/10 flex items-center justify-center text-primary transform group-hover:scale-105 transition-all">
                        <User size={18} />
                      </div>
                    </button>
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right translate-y-2 group-hover:translate-y-0">
                      <div className="p-4 border-b border-slate-100/50 bg-slate-50/50 rounded-t-2xl">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                  <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary px-4 py-2 rounded-full hover:bg-slate-50 transition-colors">
                    Log in
                  </Link>
                  <Link to="/register" className="text-sm font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-primary transition-colors shadow-lg shadow-slate-900/20 btn-hover">
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

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100/50 bg-white/50 backdrop-blur-md rounded-b-2xl">
              <div className="px-4 pt-2 pb-6 space-y-1">
                <Link to="/products" className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-900 hover:bg-white/80">Full Menu</Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/orders" className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-900 hover:bg-white/80">My Orders</Link>
                    <Link to="/wishlist" className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-900 hover:bg-white/80">Favorites</Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-3 py-2 rounded-lg text-base font-bold text-primary hover:bg-primary/5">Admin Dashboard</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-base font-bold text-rose-600 hover:bg-rose-50">
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-900 hover:bg-white/80">Log in</Link>
                    <Link to="/register" className="block px-3 py-2 mt-2 rounded-xl text-base font-bold bg-slate-900 text-white text-center hover:bg-primary transition-colors">Sign up</Link>
                  </>
                )}
              </div>
            </div>
          )}
          </div>
        </nav>
      </div>
      
      {/* Spacer to push content down below fixed navbar */}
      <div className="h-24"></div>

      {/* Cart Drawer is mounted here at the layout level */}
      {isAuthenticated && <CartDrawer />}
    </>
  );
};

export default Navbar;

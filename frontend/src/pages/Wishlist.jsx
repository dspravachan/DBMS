import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist, loading } = useWishlist();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-80 skeleton"></div>)}
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-rose-300 mx-auto mb-6">
          <Heart size={48} className="fill-current" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Your wishlist is empty</h2>
        <p className="text-slate-500 mb-8">Save items you love here and buy them later.</p>
        <Link to="/products" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={28} className="text-rose-500 fill-rose-500" />
        <h1 className="text-3xl font-bold text-slate-900">My Wishlist <span className="text-slate-400 font-medium text-xl ml-2">({wishlist.length})</span></h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map(item => (
          <ProductCard key={item.id} product={item.product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;

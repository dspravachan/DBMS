import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/endpoints';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const { data } = await wishlistService.get();
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      return;
    }

    const isInWishlist = wishlist.some(item => item.product_id === product.id);

    try {
      if (isInWishlist) {
        await wishlistService.remove(product.id);
        setWishlist(prev => prev.filter(item => item.product_id !== product.id));
        toast.success('Removed from wishlist');
      } else {
        const { data } = await wishlistService.add({ product_id: product.id });
        toast.success('Added to wishlist');
        fetchWishlist(); // Re-fetch to get the complete item structure
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId);
  };

  const value = {
    wishlist,
    loading,
    toggleWishlist,
    isInWishlist,
    fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

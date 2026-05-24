import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/endpoints';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const { data } = await cartService.get();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await cartService.add({ product_id: productId, quantity });
      toast.success('Added to cart');
      fetchCart();
      setIsCartOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add to cart');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await cartService.update({ product_id: productId, quantity });
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartService.remove(productId);
      toast.success('Removed from cart');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
  };

  const value = {
    cart,
    isCartOpen,
    setIsCartOpen,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    fetchCart,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

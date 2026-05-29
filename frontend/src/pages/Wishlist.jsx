import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setItems(res.data.data || []);
    } catch { toast.error('Failed to load wishlist'); }
    finally { setLoading(false); }
  };

  const removeFromWishlist = async (foodId) => {
    try {
      await api.post('/wishlist', { food_id: foodId });
      setItems(prev => prev.filter(i => i.food_id !== foodId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  const addToCart = async (foodId) => {
    try {
      await api.post('/cart', { food_id: foodId, quantity: 1 });
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FF8C42]" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0F1115] pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <Heart className="text-[#FF8C42]" size={32} /> My <span className="text-[#FF8C42]">Wishlist</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl mb-6">Your wishlist is empty</p>
            <button onClick={() => navigate('/restaurants')}
              className="bg-[#FF8C42] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#FF7A2B] transition-colors">
              Explore Food
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, idx) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#1A1D24] rounded-2xl overflow-hidden border border-white/5 hover:border-[#FF8C42]/30 transition-all group">
                <div className="relative">
                  <img src={item.image_url || '/images/food_butter_chicken.png'} alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button onClick={() => removeFromWishlist(item.food_id)}
                    className="absolute top-3 right-3 bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors backdrop-blur-sm">
                    <Trash2 size={14} />
                  </button>
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full ${item.is_veg ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                    {item.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{item.restaurant_name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#FF8C42] font-bold text-lg">₹{item.price}</span>
                    <button onClick={() => addToCart(item.food_id)}
                      className="flex items-center gap-1.5 bg-[#FF8C42]/10 text-[#FF8C42] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#FF8C42] hover:text-white transition-all">
                      <ShoppingCart size={14} /> Add
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart, loading: cartLoading } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWished = isInWishlist(product.id);

  return (
    <div className="group glass-card rounded-[1.5rem] border border-slate-100 overflow-hidden card-hover flex flex-col h-full transform transition-all duration-300 relative">
      {/* Decorative Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-colors duration-500 z-0"></div>
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50/50 z-10 m-2 rounded-[1.25rem]">
        <Link to={`/products/${product.id}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <img 
            src={product.image_url || 'https://via.placeholder.com/400x300'} 
            alt={product.name}
            className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              Only {product.stock} remaining
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              Not Available
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/70 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-white hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all z-20 hover:-translate-y-0.5"
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isWished ? 'fill-accent text-accent' : 'text-slate-500 group-hover:text-accent'}`} 
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow relative z-10">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md uppercase tracking-widest">
            {product.category?.name || 'Dish'}
          </span>
          <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            <span className="text-xs font-bold text-amber-600">{product.rating}</span>
          </div>
        </div>

        <Link to={`/products/${product.id}`} className="block mb-3 flex-grow">
          <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors text-lg">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/60">
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-slate-900 drop-shadow-sm">{formatPrice(product.price)}</span>
          </div>

          <button 
            onClick={() => addToCart(product.id)}
            disabled={cartLoading || product.stock === 0}
            className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
              product.stock === 0 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'gradient-primary text-white shadow-[0_8px_20px_-6px_rgba(91,75,251,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(91,75,251,0.7)] hover:-translate-y-1'
            }`}
            aria-label="Add to cart"
          >
            <ShoppingCart size={20} className={product.stock > 0 ? "group-hover:animate-bounce" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

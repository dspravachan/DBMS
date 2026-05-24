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
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden card-hover flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <Link to={`/products/${product.id}`}>
          <img 
            src={product.image_url || 'https://via.placeholder.com/400x300'} 
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              Out of stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
        >
          <Heart 
            size={18} 
            className={isWished ? 'fill-accent text-accent' : 'text-slate-400'} 
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-medium text-primary uppercase tracking-wider">
            {product.category?.name}
          </p>
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={14} className="fill-current" />
            <span className="text-xs font-medium text-slate-600">{product.rating}</span>
          </div>
        </div>

        <Link to={`/products/${product.id}`} className="block mb-2 flex-grow">
          <h3 className="font-semibold text-slate-900 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
          </div>

          <button 
            onClick={() => addToCart(product.id)}
            disabled={cartLoading || product.stock === 0}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              product.stock === 0 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg'
            }`}
            aria-label="Add to cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

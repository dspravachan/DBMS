import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ShoppingCart, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { productService } from '../services/endpoints';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatters';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart, loading: cartLoading } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await productService.getById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-12 animate-pulse">
          <div className="w-full md:w-1/2 h-[500px] bg-slate-200 rounded-3xl"></div>
          <div className="w-full md:w-1/2 space-y-6">
            <div className="h-10 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-32 bg-slate-200 rounded w-full"></div>
            <div className="h-12 bg-slate-200 rounded w-1/2"></div>
            <div className="flex gap-4">
              <div className="h-14 bg-slate-200 rounded w-32"></div>
              <div className="h-14 bg-slate-200 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Dish not found</h2>
        <button onClick={() => navigate('/products')} className="text-primary hover:underline">
          Return to menu
        </button>
      </div>
    );
  }

  const isWished = isInWishlist(product.id);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Breadcrumb & Back */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          
          {/* Image Gallery */}
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/5] sm:aspect-square bg-slate-50 rounded-3xl overflow-hidden relative">
              <img 
                src={product.image_url || 'https://via.placeholder.com/800x800'} 
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                    Only {product.stock} left
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                    Out of stock
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-primary uppercase tracking-wider">
                {product.category?.name}
              </span>
              <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md text-amber-600">
                <Star size={16} className="fill-current" />
                <span className="text-sm font-bold">{product.rating}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              {product.name}
            </h1>

            <p className="text-3xl font-extrabold text-slate-900 mb-6">
              {formatPrice(product.price)}
            </p>

            <div className="prose prose-slate mb-8 text-slate-600">
              <p className="text-base leading-relaxed">{product.description}</p>
            </div>

            <hr className="border-slate-100 mb-8" />

            {/* Actions */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white h-14">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || product.stock === 0}
                    className="px-4 text-slate-500 hover:text-primary disabled:opacity-50 h-full flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-slate-900">{product.stock === 0 ? 0 : quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className="px-4 text-slate-500 hover:text-primary disabled:opacity-50 h-full flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product.id, quantity)}
                  disabled={cartLoading || product.stock === 0}
                  className={`flex-1 h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all shadow-md ${
                    product.stock === 0 
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-primary hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30'
                  }`}
                >
                  <ShoppingCart size={20} />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`h-14 w-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                    isWished 
                      ? 'border-accent bg-accent/10 text-accent' 
                      : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                  }`}
                >
                  <Heart size={24} className={isWished ? 'fill-current' : ''} />
                </button>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Fresh Ingredients</p>
                  <p className="text-xs text-slate-500">Sourced locally for best taste</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Free Shipping</p>
                  <p className="text-xs text-slate-500">On orders over ₹500</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                  <RefreshCcw size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Satisfaction Guaranteed</p>
                  <p className="text-xs text-slate-500">Not hot or fresh? We'll make it right</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

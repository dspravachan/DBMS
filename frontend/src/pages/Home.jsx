import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, Clock } from 'lucide-react';
import { productService } from '../services/endpoints';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await productService.getAll({ limit: 4, sort: 'rating' });
        setFeaturedProducts(data.products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-900/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl animate-slide-in">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary-light text-sm font-semibold tracking-wider mb-6 border border-primary/30">
              NEW COLLECTION 2024
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Discover the <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text gradient-hero">Future of Shopping</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl">
              Experience a curated selection of premium products with an interface designed for the modern web. AI-ready, fast, and secure.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/30 flex items-center gap-2">
                Shop Now <ArrowRight size={20} />
              </Link>
              <Link to="/products?category=electronics" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-semibold text-lg transition-all">
                Explore Electronics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center mb-4">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Premium Quality</h3>
              <p className="text-slate-500">Carefully curated selection of high-quality products.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                <Truck size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Fast Delivery</h3>
              <p className="text-slate-500">Lightning fast shipping on all orders over ₹500.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Payments</h3>
              <p className="text-slate-500">100% secure payment processing with modern encryption.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">24/7 Support</h3>
              <p className="text-slate-500">Round the clock customer support for all your needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Trending Now</h2>
              <p className="text-slate-500">Discover our most popular products this week.</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-80 skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Link to="/products" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-slate-900">
              <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070" className="w-full h-full object-cover opacity-40 mix-blend-overlay" alt="Promo" />
            </div>
            <div className="relative z-10 p-12 md:p-20 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Summer Sale is Live</h2>
              <p className="text-lg text-slate-300 mb-8">Get up to 25% off on electronics and accessories using code <span className="font-mono bg-white/20 px-2 py-1 rounded text-white">MEGA25</span> at checkout.</p>
              <Link to="/products" className="inline-block bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-full font-semibold text-lg transition-colors">
                Claim Discount
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

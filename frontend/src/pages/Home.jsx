import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, ShieldCheck, Zap, Clock } from 'lucide-react';
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
        console.error('Error fetching featured dishes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-[#0a0f1c] text-white min-h-[90vh] flex items-center">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564')] bg-cover bg-center opacity-30 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0a0f1c]/90 to-primary/20"></div>
        
        {/* Floating Background Orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-float-slow"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl animate-slide-in">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-semibold tracking-wide mb-8 animate-float">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              NEW ARRIVALS 2024
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Crave It. <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text text-gradient-hero">Order It. Devour It.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              Hot, fresh, and delicious meals delivered right to your door. Explore our full menu and satisfy your cravings in minutes.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link to="/products" className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-2">
                Order Now <ArrowRight size={20} />
              </Link>
              <Link to="/products?category=burgers" className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/20 px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center btn-hover">
                Explore Burgers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#fafbfd] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-accent/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="glass-card rounded-3xl p-8 flex flex-col items-center text-center card-hover">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner">
                <Flame size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Fresh Ingredients</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Every dish is made with hand-picked, farm-fresh ingredients for maximum flavour.</p>
            </div>
            <div className="glass-card rounded-3xl p-8 flex flex-col items-center text-center card-hover" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 shadow-inner">
                <Zap size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Lightning Fast Delivery</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Get your food delivered hot in 30 minutes or less, tracked in real-time.</p>
            </div>
            <div className="glass-card rounded-3xl p-8 flex flex-col items-center text-center card-hover" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Secure Payments</h3>
              <p className="text-slate-500 text-sm leading-relaxed">100% secure payment processing with end-to-end encryption you can trust.</p>
            </div>
            <div className="glass-card rounded-3xl p-8 flex flex-col items-center text-center card-hover" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6 shadow-inner">
                <Clock size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">24/7 Support</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Our support team is always on call to help with your orders, anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Popular Dishes</h2>
              <p className="text-slate-500">Our most-loved items ordered this week.</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors">
              View Full Menu <ArrowRight size={16} />
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
              View Full Menu <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-24 bg-[#fafbfd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2.5rem] overflow-hidden relative shadow-2xl group">
            <div className="absolute inset-0 bg-slate-900">
              <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070" className="w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000 ease-out" alt="Promo" />
            </div>
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60 mix-blend-multiply"></div>
            
            <div className="relative z-10 p-12 md:p-24 text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">Lunch Special is Live 🍕</h2>
              <p className="text-xl text-white/90 mb-10 drop-shadow-md">Get up to <span className="font-bold text-white">25% off</span> on your first order over ₹500 using code <span className="font-mono bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-white border border-white/30 shadow-sm ml-1">FEAST25</span> at checkout.</p>
              <Link to="/products" className="inline-block bg-white text-primary hover:bg-slate-50 px-10 py-4 rounded-full font-bold text-lg transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1">
                Order Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

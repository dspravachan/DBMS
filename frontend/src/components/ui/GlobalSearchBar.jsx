import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Utensils, Store, TrendingUp } from 'lucide-react';
import api from '../../api/axios';

const POPULAR_SEARCHES = ['Biryani', 'Pizza', 'Burger', 'Veg Meals', 'Chinese', 'South Indian'];

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function GlobalSearchBar({ placeholder = 'Search for restaurants, food, cuisines…', autoFocus = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ restaurants: [], foods: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query, 350);

  // Fetch search results
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults({ restaurants: [], foods: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`/foods/search?q=${encodeURIComponent(debouncedQuery.trim())}`)
      .then(r => setResults(r.data.data || { restaurants: [], foods: [] }))
      .catch(() => setResults({ restaurants: [], foods: [] }))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Flatten results for keyboard nav
  const allItems = [
    ...results.restaurants.map(r => ({ type: 'restaurant', ...r })),
    ...results.foods.map(f => ({ type: 'food', ...f })),
  ];

  const handleSelect = useCallback((item) => {
    setOpen(false);
    setQuery('');
    if (item.type === 'restaurant') {
      navigate(`/restaurants/${item.id}`);
    } else {
      navigate(`/restaurants/${item.restaurant_id}`);
    }
  }, [navigate]);

  const handleFullSearch = useCallback(() => {
    if (!query.trim()) return;
    setOpen(false);
    navigate(`/restaurants?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
  }, [query, navigate]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && allItems[activeIndex]) {
        handleSelect(allItems[activeIndex]);
      } else {
        handleFullSearch();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasResults = results.restaurants.length > 0 || results.foods.length > 0;
  const showPopular = query.trim().length === 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Input */}
      <div className={`flex items-center gap-3 bg-white/5 border rounded-2xl px-4 py-3.5 transition-all duration-200 ${
        open ? 'border-[#FF8C42] shadow-[0_0_0_3px_rgba(255,140,66,0.15)]' : 'border-white/10 hover:border-white/20'
      }`}>
        {loading
          ? <Loader2 size={20} className="text-[#FF8C42] animate-spin shrink-0" />
          : <Search size={20} className="text-gray-400 shrink-0" />
        }
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-base"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}
            className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        )}
        {query && (
          <button onClick={handleFullSearch}
            className="hidden sm:flex items-center gap-1.5 bg-[#FF8C42] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#FF7A2B] transition-colors shrink-0">
            <Search size={14} /> Search
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 bg-[#1A1D24] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[480px] overflow-y-auto"
          >
            {/* Popular searches (when no query) */}
            {showPopular && (
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
                  <TrendingUp size={12} /> Popular Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map(term => (
                    <button
                      key={term}
                      onClick={() => { setQuery(term); setOpen(true); }}
                      className="px-3 py-1.5 bg-[#22252E] text-gray-300 text-sm rounded-full border border-white/5 hover:border-[#FF8C42]/40 hover:text-white transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && query.length >= 2 && (
              <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                <Loader2 size={18} className="animate-spin" /> Searching…
              </div>
            )}

            {/* No results */}
            {!loading && !showPopular && !hasResults && query.length >= 2 && (
              <div className="py-8 text-center text-gray-500">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-sm">No results for "<span className="text-white">{query}</span>"</p>
                <p className="text-xs mt-1">Try a different keyword</p>
              </div>
            )}

            {/* Restaurants */}
            {results.restaurants.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1 flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  <Store size={12} /> Restaurants
                </div>
                {results.restaurants.map((r, idx) => {
                  const globalIdx = idx;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelect({ type: 'restaurant', ...r })}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        activeIndex === globalIdx ? 'bg-[#FF8C42]/10' : 'hover:bg-white/3'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#22252E] flex items-center justify-center shrink-0 overflow-hidden">
                        {r.image_url
                          ? <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                          : <Store size={18} className="text-gray-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{r.name}</p>
                        <p className="text-gray-500 text-xs truncate">{r.cuisine_type} · {r.city}</p>
                      </div>
                      <div className="text-xs text-yellow-400 shrink-0">★ {parseFloat(r.rating || 0).toFixed(1)}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Foods */}
            {results.foods.length > 0 && (
              <div className={results.restaurants.length > 0 ? 'border-t border-white/5' : ''}>
                <div className="px-4 pt-3 pb-1 flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  <Utensils size={12} /> Dishes
                </div>
                {results.foods.map((f, idx) => {
                  const globalIdx = results.restaurants.length + idx;
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleSelect({ type: 'food', ...f })}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        activeIndex === globalIdx ? 'bg-[#FF8C42]/10' : 'hover:bg-white/3'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#22252E] flex items-center justify-center shrink-0 overflow-hidden">
                        {f.image_url
                          ? <img src={f.image_url} alt={f.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                          : <Utensils size={18} className="text-gray-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium truncate">{f.name}</p>
                          <span className={`shrink-0 w-3 h-3 rounded-sm border ${f.is_veg ? 'border-green-500' : 'border-red-500'} flex items-center justify-center`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${f.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs truncate">{f.restaurant_name} · {f.category}</p>
                      </div>
                      <div className="text-xs text-[#FF8C42] font-bold shrink-0">₹{parseFloat(f.price).toFixed(0)}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* See all results */}
            {hasResults && (
              <div className="border-t border-white/5">
                <button
                  onClick={handleFullSearch}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[#FF8C42] font-semibold hover:bg-[#FF8C42]/5 transition-colors"
                >
                  <Search size={14} />
                  See all results for "{query}"
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

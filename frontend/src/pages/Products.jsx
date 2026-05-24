import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import { productService, categoryService } from '../services/endpoints';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    min: searchParams.get('min') || '',
    max: searchParams.get('max') || '',
    in_stock: searchParams.get('in_stock') === 'true',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
  });

  // Debounced search term
  const [searchTerm, setSearchTerm] = useState(filters.search);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query params, removing empty values
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== false && value !== null) {
            params[key] = value;
          }
        });

        // Update URL
        setSearchParams(params);

        const { data } = await productService.getAll(params);
        setProducts(data.products);
        setTotalPages(data.pages);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      search: '',
      min: '',
      max: '',
      in_stock: false,
      sort: 'newest',
      page: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Our Menu</h1>
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg"
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`
          fixed inset-0 z-50 bg-white p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:z-0 md:bg-transparent md:p-0 md:w-64 md:flex-shrink-0
          ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex justify-between items-center md:hidden mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="text-slate-500">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8">
            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Search</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-primary focus:border-primary text-sm"
                  placeholder="Search dishes..."
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className={`block w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors ${filters.category === '' ? 'bg-primary/10 text-primary font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleFilterChange('category', cat.slug)}
                    className={`block w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors ${filters.category === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Price (₹)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min}
                  onChange={(e) => handleFilterChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max}
                  onChange={(e) => handleFilterChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Availability</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.in_stock}
                  onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-600">Available Only</span>
              </label>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full py-2 px-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="hidden md:flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Menu Items</h1>
            
            {/* Desktop Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-500">Sort by:</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="text-sm border-none bg-transparent font-medium text-slate-900 focus:ring-0 cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Mobile Sort (visible only when filters closed) */}
          <div className="md:hidden mb-6">
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full text-sm border-slate-200 rounded-lg bg-white font-medium text-slate-900 focus:ring-primary focus:border-primary"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 skeleton"></div>)}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                          filters.page === i + 1 
                            ? 'bg-primary text-white' 
                            : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === totalPages}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <Search size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No dishes found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your filters or search term.</p>
              <button 
                onClick={clearFilters}
                className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;

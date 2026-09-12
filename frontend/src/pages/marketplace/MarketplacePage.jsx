import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../../api/products.api';
import { getCategories } from '../../api/admin.api';
import ProductCard from '../../components/product/ProductCard';
import './MarketplacePage.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const CONDITION_OPTIONS = ['new', 'like-new', 'good', 'fair'];

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    availability: '',
    sort: 'newest',
    page: 1,
  });

  const [searchInput, setSearchInput] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      // Remove empty values
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await getProducts(params);
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.data.categories)).catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', condition: '', minPrice: '', maxPrice: '', availability: '', sort: 'newest', page: 1 });
    setSearchInput('');
  };

  return (
    <div className="marketplace page-wrapper">
      <div className="container">
        {/* Search Bar */}
        <div className="marketplace-hero">
          <h2>Find what you need, rent from a fellow student</h2>
          <form className="marketplace-search" onSubmit={handleSearchSubmit}>
            <input
              className="form-input search-input"
              type="text"
              placeholder="Search for calculators, books, equipment..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>

        <div className="marketplace-layout">
          {/* Filters Sidebar */}
          <aside className="marketplace-filters card">
            <div className="filter-header">
              <h4>Filters</h4>
              <button className="btn-link" onClick={clearFilters}>Clear all</button>
            </div>

            <div className="filter-section">
              <label className="form-label">Category</label>
              <select className="form-select" value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-section">
              <label className="form-label">Condition</label>
              <select className="form-select" value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}>
                <option value="">Any Condition</option>
                {CONDITION_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="filter-section">
              <label className="form-label">Price Range (₹/day)</label>
              <div className="price-range">
                <input className="form-input" type="number" placeholder="Min" value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)} min="0" />
                <span>–</span>
                <input className="form-input" type="number" placeholder="Max" value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)} min="0" />
              </div>
            </div>

            <div className="filter-section">
              <label className="form-label">Availability</label>
              <label className="filter-checkbox">
                <input type="checkbox" checked={filters.availability === 'true'}
                  onChange={(e) => handleFilterChange('availability', e.target.checked ? 'true' : '')} />
                Available only
              </label>
            </div>
          </aside>

          {/* Products */}
          <main className="marketplace-main">
            <div className="marketplace-toolbar">
              <p className="marketplace-count">
                {loading ? 'Loading...' : `${pagination.total} product${pagination.total !== 1 ? 's' : ''} found`}
              </p>
              <select className="form-select sort-select" value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="loader-overlay"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <h3>No products found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`btn btn-sm ${page === filters.page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilters((f) => ({ ...f, page }))}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

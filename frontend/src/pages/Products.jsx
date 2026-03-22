import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CATEGORY_ICONS = {
  electronics: '💻',
  clothing: '👕',
  books: '📚',
  home: '🏠',
  sports: '⚽',
  other: '📦',
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5002/api/products?limit=50';
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${search}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const categories = ['', 'electronics', 'clothing', 'books', 'home', 'sports', 'other'];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Products</h1>
        <p>Browse our premium collection</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat || 'all'}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory(cat)}
              style={{ width: 'auto' }}
            >
              {cat ? `${CATEGORY_ICONS[cat]} ${cat}` : '🏷️ All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No Products Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                {CATEGORY_ICONS[product.category] || '📦'}
              </div>
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-description">{product.description}</div>
                <div className="product-footer">
                  <div>
                    <div className="product-price">${product.price.toFixed(2)}</div>
                    <div className={`product-stock ${product.stock < 5 ? (product.stock === 0 ? 'out' : 'low') : ''}`}>
                      {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                    </div>
                  </div>
                  {user && product.stock > 0 && (
                    <button
                      className={`btn btn-sm ${addedId === product._id ? 'btn-success' : 'btn-primary'}`}
                      onClick={() => handleAddToCart(product)}
                      style={{ width: 'auto' }}
                    >
                      {addedId === product._id ? '✓ Added' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCategoryProducts, formatImgSrc } from '../utils/api.js';

export default function CategoryProducts({ categoryName, onAddToCart, onToggleWishlist, wishlist = [] }) {
  const { categoryParam } = useParams();
  const activeCategory = categoryName || categoryParam || 'mens';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const navigate = useNavigate();

  // Normalize category name display
  const titleMap = {
    mens: "Men's Collection",
    men: "Men's Collection",
    womens: "Women's Collection",
    women: "Women's Collection",
    kids: "Kids' Collection",
    kid: "Kids' Collection"
  };

  const dbCategory = activeCategory.toLowerCase().startsWith('men') && !activeCategory.toLowerCase().startsWith('women') ? 'mens' : 
                     activeCategory.toLowerCase().startsWith('women') ? 'womens' : 'kids';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getCategoryProducts(dbCategory)
      .then(items => {
        if (isMounted) {
          setProducts(items || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(`Error loading category ${dbCategory}:`, err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dbCategory]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div style={{ minHeight: '80vh', padding: '24px 4%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Navigation Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.9rem', color: '#666' }}>
        <Link to="/" style={{ color: '#0070f3', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span style={{ fontWeight: '600', color: '#111' }}>{titleMap[dbCategory] || `${activeCategory} Collection`}</span>
      </div>

      {/* Category Selection Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Link
          to="/men"
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            backgroundColor: dbCategory === 'mens' ? '#0070f3' : '#f0f2f5',
            color: dbCategory === 'mens' ? '#fff' : '#333',
            transition: 'all 0.2s ease'
          }}
        >
          Men's ({dbCategory === 'mens' ? products.length : 'Explore'})
        </Link>
        <Link
          to="/women"
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            backgroundColor: dbCategory === 'womens' ? '#0070f3' : '#f0f2f5',
            color: dbCategory === 'womens' ? '#fff' : '#333',
            transition: 'all 0.2s ease'
          }}
        >
          Women's ({dbCategory === 'womens' ? products.length : 'Explore'})
        </Link>
        <Link
          to="/kids"
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            backgroundColor: dbCategory === 'kids' ? '#0070f3' : '#f0f2f5',
            color: dbCategory === 'kids' ? '#fff' : '#333',
            transition: 'all 0.2s ease'
          }}
        >
          Kids' ({dbCategory === 'kids' ? products.length : 'Explore'})
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="title" style={{ margin: '0 0 4px 0' }}>{titleMap[dbCategory] || `${activeCategory} Collection`}</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Showing {sortedProducts.length} premium designs</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="sort-select" style={{ fontWeight: 500, fontSize: '0.95rem' }}>Sort By:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            <option value="default">Featured / Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: '1.2rem', color: '#666' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '4px solid #eee', borderTopColor: '#0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }}></div>
          <div>Loading {titleMap[dbCategory]}...</div>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: '1.1rem', color: '#888', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3>No products found in this category.</h3>
          <p style={{ marginTop: '8px' }}>Try browsing another category above or search for your favorite styles.</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 20px', backgroundColor: '#0070f3', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            Back to Home
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {sortedProducts.map(product => {
            const isWishlisted = wishlist.some(item => item.id === product.id);
            const imgSrc = formatImgSrc(product.image);

            return (
              <div className="product-card" key={product._id || product.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <button
                  onClick={() => onToggleWishlist(product)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', fontSize: '1.2rem', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? '❤️' : '🤍'}
                </button>

                <div onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                  <img
                    src={imgSrc}
                    alt={product.name}
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = '/images/banners/mens one.webp'; 
                    }}
                    loading="lazy"
                    style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px', backgroundColor: '#f5f5f5' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category}</span>
                  <h4 style={{ fontSize: '1.05rem', margin: '6px 0', color: '#111', lineHeight: '1.3' }}>{product.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '12px', height: '36px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.description}</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0070f3', marginBottom: '12px' }}>₹{product.price}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onAddToCart(product)}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ padding: '10px 14px', backgroundColor: '#f0f0f0', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { searchProducts, formatImgSrc } from '../utils/api.js';

export default function SearchResults({ onAddToCart, onToggleWishlist, wishlist = [] }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const isAiSearch = searchParams.get('ai') === 'true';

  const [products, setProducts] = useState([]);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setAiExplanation('');

    searchProducts(query, isAiSearch)
      .then(result => {
        if (isMounted) {
          setProducts(result.products || []);
          if (result.aiExplanation) {
            setAiExplanation(result.aiExplanation);
          }
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Error performing search:", err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [query, isAiSearch]);

  return (
    <div style={{ minHeight: '80vh', padding: '24px 4%', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>
          <Link to="/" style={{ color: '#0070f3', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <span>Search</span>
        </div>

        <h2 className="title" style={{ margin: '0 0 8px 0' }}>
          {isAiSearch ? '✨ AI Smart Search' : 'Search Results'} {query ? `for "${query}"` : ''}
        </h2>

        {isAiSearch && aiExplanation && (
          <div style={{ display: 'inline-block', padding: '10px 18px', background: 'linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)', color: '#4c1d95', borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #c084fc', fontWeight: '500', margin: '8px 0' }}>
            {aiExplanation}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: '1.2rem', color: '#666' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '4px solid #eee', borderTopColor: '#0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }}></div>
          <div>{isAiSearch ? '✨ AI is analyzing your search query & scanning catalog...' : 'Searching database...'}</div>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: '1.1rem', color: '#888', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3>No shoes found matching "{query}".</h3>
          <p style={{ marginTop: '8px' }}>Try searching with keywords like "Men running", "Women heels", "Kids sneakers", or "shoes under 2000".</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
            <Link to="/men" style={{ padding: '8px 16px', backgroundColor: '#f0f2f5', color: '#333', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>Men's</Link>
            <Link to="/women" style={{ padding: '8px 16px', backgroundColor: '#f0f2f5', color: '#333', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>Women's</Link>
            <Link to="/kids" style={{ padding: '8px 16px', backgroundColor: '#f0f2f5', color: '#333', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>Kids'</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {products.map(product => {
            const isWishlisted = wishlist.some(item => item.id === product.id);
            const imgSrc = formatImgSrc(product.image);

            return (
              <div className="product-card" key={product._id || product.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <button
                  onClick={() => onToggleWishlist(product)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', fontSize: '1.2rem', zIndex: 2 }}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? '❤️' : '🤍'}
                </button>

                <div onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                  <img
                    src={imgSrc}
                    alt={product.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/banners/mens one.webp'; }}
                    loading="lazy"
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px', backgroundColor: '#f5f5f5' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category}</span>
                  <h4 style={{ fontSize: '1.05rem', margin: '6px 0', color: '#111' }}>{product.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '12px', height: '36px', overflow: 'hidden' }}>{product.description}</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0070f3', marginBottom: '12px' }}>₹{product.price}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onAddToCart(product)}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
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

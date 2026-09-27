import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const formatImgSrc = (img) => {
  if (!img) return '/images/banners/mens one.webp';
  if (img.startsWith('http') || img.startsWith('/images/')) return img;
  if (img.startsWith('compressed_by_category')) return `/images/${img}`;
  return `/images/${img.replace(/^\/+/, '')}`;
};

export default function SearchResults({ onAddToCart, onToggleWishlist, wishlist = [] }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const isAiSearch = searchParams.get('ai') === 'true';

  const [products, setProducts] = useState([]);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setAiExplanation('');

    const endpoint = isAiSearch
      ? `/api/ai-search?q=${encodeURIComponent(query)}`
      : `/api/getproduct`;

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products)) {
          if (isAiSearch) {
            setProducts(data.products);
            setAiExplanation(data.aiExplanation || `✨ AI matched ${data.products.length} products.`);
          } else {
            const filtered = data.products.filter(item =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              item.category.toLowerCase().includes(query.toLowerCase()) ||
              (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
            );
            setProducts(filtered);
          }
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error performing search:", err);
        setLoading(false);
      });
  }, [query, isAiSearch]);

  return (
    <div style={{ minHeight: '80vh', padding: '20px 4%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 className="title" style={{ margin: '0 0 8px 0' }}>
          {isAiSearch ? 'AI Smart Search' : 'Search Results'} for "{query}"
        </h2>

        {isAiSearch && aiExplanation && (
          <div style={{ display: 'inline-block', padding: '10px 16px', background: 'linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)', color: '#4c1d95', borderRadius: '10px', fontSize: '0.95rem', border: '1px solid #c084fc', fontWeight: '500', margin: '8px 0' }}>
            {aiExplanation}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.2rem', color: '#666' }}>
          {isAiSearch ? '✨ AI is analyzing your search query & scanning catalog...' : 'Searching database...'}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.1rem', color: '#888' }}>
          No shoes found matching "{query}". Try a broader term like "Running shoes", "Men", or "Sandals".
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
                  title="Wishlist"
                >
                  {isWishlisted ? '❤️' : '🤍'}
                </button>

                <div onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                  <img
                    src={imgSrc}
                    alt={product.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/banners/mens one.webp'; }}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category}</span>
                  <h4 style={{ fontSize: '1.1rem', margin: '6px 0', color: '#111' }}>{product.name}</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px', height: '40px', overflow: 'hidden' }}>{product.description}</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0070f3', marginBottom: '12px' }}>₹{product.price}</p>
                </div>

                <button
                  onClick={() => onAddToCart(product)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

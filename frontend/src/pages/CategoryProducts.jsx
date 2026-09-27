import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const formatImgSrc = (img) => {
  if (!img) return '/images/banners/mens one.webp';
  if (img.startsWith('http') || img.startsWith('/images/')) return img;
  if (img.startsWith('compressed_by_category')) return `/images/${img}`;
  return `/images/${img.replace(/^\/+/, '')}`;
};

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
    setLoading(true);
    fetch(`/api/getproduct?category=${dbCategory}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(`Error loading category ${dbCategory}:`, err);
        setLoading(false);
      });
  }, [dbCategory]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div style={{ minHeight: '80vh', padding: '20px 4%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="title" style={{ margin: 0 }}>{titleMap[dbCategory] || `${activeCategory} Collection`}</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="sort-select" style={{ fontWeight: 500, fontSize: '0.95rem' }}>Sort By:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.2rem', color: '#666' }}>Loading collection from MongoDB database...</div>
      ) : sortedProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.1rem', color: '#888' }}>No products found in this category.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {sortedProducts.map(product => {
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
                    style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category}</span>
                  <h4 style={{ fontSize: '1.1rem', margin: '6px 0', color: '#111' }}>{product.name}</h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px', height: '40px', overflow: 'hidden' }}>{product.description}</p>
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
                    style={{ padding: '10px 14px', backgroundColor: '#f0f0f0', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
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

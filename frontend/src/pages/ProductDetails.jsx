import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, formatImgSrc } from '../utils/api.js';

export default function ProductDetails({ onAddToCart, onToggleWishlist, wishlist = [] }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('8');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getProductById(id)
      .then(item => {
        if (isMounted) {
          setProduct(item || null);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Error fetching product details:", err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontSize: '1.2rem', color: '#666' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '4px solid #eee', borderTopColor: '#0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }}></div>
        <div>Loading footwear details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '600px', margin: '40px auto', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#111' }}>Product Not Found</h2>
        <p style={{ margin: '16px 0', color: '#666' }}>The product you are looking for is currently unavailable or does not exist.</p>
        <Link to="/" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#0070f3', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const imgSrc = formatImgSrc(product.image);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, quantity);
    setAddedMessage('✓ Added to cart successfully!');
    setTimeout(() => setAddedMessage(''), 3000);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', minHeight: '75vh' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
      >
        &larr; Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src={imgSrc}
            alt={product.name}
            onError={(e) => { e.target.onerror = null; e.target.src = '/images/banners/mens one.webp'; }}
            style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '450px', backgroundColor: '#f8f9fa' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#0070f3', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {product.category} Footwear
            </span>
            <h1 style={{ fontSize: '2rem', margin: '8px 0 12px', color: '#111' }}>{product.name}</h1>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0070f3', marginBottom: '20px' }}>₹{product.price}</p>
            <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6', marginBottom: '24px' }}>{product.description}</p>

            {/* Size Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Size (UK):</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['6', '7', '8', '9', '10', '11'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      border: selectedSize === size ? '2px solid #0070f3' : '1px solid #ddd',
                      backgroundColor: selectedSize === size ? '#0070f3' : '#fff',
                      color: selectedSize === size ? '#fff' : '#333',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ fontWeight: 'bold' }}>Quantity:</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '6px 14px', border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  -
                </button>
                <span style={{ padding: '6px 16px', fontWeight: 'bold' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: '6px 14px', border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {addedMessage && (
            <div style={{ padding: '12px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold' }}>
              {addedMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={handleAddToCart}
              style={{ flex: 1, padding: '14px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              Add to Cart
            </button>
            <button
              onClick={() => onToggleWishlist(product)}
              style={{ padding: '14px 20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem' }}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isWishlisted ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ProductDetails({ onAddToCart, onToggleWishlist, wishlist = [] }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('8');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setProduct(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product details:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', fontSize: '1.2rem' }}>Loading product details from database...</div>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <h2>Product Not Found</h2>
        <p style={{ margin: '16px 0' }}>The product you are looking for does not exist.</p>
        <Link to="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>Back to Home</Link>
      </div>
    );
  }

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const imgSrc = product.image ? (product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`) : '/images/banners/mens one.webp';

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, quantity);
    setAddedMessage('Added to cart successfully!');
    setTimeout(() => setAddedMessage(''), 3000);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', minHeight: '75vh' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', fontSize: '1rem' }}
      >
        &larr; Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <div>
          <img
            src={imgSrc}
            alt={product.name}
            style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '450px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category}</span>
            <h1 style={{ fontSize: '2rem', margin: '8px 0 12px', color: '#111' }}>{product.name}</h1>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0070f3', marginBottom: '20px' }}>₹{product.price}</p>
            <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6', marginBottom: '24px' }}>{product.description}</p>

            {/* Size Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Size (UK):</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['6', '7', '8', '9', '10', '11'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      width: '42px',
                      height: '42px',
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
              title="Wishlist"
            >
              {isWishlisted ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

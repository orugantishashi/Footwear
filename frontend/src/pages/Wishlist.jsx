import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Wishlist({ wishlist, onToggleWishlist, onAddToCart }) {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', minHeight: '75vh' }}>
      <h2 className="title" style={{ marginBottom: '24px' }}>My Wishlist</h2>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>Your wishlist is empty.</p>
          <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
            Discover Shoes
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {wishlist.map(product => {
            const imgSrc = product.image ? (product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`) : '/images/banners/mens one.webp';

            return (
              <div key={product._id || product.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <button
                  onClick={() => onToggleWishlist(product)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', fontSize: '1.2rem', zIndex: 2 }}
                  title="Remove from wishlist"
                >
                  ❤️
                </button>

                <div onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                  <img
                    src={imgSrc}
                    alt={product.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                  />
                  <h4 style={{ fontSize: '1.1rem', margin: '6px 0', color: '#111' }}>{product.name}</h4>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0070f3', marginBottom: '12px' }}>₹{product.price}</p>
                </div>

                <button
                  onClick={() => onAddToCart(product)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Move to Cart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

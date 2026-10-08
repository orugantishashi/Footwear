import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatImgSrc } from '../utils/api.js';

export default function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart, user }) {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * (item.quantity || 1)), 0);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }
    setOrderPlaced(true);
    onClearCart();
  };

  if (orderPlaced) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '40px 20px', textAlign: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <span style={{ fontSize: '4rem' }}>🎉</span>
        <h2 style={{ margin: '16px 0 8px', color: '#111' }}>Order Placed Successfully!</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>Thank you for shopping with Foot Mart. Your footwear order has been confirmed.</p>
        <Link to="/" style={{ padding: '12px 24px', backgroundColor: '#0070f3', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h2 className="cart-page-title">Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="cart-empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="cart-browse-btn">
            Browse Footwear
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items List */}
          <div className="cart-items-column">
            {cartItems.map(item => {
              const rawImg = item.img || item.image;
              const imgSrc = formatImgSrc(rawImg);

              return (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={imgSrc}
                    alt={item.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/banners/mens one.webp'; }}
                    className="cart-item-img"
                  />
                  
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <p className="cart-item-price">₹{item.price}</p>
                  </div>

                  <div className="cart-item-controls">
                    <div className="cart-qty-stepper">
                      <button
                        type="button"
                        className="cart-qty-btn"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="cart-qty-val">{item.quantity || 1}</span>
                      <button
                        type="button"
                        className="cart-qty-btn"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => onRemoveItem(item.id)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary-card">
            <h3>Order Summary</h3>
            <div className="cart-summary-row">
              <span>Items ({cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)})</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>FREE</span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span style={{ color: '#0070f3' }}>₹{total.toFixed(2)}</span>
            </div>

            <button
              type="button"
              className="cart-checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

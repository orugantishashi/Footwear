import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import Home from './pages/Home.jsx';
import CategoryProducts from './pages/CategoryProducts.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/Login.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Account from './pages/Account.jsx';
import SearchResults from './pages/SearchResults.jsx';
import { safeFetchJson } from './utils/api.js';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('footmart_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('footmart_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem('footmart_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Save state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.getItem('footmart_user') !== JSON.stringify(user) &&
        localStorage.setItem('footmart_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('footmart_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('footmart_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('footmart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch cart items from backend if user is logged in
  useEffect(() => {
    if (user && user.email) {
      safeFetchJson(`/cart?email=${encodeURIComponent(user.email)}`)
        .then(result => {
          if (result.ok && result.data && Array.isArray(result.data.items)) {
            setCartItems(result.data.items);
          }
        })
        .catch(err => console.warn("Sync cart error:", err));
    }
  }, [user]);

  // Add to cart handler
  const handleAddToCart = (product, size = '8', quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item
        );
      }
      return [...prev, { ...product, size, quantity }];
    });

    // Also sync to backend if user logged in
    if (user && user.email) {
      safeFetchJson('/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          id: product.id,
          name: product.name,
          price: product.price,
          img: product.image,
          quantity
        })
      }).catch(err => console.warn("Error syncing cart to backend:", err));
    }
  };

  // Update quantity handler
  const handleUpdateQuantity = (id, delta) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );

    if (user && user.email) {
      safeFetchJson('/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, id, delta })
      }).catch(err => console.warn("Error updating cart quantity:", err));
    }
  };

  // Remove item handler
  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    if (user && user.email) {
      safeFetchJson('/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, id })
      }).catch(err => console.warn("Error removing cart item:", err));
    }
  };

  // Clear cart handler
  const handleClearCart = () => {
    setCartItems([]);
    if (user && user.email) {
      safeFetchJson('/cart/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      }).catch(err => console.warn("Error clearing cart:", err));
    }
  };

  // Toggle wishlist handler
  const handleToggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('footmart_user');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar cartCount={totalCartCount} user={user} onLogout={handleLogout} />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
              />
            }
          />
          <Route
            path="/men"
            element={
              <CategoryProducts
                categoryName="mens"
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
              />
            }
          />
          <Route
            path="/women"
            element={
              <CategoryProducts
                categoryName="womens"
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
              />
            }
          />
          <Route
            path="/kids"
            element={
              <CategoryProducts
                categoryName="kids"
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetails
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <Cart
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                user={user}
              />
            }
          />
          <Route
            path="/login"
            element={<Login onLoginSuccess={(userData) => setUser(userData)} />}
          />
          <Route
            path="/wishlist"
            element={
              <Wishlist
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
              />
            }
          />
          <Route
            path="/account"
            element={<Account user={user} onLogout={handleLogout} />}
          />
          <Route
            path="/search"
            element={
              <SearchResults
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
              />
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

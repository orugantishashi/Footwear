import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ cartCount, user, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiMode, setIsAiMode] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}${isAiMode ? '&ai=true' : ''}`);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <img src="/images/banners/app logo.svg" alt="Foot Mart" className="nav-logo" />
      </Link>
      <div className="nav-content" id="nav-content">
        <ul id="nav-links">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
        </ul>
      </div>

      <form id="nav-search-form" className="nav-search" onSubmit={handleSearchSubmit} autoComplete="off" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={() => setIsAiMode(!isAiMode)}
          style={{
            padding: '6px 10px',
            borderRadius: '20px',
            border: isAiMode ? '1px solid #7c3aed' : '1px solid #ccc',
            background: isAiMode ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : '#f3f4f6',
            color: isAiMode ? '#fff' : '#4b5563',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
          title={isAiMode ? "AI Search active (Natural Language)" : "Normal Search active"}
        >
          {isAiMode ? '✨ AI Search' : '🔍 Normal'}
        </button>

        <input
          type="search"
          id="nav-search-input"
          placeholder={isAiMode ? "Try 'Running shoes for men under 2000'..." : "Search shoes..."}
          aria-label="Search shoes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {/* Nav Icons (Cart/Wishlist) */}
      <div className="nav-icons">
        <Link to="/cart" className="nav-icon" aria-label="Cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span id="cart-count" className="badge">{cartCount || 0}</span>
        </Link>
      </div>

      {!user ? (
        <div id="auth-buttons" className="auth-buttons">
          <Link to="/login" className="sign-in-link">Sign In</Link>
          <button className="sign-up-btn" onClick={() => navigate('/login?mode=register')}>Sign Up</button>
        </div>
      ) : (
        <div id="profile" style={{ position: 'relative' }}>
          <button 
            id="profile-btn" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}
          >
            👤 {user.name ? user.name.split(' ')[0] : 'User'}
          </button>

          {showProfileMenu && (
            <div id="profile-menu" className="profile-menu" style={{ display: 'block', position: 'absolute', right: 0, top: '100%', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', padding: '12px', zIndex: 1000, minWidth: '160px' }}>
              <p id="profile-name" style={{ fontWeight: 'bold', marginBottom: '8px' }}>{user.name || user.email}</p>
              <button onClick={() => { navigate('/account'); setShowProfileMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', margin: '4px 0', padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}>Edit details</button>
              <button onClick={() => { navigate('/wishlist'); setShowProfileMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', margin: '4px 0', padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}>My Wishlist</button>
              <button onClick={() => { onLogout(); setShowProfileMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', margin: '4px 0', padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}>Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

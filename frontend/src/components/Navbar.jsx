import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ cartCount, user, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiMode, setIsAiMode] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setShowProfileMenu(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}${isAiMode ? '&ai=true' : ''}`);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <img 
          src="/images/banners/app logo.svg" 
          alt="Foot Mart" 
          className="nav-logo" 
          onError={(e) => {
            e.target.onerror = null;
            // Fallback to text logo if svg fails
            e.target.style.display = 'none';
          }}
        />
        <span style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.5px', color: '#111', marginLeft: '6px' }}>
          FOOT<span style={{ color: '#0070f3' }}>MART</span>
        </span>
      </Link>

      <div className="nav-content" id="nav-content">
        <ul id="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px', listStyle: 'none', margin: 0, padding: 0 }}>
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''} style={{ fontWeight: '600', color: location.pathname === '/' ? '#0070f3' : '#333' }}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/men" className={location.pathname === '/men' ? 'active' : ''} style={{ fontWeight: '600', color: location.pathname === '/men' ? '#0070f3' : '#333' }}>
              Men
            </Link>
          </li>
          <li>
            <Link to="/women" className={location.pathname === '/women' ? 'active' : ''} style={{ fontWeight: '600', color: location.pathname === '/women' ? '#0070f3' : '#333' }}>
              Women
            </Link>
          </li>
          <li>
            <Link to="/kids" className={location.pathname === '/kids' ? 'active' : ''} style={{ fontWeight: '600', color: location.pathname === '/kids' ? '#0070f3' : '#333' }}>
              Kids
            </Link>
          </li>
        </ul>
      </div>

      <form id="nav-search-form" className="nav-search" onSubmit={handleSearchSubmit} autoComplete="off" style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1', maxWidth: '420px', margin: '0 16px' }}>
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
          placeholder={isAiMode ? "e.g. 'Running shoes under 2000'..." : "Search footwear..."}
          aria-label="Search shoes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '8px 14px', borderRadius: '20px', background: '#0070f3', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      {/* Nav Icons (Wishlist / Cart) */}
      <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/wishlist" className="nav-icon" aria-label="Wishlist" title="Wishlist" style={{ color: '#333', fontSize: '1.2rem', textDecoration: 'none' }}>
          ❤️
        </Link>
        <Link to="/cart" className="nav-icon" aria-label="Cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#333', textDecoration: 'none' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span id="cart-count" className="badge" style={{ position: 'absolute', top: '-8px', right: '-10px', background: '#0070f3', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {cartCount || 0}
          </span>
        </Link>
      </div>

      {!user ? (
        <div id="auth-buttons" className="auth-buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
          <Link to="/login" className="sign-in-link" style={{ padding: '8px 14px', color: '#333', textDecoration: 'none', fontWeight: '600' }}>
            Sign In
          </Link>
          <button className="sign-up-btn" onClick={() => navigate('/login?mode=register')} style={{ padding: '8px 16px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Sign Up
          </button>
        </div>
      ) : (
        <div id="profile" style={{ position: 'relative', marginLeft: '12px' }}>
          <button 
            id="profile-btn" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#f0f2f5' }}
          >
            👤 {user.name ? user.name.split(' ')[0] : 'Account'} ▾
          </button>

          {showProfileMenu && (
            <div id="profile-menu" className="profile-menu" style={{ display: 'block', position: 'absolute', right: 0, top: '120%', background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', borderRadius: '8px', padding: '12px', zIndex: 1000, minWidth: '170px', border: '1px solid #eee' }}>
              <p id="profile-name" style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '0.9rem', color: '#111', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>{user.name || user.email}</p>
              <button onClick={() => { navigate('/account'); setShowProfileMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', margin: '4px 0', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.9rem' }}>Account Details</button>
              <button onClick={() => { navigate('/wishlist'); setShowProfileMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', margin: '4px 0', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.9rem' }}>My Wishlist</button>
              <button onClick={() => { onLogout(); setShowProfileMenu(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', margin: '4px 0', padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '0.9rem', color: '#ff4d4f', fontWeight: 'bold' }}>Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <footer>
        <div className="footer-container">
          <div className="footer-col">
            <h3>Foot Mart</h3>
            <p className="footer-text">
              Your one-stop destination for premium footwear. Quality, comfort, and style in every step.
            </p>
          </div>
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/men">Men's Collection</Link></li>
              <li><Link to="/women">Women's Collection</Link></li>
              <li><Link to="/kids">Kids' Collection</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Customer Care</h3>
            <ul>
              <li><Link to="/account">Track Order</Link></li>
              <li><Link to="/account">Shipping Policy</Link></li>
              <li><Link to="/account">Returns & Exchange</Link></li>
              <li><Link to="/account">Contact Us</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Follow Us</h3>
            <div className="social-links">
              <span style={{ cursor: 'pointer' }}>FB</span>
              <span style={{ cursor: 'pointer' }}>IG</span>
              <span style={{ cursor: 'pointer' }}>TW</span>
              <span style={{ cursor: 'pointer' }}>YT</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Foot Mart. All Rights Reserved. | Designed for Comfort.</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="bottom-nav">
        <Link to="/" className="bottom-nav-item">
          <span className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </span>
          <span>Home</span>
        </Link>
        <Link to="/cart" className="bottom-nav-item">
          <span className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </span>
          <span>Cart</span>
        </Link>
        <Link to="/account" className="bottom-nav-item">
          <span className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </span>
          <span>Account</span>
        </Link>
      </div>
    </>
  );
}

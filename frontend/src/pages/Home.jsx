import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fallbackProducts from '../../data.json';

const formatImgSrc = (img) => {
  if (!img) return '/images/banners/mens one.webp';
  if (img.startsWith('http') || img.startsWith('/images/')) return img;
  if (img.startsWith('compressed_by_category')) return `/images/${img}`;
  return `/images/${img.replace(/^\/+/, '')}`;
};

export default function Home({ onAddToCart, onToggleWishlist, wishlist = [] }) {
  // Instant load using local fallback data to eliminate white screen / slow load
  const [products, setProducts] = useState(fallbackProducts || []);
  const [activeTab, setActiveTab] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const heroSlides = [
    {
      id: 1,
      title: "Step Into Modern Comfort & Style",
      subtitle: "Discover the latest 2026 trends in Men's, Women's & Kids' Footwear.",
      badge: "SEASON CLEARANCE — UP TO 40% OFF",
      bgImage: "/images/banners/mens_banner.jpg",
      ctaText: "Shop Men's Collection",
      ctaLink: "/men",
      secondaryCta: "Shop Women's",
      secondaryLink: "/women",
      theme: "dark"
    },
    {
      id: 2,
      title: "Women's Elegance & Casual Chic",
      subtitle: "Stilettos, heels, loafers, and light runners crafted for every day.",
      badge: "EXCLUSIVE WOMEN'S RELEASE",
      bgImage: "/images/banners/womens two.webp",
      ctaText: "Explore Women's Shoes",
      ctaLink: "/women",
      secondaryCta: "Explore Kids",
      secondaryLink: "/kids",
      theme: "light"
    },
    {
      id: 3,
      title: "Kids' Fun, Durable & Light-Up Kicks",
      subtitle: "Vibrant sneakers and sturdy shoes designed for non-stop playtime.",
      badge: "PLAYFUL & COMFY",
      bgImage: "/images/banners/kids.webp",
      ctaText: "Shop Kids' Footwear",
      ctaLink: "/kids",
      secondaryCta: "View All Products",
      secondaryLink: "/search",
      theme: "dark"
    }
  ];

  useEffect(() => {
    // Fetch live products from backend to stay in sync with DB
    fetch('/api/getproduct')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(err => {
        console.error("Error fetching live database products:", err);
      });
  }, []);

  // Filter products by category
  const mensProducts = products.filter(p => p.category === 'mens' || p.category === 'men');
  const womensProducts = products.filter(p => p.category === 'womens' || p.category === 'women');
  const kidsProducts = products.filter(p => p.category === 'kids' || p.category === 'kid');

  // Balanced diverse assortment for "All" tab (mix of Men, Women, Kids)
  const getDisplayedProducts = () => {
    if (activeTab === 'mens') return mensProducts.slice(0, 12);
    if (activeTab === 'womens') return womensProducts.slice(0, 12);
    if (activeTab === 'kids') return kidsProducts.slice(0, 12);

    // Default 'all': interleave Women, Men, Kids
    const mixed = [];
    const maxLen = Math.max(mensProducts.length, womensProducts.length, kidsProducts.length);
    for (let i = 0; i < maxLen && mixed.length < 12; i++) {
      if (womensProducts[i]) mixed.push(womensProducts[i]);
      if (mensProducts[i]) mixed.push(mensProducts[i]);
      if (kidsProducts[i]) mixed.push(kidsProducts[i]);
    }
    return mixed.length > 0 ? mixed.slice(0, 12) : products.slice(0, 12);
  };

  const displayedProducts = getDisplayedProducts();

  const renderProductCard = (product, badgeText) => {
    const isWishlisted = wishlist.some(item => item.id === product.id);
    const imgSrc = formatImgSrc(product.image);
    const categoryName = (product.category || 'Footwear').toUpperCase();

    const rating = (4.3 + ((product.id || 1) % 7) * 0.1).toFixed(1);
    const originalPrice = Math.round(product.price * 1.25);

    return (
      <div className="home-product-card" key={product._id || product.id}>
        {/* Top-Left Badge Tag */}
        {badgeText && <span className="card-badge">{badgeText}</span>}

        {/* Top-Right Wishlist Heart Button */}
        <button
          className={`home-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>

        <div className="card-img-wrapper" onClick={() => navigate(`/product/${product.id}`)}>
          <img
            src={imgSrc}
            alt={product.name}
            onError={(e) => { e.target.onerror = null; e.target.src = '/images/banners/mens one.webp'; }}
            loading="lazy"
          />
        </div>

        <div className="card-content" onClick={() => navigate(`/product/${product.id}`)}>
          <div className="card-meta">
            <span className={`category-tag category-${product.category}`}>{categoryName}</span>
            <span className="rating-tag">⭐ {rating}</span>
          </div>

          <h4 className="card-title">{product.name}</h4>
          <p className="card-desc">{product.description}</p>

          <div className="price-row">
            <span className="current-price">₹{product.price}</span>
            <span className="original-price">₹{originalPrice}</span>
            <span className="discount-percent">20% OFF</span>
          </div>
        </div>

        <div className="card-actions">
          <button className="add-cart-btn" onClick={() => onAddToCart(product)}>
            Add to Cart
          </button>
          <button className="view-details-btn" onClick={() => navigate(`/product/${product.id}`)}>
            View
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="homepage-redesign">
      {/* 1. Hero Slider Banner */}
      <section className="hero-slider">
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.2)), url(${slide.bgImage})` }}
          >
            <div className="hero-content">
              <span className="hero-badge">{slide.badge}</span>
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <div className="hero-cta-group">
                <Link to={slide.ctaLink} className="hero-btn primary-btn">
                  {slide.ctaText} →
                </Link>
                <Link to={slide.secondaryLink} className="hero-btn secondary-btn">
                  {slide.secondaryCta}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <div className="hero-slider-dots">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Trust Badges / Value Proposition Bar */}
      <section className="trust-bar">
        <div className="trust-item">
          <div className="trust-icon">🚚</div>
          <div className="trust-text">
            <h4>Free Express Shipping</h4>
            <p>On all orders above ₹999 across India</p>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">⚡</div>
          <div className="trust-text">
            <h4>100% Authentic Guarantee</h4>
            <p>Direct from certified footwear brands</p>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">🔄</div>
          <div className="trust-text">
            <h4>Easy 30-Day Returns</h4>
            <p>Hassle-free return & instant refund</p>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">🛡️</div>
          <div className="trust-text">
            <h4>24/7 Customer Support</h4>
            <p>Always here to help you step right</p>
          </div>
        </div>
      </section>

      {/* 3. Shop By Category Showcase */}
      <section className="category-showcase-section">
        <div className="section-header">
          <h2>Shop Footwear By Category</h2>
          <p>Explore curated collections designed for every member of your family</p>
        </div>

        <div className="category-cards-grid">
          <Link to="/women" className="cat-card cat-card-women">
            <div className="cat-card-img" style={{ backgroundImage: `url('/images/banners/womens two.webp')` }}></div>
            <div className="cat-card-overlay">
              <span className="cat-badge">FEATURED</span>
              <h3>Women's Collection</h3>
              <p>Heels, Stilettos, Loafers, Pink Runners & Boots</p>
              <span className="cat-link-btn">Shop Women →</span>
            </div>
          </Link>

          <Link to="/men" className="cat-card cat-card-men">
            <div className="cat-card-img" style={{ backgroundImage: `url('/images/banners/mens one.webp')` }}></div>
            <div className="cat-card-overlay">
              <span className="cat-badge">POPULAR</span>
              <h3>Men's Collection</h3>
              <p>Loafers, Formal Oxfords, Canvas & Gym Shoes</p>
              <span className="cat-link-btn">Shop Men →</span>
            </div>
          </Link>

          <Link to="/kids" className="cat-card cat-card-kids">
            <div className="cat-card-img" style={{ backgroundImage: `url('/images/banners/kids.webp')` }}></div>
            <div className="cat-card-overlay">
              <span className="cat-badge">NEW STYLES</span>
              <h3>Kids' Collection</h3>
              <p>Light-Up Sneakers, Velcro Trainers & Sandals</p>
              <span className="cat-link-btn">Shop Kids →</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Tabbed Filter Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Trending Footwear Collections</h2>
          <p>Handpicked bestsellers featuring Men's, Women's & Kids' top designs</p>
        </div>

        {/* Filter Tabs */}
        <div className="category-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Footwear
          </button>
          <button
            className={`tab-btn ${activeTab === 'womens' ? 'active' : ''}`}
            onClick={() => setActiveTab('womens')}
          >
            Women's
          </button>
          <button
            className={`tab-btn ${activeTab === 'mens' ? 'active' : ''}`}
            onClick={() => setActiveTab('mens')}
          >
            Men's
          </button>
          <button
            className={`tab-btn ${activeTab === 'kids' ? 'active' : ''}`}
            onClick={() => setActiveTab('kids')}
          >
            Kids'
          </button>
        </div>

        <div className="products-grid">
          {displayedProducts.map((product, idx) => {
            const badge = idx % 3 === 0 ? 'BESTSELLER' : (idx % 2 === 0 ? 'NEW' : null);
            return renderProductCard(product, badge);
          })}
        </div>
      </section>

      {/* 5. Promotional Deal Banner */}
      <section className="promo-banner">
        <div className="promo-content">
          <span className="promo-pill">LIMITED TIME DEAL</span>
          <h2>Summer Footwear Fest — Up To 40% OFF</h2>
          <p>Use Coupon Code <strong className="code-highlight">FOOTMART30</strong> at Checkout for Extra 30% Savings!</p>
          <div className="promo-actions">
            <button onClick={() => navigate('/women')} className="promo-btn primary">
              Shop Women's Sale
            </button>
            <button onClick={() => navigate('/kids')} className="promo-btn secondary">
              Shop Kids' Sale
            </button>
          </div>
        </div>
      </section>

      {/* 6. Women's Spotlight Row */}
      {womensProducts.length > 0 && (
        <section className="spotlight-section">
          <div className="spotlight-header">
            <div>
              <h2>Women's Style Spotlight</h2>
              <p>Elegant heels, daily loafers, and casual sneakers</p>
            </div>
            <Link to="/women" className="view-all-link">View All Women's →</Link>
          </div>
          <div className="products-grid">
            {womensProducts.slice(0, 4).map(product => renderProductCard(product, 'TRENDING'))}
          </div>
        </section>
      )}

      {/* 7. Kids' Spotlight Row */}
      {kidsProducts.length > 0 && (
        <section className="spotlight-section">
          <div className="spotlight-header">
            <div>
              <h2>Kids' Adventure & Comfort Range</h2>
              <p>Lightweight trainers, sparkles, and dinosaur stomp boots</p>
            </div>
            <Link to="/kids" className="view-all-link">View All Kids' →</Link>
          </div>
          <div className="products-grid">
            {kidsProducts.slice(0, 4).map(product => renderProductCard(product, 'POPULAR'))}
          </div>
        </section>
      )}
    </div>
  );
}


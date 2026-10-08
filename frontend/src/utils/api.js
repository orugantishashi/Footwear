import fallbackProducts from '../../data.json';

// Determine backend API base URL
// In development: use "" (proxied by Vite to localhost:3000)
// In production: use env variable VITE_API_BASE_URL or live Render backend URL
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:');

export const API_BASE_URL = isLocal 
  ? '' 
  : (import.meta.env.VITE_API_BASE_URL || 'https://footwear-y0zi.onrender.com');

/**
 * Format image path reliably for both local dev and production builds
 */
export const formatImgSrc = (img) => {
  if (!img) return '/images/banners/mens one.webp';
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  if (img.startsWith('/images/')) return img;
  if (img.startsWith('images/')) return `/${img}`;
  if (img.startsWith('compressed_by_category')) return `/images/${img}`;
  if (img.startsWith('/compressed_by_category')) return `/images${img}`;
  if (img.startsWith('banners/')) return `/images/${img}`;
  if (img.startsWith('/banners/')) return `/images${img}`;
  
  const cleaned = img.replace(/^\/+/, '');
  return `/images/${cleaned}`;
};

/**
 * Safe fetch with JSON validation and timeout to prevent hanging on cold starts
 */
export const safeFetchJson = async (endpoint, options = {}, timeoutMs = 6000) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Returned HTML or other non-JSON (e.g. SPA index.html fallback)
      return { ok: false, error: 'Non-JSON response received' };
    }

    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err) {
    clearTimeout(timeoutId);
    return { ok: false, error: err.message || 'Fetch failed' };
  }
};

/**
 * Load all products: tries live backend API first, seamlessly falls back to data.json
 */
export const getProducts = async () => {
  try {
    const result = await safeFetchJson('/api/getproduct');
    if (result.ok && result.data && result.data.success && Array.isArray(result.data.products) && result.data.products.length > 0) {
      return result.data.products;
    }
  } catch (err) {
    console.warn('Backend products fetch failed, using embedded dataset:', err);
  }
  return fallbackProducts || [];
};

/**
 * Load category products (mens, womens, kids): tries live backend API first, seamlessly falls back to data.json
 */
export const getCategoryProducts = async (category) => {
  const normalizedCat = (category || 'mens').toLowerCase();
  const isMen = normalizedCat.startsWith('men') && !normalizedCat.startsWith('women');
  const isWomen = normalizedCat.startsWith('women');
  const isKid = normalizedCat.startsWith('kid');

  const targetCategory = isMen ? 'mens' : isWomen ? 'womens' : 'kids';

  // 1. Try Backend API
  try {
    const result = await safeFetchJson(`/api/getproduct?category=${targetCategory}`);
    if (result.ok && result.data && result.data.success && Array.isArray(result.data.products) && result.data.products.length > 0) {
      return result.data.products;
    }
  } catch (err) {
    console.warn(`Category API fetch failed for ${targetCategory}, using embedded dataset:`, err);
  }

  // 2. Seamless Fallback to data.json
  const filtered = (fallbackProducts || []).filter(item => {
    const itemCat = (item.category || '').toLowerCase();
    if (targetCategory === 'mens') return itemCat === 'mens' || itemCat === 'men';
    if (targetCategory === 'womens') return itemCat === 'womens' || itemCat === 'women';
    if (targetCategory === 'kids') return itemCat === 'kids' || itemCat === 'kid';
    return itemCat === targetCategory;
  });

  return filtered;
};

/**
 * Load single product by ID: tries live backend API first, seamlessly falls back to data.json
 */
export const getProductById = async (id) => {
  try {
    const result = await safeFetchJson(`/api/products/${id}`);
    if (result.ok && result.data && result.data.success && result.data.product) {
      return result.data.product;
    }
  } catch (err) {
    console.warn(`Product detail API fetch failed for ID ${id}, using embedded dataset:`, err);
  }

  const numericId = parseInt(id, 10);
  const found = (fallbackProducts || []).find(item => item.id === numericId || String(item.id) === String(id) || item._id === id);
  return found || null;
};

/**
 * Search products: handles AI search and standard search with automatic fallback
 */
export const searchProducts = async (query, isAi = false) => {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) return { products: fallbackProducts || [], isAi, aiExplanation: '' };

  // 1. Try Live API
  try {
    const endpoint = isAi 
      ? `/api/ai-search?q=${encodeURIComponent(cleanQuery)}`
      : `/api/getproduct`;
    
    const result = await safeFetchJson(endpoint);
    if (result.ok && result.data && result.data.success && Array.isArray(result.data.products)) {
      if (isAi) {
        return {
          products: result.data.products,
          isAi: true,
          aiExplanation: result.data.aiExplanation || `✨ AI matched ${result.data.products.length} products.`
        };
      } else {
        const filtered = result.data.products.filter(item =>
          item.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(cleanQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(cleanQuery.toLowerCase()))
        );
        return { products: filtered, isAi: false, aiExplanation: '' };
      }
    }
  } catch (err) {
    console.warn('Search API fetch failed, performing smart client-side search:', err);
  }

  // 2. Client-side Smart / AI Search Fallback
  const lowerQ = cleanQuery.toLowerCase();
  let categoryFilter = null;
  if (lowerQ.includes('men') || lowerQ.includes('boy') || lowerQ.includes('gent')) {
    if (!lowerQ.includes('women')) categoryFilter = 'mens';
  }
  if (lowerQ.includes('women') || lowerQ.includes('girl') || lowerQ.includes('lady') || lowerQ.includes('ladies') || lowerQ.includes('heels')) {
    categoryFilter = 'womens';
  }
  if (lowerQ.includes('kid') || lowerQ.includes('child') || lowerQ.includes('baby') || lowerQ.includes('toddler')) {
    categoryFilter = 'kids';
  }

  // Price match
  const priceMatch = lowerQ.match(/(?:under|below|less than|<|budget of)\s*₹?\s*(\d+)/i);
  const maxPrice = priceMatch ? parseFloat(priceMatch[1]) : null;

  const keywords = lowerQ
    .replace(/(?:under|below|less than|shoes|footwear|for|in|mens|womens|kids|cheap|best)\s*₹?\d*/gi, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 2);

  const matched = (fallbackProducts || []).filter(item => {
    // Check Category
    if (categoryFilter) {
      const itemCat = (item.category || '').toLowerCase();
      const catMatches = categoryFilter === 'mens' 
        ? (itemCat === 'mens' || itemCat === 'men')
        : categoryFilter === 'womens'
        ? (itemCat === 'womens' || itemCat === 'women')
        : (itemCat === 'kids' || itemCat === 'kid');
      if (!catMatches) return false;
    }

    // Check Max Price
    if (maxPrice && Number(item.price) > maxPrice) {
      return false;
    }

    // Check keywords if any
    if (keywords.length > 0) {
      const corpus = `${item.name} ${item.description || ''} ${item.category}`.toLowerCase();
      return keywords.some(k => corpus.includes(k));
    }

    return true;
  });

  return {
    products: matched,
    isAi,
    aiExplanation: isAi ? `✨ AI analyzed your search "${cleanQuery}" and found ${matched.length} matching footwear styles.` : ''
  };
};

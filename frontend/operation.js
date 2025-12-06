// ------------------ NOTIFICATION SYSTEM ------------------
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.getElementById('notification');
    if (existing) existing.remove();

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        font-size: 14px;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    if (!document.getElementById('notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ------------------ CART HANDLING ------------------
let cartCount = 0;
const NAV_SEARCH_KEY = "pendingNavSearchTerm";

// Function to update cart count in navbar
function updateCartCount(count) {
    cartCount = count;
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        cartCountElement.textContent = String(count);
    }
    localStorage.setItem("cartCount", String(count));
}

// Function to sync cart count from server (call this on page load)
async function syncCartCountFromServer() {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
        // Only reset to 0 if user is not logged in
        const cartCountElement = document.getElementById("cart-count");
        if (cartCountElement && cartCountElement.textContent === "0") {
            // Already 0, don't update
            return;
        }
        updateCartCount(0);
        return;
    }

    try {
        const user = JSON.parse(userJson);
        const response = await fetch(`https://footwear-y0zi.onrender.com/cart?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        if (response.ok && Array.isArray(data.items)) {
            const total = data.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
            updateCartCount(total);
            console.log("Cart count synced from server:", total);
        } else {
            console.warn("Cart sync failed - invalid response:", data);
            // Keep existing count on invalid response
        }
    } catch (err) {
        console.error("Cart sync error:", err);
        // Keep existing count on error - don't reset to 0
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cartCountElement = document.getElementById("cart-count");
    document.addEventListener("click", handleBuyNowClick);

    // Initialize cart count from localStorage immediately (for fast display)
    const cached = localStorage.getItem("cartCount");
    if (cached && cartCountElement) {
        cartCount = Number(cached) || 0;
        cartCountElement.textContent = String(cartCount);
    }

    // Always sync cart count from server on page load (overwrites cache with real data)
    syncCartCountFromServer();

    function handleBuyNowClick(event) {
        const button = event.target.closest(".buynow");
        if (!button) return;
        event.stopPropagation();
        addToCartHandler(button);
    }

    async function addToCartHandler(button) {
        const userJson = localStorage.getItem("user");
        if (!userJson) {
            showNotification("Please login to add items to your cart", "error");
            setTimeout(() => window.location.href = "login.html", 1500);
            return;
        }

        const user = JSON.parse(userJson);
        const card = button.closest(".product-card");
        if (!card) {
            showNotification("Unable to find product details", "error");
            return;
        }

        const id = card.getAttribute("data-id");
        const name = card.querySelector("h3")?.textContent.trim() || "";
        const priceText = card.querySelector(".price")?.textContent.trim() || "₹0";
        const numericPrice = parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0;
        const img = card.querySelector("img")?.getAttribute("src") || "";

        // Disable button during request
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Adding...";

        try {
            const response = await fetch("https://footwear-y0zi.onrender.com/add-to-cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    id: String(id),
                    name,
                    price: numericPrice,
                    img,
                    quantity: 1,
                }),
            });

            let data;
            try { data = await response.json(); } catch (_) { data = {}; }

            if (!response.ok) {
                console.error("Add to cart failed:", response.status, data);
                showNotification(data.message || data.error || "Failed to add to cart", "error");
                button.disabled = false;
                button.textContent = originalText;
                return;
            }

            // Fetch actual cart count from server after adding
            try {
                const cartResponse = await fetch(`https://footwear-y0zi.onrender.com/cart?email=${encodeURIComponent(user.email)}`);
                const cartData = await cartResponse.json();
                if (cartResponse.ok && Array.isArray(cartData.items)) {
                    const actualCount = cartData.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
                    updateCartCount(actualCount);
                } else {
                    // Fallback: increment if we can't fetch
                    updateCartCount(cartCount + 1);
                }
            } catch (fetchErr) {
                // Fallback: increment if fetch fails
                updateCartCount(cartCount + 1);
            }

            showNotification("Product added to cart!", "success");

            // Reload cart if on cart page
            if (typeof window.loadCart === 'function') {
                window.loadCart();
            } else if (window.location.pathname.includes('cart.html') || window.location.href.includes('cart.html')) {
                // If on cart page but loadCart not available, reload the page
                setTimeout(() => window.location.reload(), 500);
            }

            button.disabled = false;
            button.textContent = originalText;
        } catch (err) {
            console.error("Add to cart error:", err);
            showNotification("Could not add to cart. Please try again.", "error");
            button.disabled = false;
            button.textContent = originalText;
        }
    }
});

// ------------------ NAV SEARCH (SHARED) ------------------
// Search functionality removed as per user request (Nike feed removal)


// ------------------ DARK MODE TOGGLE ------------------
// ------------------ DARK MODE TOGGLE ------------------
document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".toggle");
    const mobileToggle = document.getElementById("mobile-dark-mode-toggle");

    // 1. Check for saved dark mode preference on load
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "enabled") {
        document.body.classList.add("dark-mode");
    }

    // 2. Function to update button text
    function updateToggleText() {
        const isDark = document.body.classList.contains("dark-mode");
        if (toggle) toggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
        if (mobileToggle) mobileToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    }

    // Initial text update based on loaded state
    updateToggleText();

    // 3. Toggle Function
    function toggleDarkMode(e) {
        if (e) e.preventDefault();
        document.body.classList.toggle("dark-mode");

        // Save preference to localStorage
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", "disabled");
        }

        updateToggleText();
    }

    if (toggle) {
        toggle.addEventListener("click", toggleDarkMode);
    }

    if (mobileToggle) {
        mobileToggle.addEventListener("click", toggleDarkMode);
    }
});

// ------------------ REGISTER FUNCTION ------------------
async function register() {
    const name = document.getElementById("rname")?.value.trim();
    const email = document.getElementById("remail")?.value.trim();
    const password = document.getElementById("rpassword")?.value.trim();

    const errorElement = document.getElementById("register-error");

    if (!name || !email || !password) {
        if (errorElement) {
            errorElement.textContent = "All fields are required!";
            errorElement.style.display = "block";
            errorElement.style.color = "red";
        } else {
            showNotification("All fields are required!", "error");
        }
        return;
    }

    // Clear previous error
    if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = "none";
    }

    const BASE_URL = "https://footwear-y0zi.onrender.com";
    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();
        console.log("[Register] Response:", data);

        if (!response.ok || !data.success) {
            const errorMsg = data.message || "Registration failed.";
            if (errorElement) {
                errorElement.textContent = errorMsg;
                errorElement.style.display = "block";
                errorElement.style.color = "red";
            } else {
                showNotification(errorMsg, "error");
            }
            return;
        }

        // Success
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.style.display = "none";
        }
        showNotification(data.message || "Registered successfully! Please log in.", "success");

        // Clear form
        document.getElementById("rname").value = "";
        document.getElementById("remail").value = "";
        document.getElementById("rpassword").value = "";
    } catch (err) {
        console.error("Register error:", err);
        const errorMsg = "Server not reachable. Please check your connection.";
        if (errorElement) {
            errorElement.textContent = errorMsg;
            errorElement.style.display = "block";
            errorElement.style.color = "red";
        } else {
            showNotification(errorMsg, "error");
        }
    }
}

// ------------------ LOGIN FUNCTION ------------------
async function login() {
    const emailInput = document.getElementById("lemail");
    const passwordInput = document.getElementById("lpassword");
    const errorElement = document.getElementById("login-error");

    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();

    // Clear previous error
    if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = "none";
    }

    if (!email || !password) {
        if (errorElement) {
            errorElement.textContent = "Email and password are required!";
            errorElement.style.display = "block";
            errorElement.style.color = "red";
        } else {
            alert("Email and password are required!");
        }
        return;
    }

    const BASE_URL = "https://footwear-y0zi.onrender.com";
    try {
        console.log("[Login] Sending credentials:", { email, password });
        const response = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        // Check if response is ok before trying to parse JSON
        let data;
        try {
            const text = await response.text();
            data = text ? JSON.parse(text) : {};
        } catch (parseErr) {
            console.error("[Login] Failed to parse response:", parseErr);
            if (errorElement) {
                errorElement.textContent = "Server returned invalid response. Please try again.";
                errorElement.style.display = "block";
                errorElement.style.color = "red";
            } else {
                alert("Server returned invalid response. Please try again.");
            }
            return;
        }

        console.log("[Login] Response:", data);

        if (!response.ok || !data.success) {
            // Get detailed error message from server
            const errorMsg = data.message || data.error || `Login Failed (Status: ${response.status})`;
            console.error("[Login] Server error:", response.status, data);

            if (errorElement) {
                errorElement.textContent = errorMsg;
                errorElement.style.display = "block";
                errorElement.style.color = "red";
            } else {
                alert(errorMsg);
            }
            return;
        }

        // Success
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.style.display = "none";
        }
        showNotification(data.message || "Login successful!", "success");
        const user = { name: data.user?.name || "", email: data.user?.email || "" };
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect after short delay
        setTimeout(() => {
            window.location.href = "index.html";
        }, 500);
    } catch (err) {
        console.error("Login error:", err);
        // Check if it's a network error (server not reachable)
        if (err instanceof TypeError && err.message.includes("fetch")) {
            if (errorElement) {
                errorElement.textContent = "Server not reachable. Please ensure the backend server is running on port 3000.";
                errorElement.style.display = "block";
                errorElement.style.color = "red";
            } else {
                alert("Server not reachable. Please ensure the backend server is running on port 3000.");
            }
        } else {
            if (errorElement) {
                errorElement.textContent = "An unexpected error occurred. Please try again.";
                errorElement.style.display = "block";
                errorElement.style.color = "red";
            } else {
                alert("An unexpected error occurred: " + err.message);
            }
        }
    }
}

// ------------------ PRODUCT VIEW HANDLER ------------------
function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

// ------------------ PROFILE & NAV UI ------------------
function updateNavUI() {
    const userJson = localStorage.getItem("user");
    const loginLink = document.getElementById("login-link");
    const profile = document.getElementById("profile");
    const profileName = document.getElementById("profile-name");

    if (userJson) {
        const user = JSON.parse(userJson);
        loginLink?.classList.add("hidden");
        profile?.classList.remove("hidden");
        if (profileName) profileName.textContent = user.name || user.email;
    } else {
        loginLink?.classList.remove("hidden");
        profile?.classList.add("hidden");
    }
}

async function logout() {
    try {
        const userJson = localStorage.getItem("user");
        const displaycart = document.getElementById("cart-count");

        if (userJson) {
            const email = JSON.parse(userJson).email;

            // 🔹 Clear cart on backend
            await fetch("https://footwear-y0zi.onrender.com/cart/clear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
        }

        // 🔹 Clear local storage & UI
        localStorage.removeItem("user");
        localStorage.removeItem("cartCount");
        cartCount = 0;
        if (displaycart) displaycart.textContent = "0";

        updateNavUI();
        window.location.reload();
    } catch (err) {
        console.error("Logout error:", err);
        alert("Logout failed: " + err.message);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    updateNavUI();

    const profileBtn = document.getElementById("profile-btn");
    const profileMenu = document.getElementById("profile-menu");
    const logoutBtn = document.getElementById("logout");
    const editBtn = document.getElementById("edit-details");


    profileBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        const expanded = profileBtn.getAttribute("aria-expanded") === "true";
        profileBtn.setAttribute("aria-expanded", String(!expanded));
        profileMenu?.classList.toggle("hidden");
    });

    logoutBtn?.addEventListener("click", logout);
    editBtn?.addEventListener("click", () => (window.location.href = "login.html"));

    document.addEventListener("click", (e) => {
        if (profileMenu && !profileMenu.classList.contains("hidden")) {
            const profile = document.getElementById("profile");
            if (profile && !profile.contains(e.target)) {
                profileMenu.classList.add("hidden");
                profileBtn?.setAttribute("aria-expanded", "false");
            }
        }
    });
});
// ------------------ CATEGORY LOADING ------------------
async function loadCategoryProducts(category) {
    const productGrid = document.getElementById("product-grid");
    const sectionTitle = document.getElementById("section-title");

    if (!productGrid) return;

    // Show loading state
    productGrid.innerHTML = '<p style="text-align:center; width:100%; padding: 20px;">Loading products...</p>';
    if (sectionTitle) {
        sectionTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1) + "'s Collection";
    }

    try {
        let allProducts = [];
        if (typeof window.productsData !== 'undefined') {
            allProducts = window.productsData;
        } else {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Failed to load products');
            allProducts = await response.json();
        }

        const filteredProducts = allProducts.filter(p => p.category === category);

        productGrid.innerHTML = ''; // Clear loading message

        if (filteredProducts.length === 0) {
            productGrid.innerHTML = '<p style="text-align:center; width:100%; padding: 20px;">No products found in this category.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card'; // Changed to 'product-card' to match index.html styling
            card.setAttribute('data-id', product.id);
            card.onclick = () => viewProduct(product.id);

            const imgPath = `./images/${product.image}`;

            card.innerHTML = `
                <img src="${imgPath}" alt="${product.name}" onerror="this.src='./images/products/shoes/shoe 1.jpg'">
                <h3>${product.name}</h3>
                <p>${product.category}'s Footwear</p>
                <span class="price">${product.price}</span>
                <button class="buynow">Add Cart</button>
            `;

            productGrid.appendChild(card);
        });

        // Scroll to the product section
        sectionTitle?.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        console.error("Error loading products:", err);
        productGrid.innerHTML = '<p style="text-align:center; width:100%; color:red;">Error loading products. Please try again later.</p>';
    }
}

// ------------------ HAMBURGER MENU TOGGLE ------------------
// ------------------ CHANGE PASSWORD FUNCTION ------------------
async function changePassword() {
    const emailInput = document.getElementById("cpemail");
    const oldPasswordInput = document.getElementById("oldpassword");
    const newPasswordInput = document.getElementById("newpassword");
    const errorElement = document.getElementById("change-pass-error");

    const email = emailInput?.value.trim();
    const currentPassword = oldPasswordInput?.value.trim();
    const newPassword = newPasswordInput?.value.trim();

    if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = "none";
    }

    if (!currentPassword || !newPassword) {
        if (errorElement) {
            errorElement.textContent = "All fields are required!";
            errorElement.style.display = "block";
            errorElement.style.color = "red";
        }
        return;
    }

    const BASE_URL = "https://footwear-y0zi.onrender.com";
    try {
        const response = await fetch(`${BASE_URL}/change-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, currentPassword, newPassword }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            const errorMsg = data.message || "Failed to update password";
            if (errorElement) {
                errorElement.textContent = errorMsg;
                errorElement.style.display = "block";
                errorElement.style.color = "red";
            }
            return;
        }

        alert("Password changed successfully! Please login with your new password.");
        logout(); // Force logout/clear storage
    } catch (err) {
        console.error("Change password error:", err);
        if (errorElement) {
            errorElement.textContent = "Server error. Please try again.";
            errorElement.style.display = "block";
            errorElement.style.color = "red";
        }
    }
}

// ------------------ HAMBURGER MENU TOGGLE & FORGOT PASSWORD ------------------
document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const navContent = document.getElementById("nav-content");

    // Forgot Password Handler
    const forgotPassLink = document.querySelector(".forgot-pass");
    if (forgotPassLink) {
        forgotPassLink.addEventListener("click", (e) => {
            e.preventDefault();
            alert("Forgot Password feature is coming soon!");
        });
    }

    if (hamburger && navContent) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navContent.classList.toggle("active");
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!hamburger.contains(e.target) && !navContent.contains(e.target)) {
                hamburger.classList.remove("active");
                navContent.classList.remove("active");
            }
        });
    }

    // ------------------ PROFILE MENU HANDLERS ------------------
    const changePassBtn = document.getElementById("change-password");
    if (changePassBtn) {
        changePassBtn.addEventListener("click", () => {
            // Redirect to login page with a hash to open change password view
            window.location.href = "login.html#change-password";
        });
    }

    // Check if we are on login.html with #change-password
    if (window.location.hash === "#change-password" && document.getElementById("change-pass-box")) {
        const userJson = localStorage.getItem("user");
        if (userJson) {
            const user = JSON.parse(userJson);
            // Hide other boxes
            const loginBox = document.getElementById("login-box");
            const regBox = document.getElementById("register-box");
            const changeBox = document.getElementById("change-pass-box");

            if (loginBox) loginBox.classList.add("hidden");
            if (regBox) regBox.classList.add("hidden");
            if (changeBox) {
                changeBox.classList.remove("hidden");
                // Pre-fill email
                const emailField = document.getElementById("cpemail");
                if (emailField) emailField.value = user.email;
            }
        }
    }
});

function goBackFromChangePass() {
    window.location.href = "index.html";
}

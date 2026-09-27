// ==================== IMPORTS ====================
const express = require("express");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectMongoose = require("./db/db config.js");
const Product = require("./db/dataSchema.js");

// ==================== APP SETUP ====================
const app = express();

// Security: Hide Express framework information
app.disable('x-powered-by');

app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE", allowedHeaders: "Content-Type" }));
app.use(express.json());

// Serve frontend built files (dist) & static assets
const distPath = path.join(__dirname, "../frontend/dist");
const frontendPath = path.join(__dirname, "../frontend");

if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}
app.use(express.static(frontendPath));


// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ==================== MONGO SETUP ====================
// ==================== MONGO SETUP ====================
const uri = process.env.MONGO_URI;

if (!uri) {
    console.error("❌ FATAL ERROR: MONGO_URI environment variable is missing!");
    process.exit(1);
}

// Log masked URI for debugging (hides password)
const maskedUri = uri.replace(/:([^@]+)@/, ":****@");
console.log(`[Mongo] Attempting to connect to: ${maskedUri}`);

const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 60000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
});

let isConnected = false;

async function connectDB() {
    if (isConnected) return;

    try {
        console.log("Connecting to MongoDB...");
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        isConnected = true;
        console.log("✅ MongoDB Connected");

        client.on("serverClosed", (event) => {
            console.log("⚠️ MongoDB Server Closed:", event);
            isConnected = false;
        });

        client.on("topologyClosed", (event) => {
            console.log("⚠️ MongoDB Topology Closed:", event);
            isConnected = false;
        });

        client.on("close", () => {
            console.log("⚠️ MongoDB Connection Closed");
            isConnected = false;
        });
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        isConnected = false;
        throw err;
    }
}

function getDB() {
    if (!isConnected) {
        throw new Error("Database not connected");
    }
    return client.db("footwear");
}

// ==================== REGISTER ====================
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: "All fields required" });

        const users = getDB().collection("users");

        const existing = await users.findOne({ email });
        if (existing)
            return res.status(400).json({ success: false, message: "Email already registered" });

        await users.insertOne({ name, email, password, createdAt: new Date() });

        res.json({ success: true, message: "Registration successful!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==================== GET PRODUCTS ====================
app.get("/api/getproduct", async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category: category.toLowerCase() } : {};
        const productsData = await Product.find(query);
        res.json({ success: true, products: productsData });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ success: false, message: "Error fetching products" });
    }
});

// GET Single Product by ID
app.get("/api/products/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        let product = await Product.findOne({ id: productId });
        if (!product) {
            // fallback to mongoose _id if not numeric id
            product = await Product.findById(req.params.id).catch(() => null);
        }
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, product });
    } catch (err) {
        console.error("Error fetching product details:", err);
        res.status(500).json({ success: false, message: "Error fetching product details" });
    }
});

// ==================== AI SEARCH ENDPOINT ====================
app.get("/api/ai-search", async (req, res) => {
    try {
        const queryStr = req.query.q || "";
        if (!queryStr.trim()) {
            const allProducts = await Product.find({});
            return res.json({ success: true, products: allProducts, isAi: true, aiExplanation: "Showing all items." });
        }

        const apiKey = process.env.AI_API_KEY;
        const apiUrl = process.env.AI_API_URL;

        let aiExplanation = "";
        let filter = {};

        // If AI API Key and URL are provided by user
        if (apiKey && apiKey !== "PASTE_YOUR_AI_API_KEY_HERE" && apiUrl && apiUrl !== "PASTE_YOUR_AI_API_URL_HERE") {
            try {
                const fetchUrl = apiUrl.includes('key=') ? apiUrl : `${apiUrl}?key=${apiKey}`;
                const aiResponse = await fetch(fetchUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-goog-api-key': apiKey
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Parse this footwear query into JSON: {"category": "mens"|"womens"|"kids"|null, "maxPrice": number|null}. Query: "${queryStr}"`
                            }]
                        }]
                    })
                });

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json();
                    const textResp = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    const jsonMatch = textResp.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        if (parsed.category) filter.category = parsed.category.toLowerCase();
                        if (parsed.maxPrice) filter.price = { $lte: Number(parsed.maxPrice) };
                        aiExplanation = `✨ Google Gemini AI processed: "${queryStr}"`;
                    }
                }
            } catch (aiErr) {
                console.error("Gemini AI API call error:", aiErr);
            }
        }

        // Smart Natural Language Fallback / Parser
        const lowerQ = queryStr.toLowerCase();

        // 1. Detect Category
        if (lowerQ.includes('men') || lowerQ.includes('boy') || lowerQ.includes('gent')) {
            if (!lowerQ.includes('women')) filter.category = 'mens';
        }
        if (lowerQ.includes('women') || lowerQ.includes('girl') || lowerQ.includes('lady') || lowerQ.includes('ladies')) {
            filter.category = 'womens';
        }
        if (lowerQ.includes('kid') || lowerQ.includes('child') || lowerQ.includes('baby') || lowerQ.includes('toddler')) {
            filter.category = 'kids';
        }

        // 2. Detect Max Price (e.g. "under 2000", "below 1500", "< 3000")
        const priceMatch = lowerQ.match(/(?:under|below|less than|<|budget of)\s*₹?\s*(\d+)/i);
        if (priceMatch && priceMatch[1]) {
            filter.price = { $lte: parseFloat(priceMatch[1]) };
        }

        // 3. Keyword Search across name, description, brand, color
        const words = lowerQ
            .replace(/(?:under|below|less than|shoes|footwear|for|in|mens|womens|kids|under|cheap|best)\s*₹?\d*/gi, '')
            .trim()
            .split(/\s+/)
            .filter(w => w.length > 2);

        let products = await Product.find(filter);

        if (words.length > 0) {
            products = products.filter(p => {
                const text = `${p.name} ${p.description} ${p.category} ${p.brand || ''} ${p.color || ''}`.toLowerCase();
                return words.some(w => text.includes(w));
            });
        }

        if (!aiExplanation) {
            aiExplanation = `✨ AI analyzed your query "${queryStr}" and found ${products.length} matching footwear options.`;
        }

        res.json({
            success: true,
            products,
            isAi: true,
            query: queryStr,
            aiExplanation
        });
    } catch (err) {
        console.error("AI Search error:", err);
        res.status(500).json({ success: false, message: "Error performing AI Search" });
    }
});


// ==================== LOGIN ====================
app.post("/login", async (req, res) => {
    console.log("[Login] Request received");
    console.log("[Login] isConnected:", isConnected);
    console.log("[Login] client exists:", !!client);

    try {
        // Ensure connection
        if (!isConnected) {
            console.log("[Login] Not connected, attempting to reconnect...");
            await connectDB();
        }

        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ success: false, message: "Email & password required" });

        const users = getDB().collection("users");
        const user = await users.findOne({ email, password });

        if (!user)
            return res.status(401).json({ success: false, message: "Invalid login" });

        const { password: _, ...data } = user;

        res.json({ success: true, user: data });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==================== CHANGE PASSWORD ====================
app.post("/change-password", async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const users = getDB().collection("users");

        // Verify current password
        const user = await users.findOne({ email, password: currentPassword });
        if (!user) {
            return res.status(401).json({ success: false, message: "Incorrect current password" });
        }

        // Update to new password
        await users.updateOne(
            { email },
            { $set: { password: newPassword } }
        );

        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        console.error("Change Password Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== RESET PASSWORD (FORGOT PASSWORD) ====================
app.post("/reset-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: "Email and new password are required" });
        }

        const users = getDB().collection("users");

        const user = await users.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await users.updateOne(
            { email },
            { $set: { password: newPassword } }
        );

        res.json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==================== ADD TO CART ====================
app.post("/add-to-cart", async (req, res) => {
    try {
        const { email, id, name, price, img, quantity } = req.body;

        if (!email || !id)
            return res.status(400).json({ message: "Missing data" });

        const cart = getDB().collection("cartItems");

        const existing = await cart.findOne({ email, id });
        if (existing)
            await cart.updateOne({ email, id }, { $inc: { quantity: 1 } });
        else
            await cart.insertOne({ email, id, name, price, img, quantity: quantity || 1 });

        res.json({ message: "Added to cart" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== GET CART ====================
app.get("/cart", async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) return res.status(400).json({ message: "Email required" });

        const cart = getDB().collection("cartItems");
        const items = await cart.find({ email }).toArray();

        res.json({ items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== UPDATE CART ====================
app.post("/cart/update", async (req, res) => {
    try {
        const { email, id, delta } = req.body;

        if (!email || !id || typeof delta !== "number")
            return res.status(400).json({ message: "Invalid data" });

        const cart = getDB().collection("cartItems");

        const item = await cart.findOne({ email, id });
        if (!item) return res.status(404).json({ message: "Item not found" });

        const newQty = item.quantity + delta;

        if (newQty <= 0) {
            await cart.deleteOne({ email, id });
            return res.json({ message: "Removed", quantity: 0 });
        }

        await cart.updateOne({ email, id }, { $set: { quantity: newQty } });

        res.json({ message: "Updated", quantity: newQty });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== REMOVE ITEM ====================
app.post("/cart/remove", async (req, res) => {
    try {
        const { email, id } = req.body;

        if (!email || !id)
            return res.status(400).json({ message: "Missing data" });

        const cart = getDB().collection("cartItems");
        await cart.deleteOne({ email, id });

        res.json({ message: "Removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== CLEAR CART ====================
app.post("/cart/clear", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });

        const cart = getDB().collection("cartItems");
        await cart.deleteMany({ email });

        res.json({ message: "Cart cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




// ==================== SPA FALLBACK ROUTE ====================
app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/login') || req.path.startsWith('/register') || req.path.startsWith('/cart')) {
        return next();
    }
    const distIndex = path.join(__dirname, "../frontend/dist/index.html");
    if (fs.existsSync(distIndex)) {
        return res.sendFile(distIndex);
    }
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ==================== START SERVER ====================
async function startServer() {
    try {
        await connectDB();
        await connectMongoose();

        const PORT = 3000;
        app.listen(PORT, () =>
            console.log(`🚀 Server running at http://localhost:${PORT}`)
        );
    } catch (err) {
        console.error("❌ Server startup failed:", err.message);
        process.exit(1);
    }
}

startServer();


// ==================== IMPORTS ====================
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");

// ==================== APP SETUP ====================
const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files (go up to html-css-project2 directory)
app.use(express.static(path.join(__dirname, "../frontend")));


// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ==================== MONGO SETUP ====================
const uri = process.env.MONGO_URI; 

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

// ==================== NIKE API PROXY (THIS FIXES CORS) ====================
app.get("/nike", async (req, res) => {
    try {
        const keyword = req.query.search || "running";

        const url = `https://api.nike.com/product_feed/threads/v2?filter=marketplace(IN)&filter=language(en)&anchor=0&count=48&filter=searchTerms(${keyword})&timestamp=${Date.now()}`;

        const nikeRes = await fetch(url, { headers: { Accept: "application/json" } });

        const data = await nikeRes.json();

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Nike API failed", details: err.message });
    }
});


// ==================== START SERVER ====================
async function startServer() {
    try {
        await connectDB();

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


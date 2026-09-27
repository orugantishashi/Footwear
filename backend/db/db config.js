const mongoose = require("mongoose");

const connectdb = async () => {
    try {
        if (mongoose.connection.readyState >= 1) return;
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'footwear' });
        console.log("✅ Mongoose connected to MongoDB database: footwear");
    } catch (err) {
        console.error("❌ Mongoose connection error:", err);
    }
};

module.exports = connectdb;
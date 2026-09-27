const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectdb = require('./db config.js');
const Product = require('./dataSchema.js');

async function seedData() {
    try {
        console.log("Connecting to Database...");
        await connectdb();

        const jsonPath = path.join(__dirname, '../../frontend/data.json');
        if (!fs.existsSync(jsonPath)) {
            console.error("❌ data.json not found at:", jsonPath);
            process.exit(1);
        }

        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const products = JSON.parse(rawData);

        console.log(`Found ${products.length} products in data.json. Seeding into MongoDB...`);

        // Clear existing or upsert products
        let insertedCount = 0;
        for (const item of products) {
            const priceNum = typeof item.price === 'string' 
                ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
                : item.price;

            let imgPath = item.image || '';
            if (imgPath && !imgPath.startsWith('http')) {
                if (imgPath.startsWith('compressed_by_category')) {
                    imgPath = `/images/${imgPath}`;
                } else if (!imgPath.startsWith('/images/')) {
                    imgPath = `/images/${imgPath.replace(/^\/+/, '')}`;
                }
            }

            await Product.updateOne(
                { id: item.id },
                {
                    $set: {
                        id: item.id,
                        name: item.name,
                        category: item.category,
                        description: item.description,
                        price: priceNum,
                        image: imgPath,
                        brand: item.brand || 'Foot Mart',
                        color: item.color || ''
                    }
                },
                { upsert: true }
            );
            insertedCount++;
        }

        console.log(`✅ Successfully seeded ${insertedCount} products into MongoDB!`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding database:", err);
        process.exit(1);
    }
}

seedData();

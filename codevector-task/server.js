const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// GET /products endpoint
app.get('/products', async (req, res) => {
    try {
        // 1. Extract query params (default limit is 20)
        const limit = parseInt(req.query.limit) || 20;
        const category = req.query.category;
        const cursor = req.query.cursor;

        // 2. Fetch from database using Prisma
        const products = await prisma.product.findMany({
            take: limit,
            // If a cursor exists, skip the cursor itself so we don't send a duplicate
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            where: category ? { category } : undefined,

            // THIS IS THE MOST IMPORTANT PART: Deterministic ordering!
            orderBy: [
                { createdAt: 'desc' },
                { id: 'desc' }
            ],
        });

        // 3. Determine the next cursor
        // If we fetched exactly the 'limit' amount, grab the ID of the very last item
        const nextCursor = products.length === limit ? products[products.length - 1].id : null;

        // 4. Send the response
        res.json({
            products,
            nextCursor
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
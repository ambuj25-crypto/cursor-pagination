const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting to seed 200,000 products... grab a coffee, this might take a minute!');

    const CHUNK_SIZE = 5000;
    const TOTAL_RECORDS = 200000;

    for (let i = 0; i < TOTAL_RECORDS; i += CHUNK_SIZE) {
        const productsChunk = [];

        // Build an array of 5,000 fake products
        for (let j = 0; j < CHUNK_SIZE; j++) {
            productsChunk.push({
                name: faker.commerce.productName(),
                category: faker.commerce.department(),
                price: parseFloat(faker.commerce.price()),
            });
        }

        // Insert all 5,000 at once (Batch Insert)
        await prisma.product.createMany({
            data: productsChunk,
            skipDuplicates: true,
        });

        console.log(`✅ Inserted ${i + CHUNK_SIZE} / ${TOTAL_RECORDS} records`);
    }

    console.log('🎉 Seeding finished successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
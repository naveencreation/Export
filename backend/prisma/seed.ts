import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create Categories
    const electronics = await prisma.category.create({
        data: { name: 'Electronics' },
    });
    const clothing = await prisma.category.create({
        data: { name: 'Clothing' },
    });
    const home = await prisma.category.create({
        data: { name: 'Home & Garden' },
    });

    console.log('Categories created:', [electronics.name, clothing.name, home.name]);

    // Create Products
    await prisma.product.create({
        data: {
            name: 'Wireless Headphones',
            description: 'Premium noise-cancelling headphones.',
            price: 199.99,
            quantity: 15,
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
            categoryId: electronics.id,
        },
    });

    await prisma.product.create({
        data: {
            name: 'Cotton T-Shirt',
            description: '100% organic cotton basic tee.',
            price: 29.99,
            quantity: 50,
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
            categoryId: clothing.id,
        },
    });

    await prisma.product.create({
        data: {
            name: 'Ceramic Vase',
            description: 'Handcrafted ceramic vase for home decor.',
            price: 49.99,
            quantity: 5,
            imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792ca438912?w=500&q=80',
            categoryId: home.id,
        },
    });

    console.log('Products created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

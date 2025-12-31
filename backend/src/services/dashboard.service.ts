import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async () => {
    const totalProducts = await prisma.product.count();
    const totalCategories = await prisma.category.count();

    const [inStock, lowStock, outOfStock] = await Promise.all([
        prisma.product.count({ where: { quantity: { gt: 10 } } }),
        prisma.product.count({ where: { quantity: { gt: 0, lte: 10 } } }),
        prisma.product.count({ where: { quantity: 0 } }),
    ]);

    // Calculate Total Inventory Value
    const allProducts = await prisma.product.findMany({
        select: { price: true, quantity: true },
    });
    const totalInventoryValue = allProducts.reduce(
        (acc, p) => acc + p.price * p.quantity,
        0
    );

    // Fetch Recent Activity (Last 5 products)
    const recentProducts = await prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
    });

    // Calculate Top Categories
    const productsByCategory = await prisma.product.groupBy({
        by: ['categoryId'],
        _count: {
            categoryId: true,
        },
    });

    // Fetch category names for the stats
    const categoryStats = await Promise.all(
        productsByCategory.map(async (item) => {
            const category = await prisma.category.findUnique({
                where: { id: item.categoryId },
                select: { name: true },
            });
            return {
                name: category?.name || 'Uncategorized',
                value: item._count.categoryId,
            };
        })
    );

    // Sort categories by count (descending) and take top 5
    const topCategories = categoryStats
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    return {
        totalProducts,
        totalCategories,
        inStock,
        lowStock,
        outOfStock,
        totalInventoryValue,
        recentProducts,
        topCategories,
    };
};

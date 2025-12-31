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

    // Calculate Total Inventory Value using raw SQL for performance
    const inventoryResult: any[] = await prisma.$queryRaw`
        SELECT SUM(price * quantity) as totalValue FROM Product
    `;
    const totalInventoryValue = inventoryResult[0]?.totalValue || 0;

    // Fetch Recent Activity (Last 5 products)
    const recentProducts = await prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
    });

    // Calculate Top Categories (Database level grouping and sorting)
    const productsByCategory = await prisma.product.groupBy({
        by: ['categoryId'],
        _count: {
            categoryId: true,
        },
        orderBy: {
            _count: {
                categoryId: 'desc',
            }
        },
        take: 5,
    });

    // Efficiently fetch category names
    const categoryIds = productsByCategory.map((item) => item.categoryId);
    const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
    });

    const topCategories = productsByCategory.map((item) => {
        const category = categories.find((c) => c.id === item.categoryId);
        return {
            name: category?.name || 'Uncategorized',
            value: item._count.categoryId,
        };
    });

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

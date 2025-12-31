import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCategories = async () => {
    return await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
};

export const createCategory = async (name: string) => {
    return await prisma.category.create({
        data: { name },
    });
};

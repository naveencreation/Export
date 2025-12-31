import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

export const createProductSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be non-negative'),
    quantity: z.number().int().min(0, 'Quantity must be a non-negative integer'),
    imageUrl: z.string().optional().or(z.literal('')),
    categoryId: z.number().int().positive('Category ID is required'),
    sku: z.string().min(1, 'SKU is required'),
    hsCode: z.string().optional(),
    originCountry: z.string().optional(),
    weight: z.number().min(0).optional(),
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    material: z.string().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
});

export const updateProductSchema = createProductSchema.partial();

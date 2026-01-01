import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import {
    createProductSchema,
    updateProductSchema,
} from '../schemas/validation.schemas';

export const getAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categoryId = req.query.categoryId
            ? Number(req.query.categoryId)
            : undefined;
        const search = req.query.search ? String(req.query.search) : undefined;
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const status = req.query.status ? String(req.query.status) : undefined;
        const priceMin = req.query.priceMin ? Number(req.query.priceMin) : undefined;
        const priceMax = req.query.priceMax ? Number(req.query.priceMax) : undefined;
        const stockStatus = req.query.stockStatus ? String(req.query.stockStatus) : undefined;

        const result = await productService.getAllProducts({ categoryId, search, page, limit, status, priceMin, priceMax, stockStatus });
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);
        const product = await productService.getProductById(id);

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = createProductSchema.parse(req.body);
        const product = await productService.createProduct(data);
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);
        const data = updateProductSchema.parse(req.body);
        const product = await productService.updateProduct(id, data);
        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);
        await productService.deleteProduct(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const bulkDeleteProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: 'Invalid or empty IDs array' });
            return;
        }

        const numericIds = ids.map((id) => Number(id));
        if (numericIds.some(isNaN)) {
            res.status(400).json({ message: 'IDs must be numbers' });
            return;
        }

        const result = await productService.deleteProducts(numericIds);
        res.json({ message: 'Products deleted successfully', count: result.count });
    } catch (error) {
        next(error);
    }
};

export const exportProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const products = await productService.getProductsForExport();

        // CSV Headers
        const headers = [
            'ID',
            'Name',
            'SKU',
            'Description',
            'Price',
            'Quantity',
            'Status',
            'Stock Status',
            'Category',
            'HS Code',
            'Origin Country',
            'Weight',
            'Length',
            'Width',
            'Height',
            'Material',
            'Created At',
            'Updated At'
        ];

        // CSV Rows
        const rows = products.map(p => [
            p.id,
            `"${(p.name || '').replace(/"/g, '""')}"`,
            `"${(p.sku || '').replace(/"/g, '""')}"`,
            `"${(p.description || '').replace(/"/g, '""')}"`,
            p.price,
            p.quantity,
            p.status || 'DRAFT',
            p.stockStatus || '',
            `"${(p.category?.name || '').replace(/"/g, '""')}"`,
            `"${(p.hsCode || '').replace(/"/g, '""')}"`,
            `"${(p.originCountry || '').replace(/"/g, '""')}"`,
            p.weight || '',
            p.length || '',
            p.width || '',
            p.height || '',
            `"${(p.material || '').replace(/"/g, '""')}"`,
            p.createdAt.toISOString(),
            p.updatedAt.toISOString()
        ].join(','));

        const csv = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="products_export.csv"');
        res.send(csv);
    } catch (error) {
        next(error);
    }
};

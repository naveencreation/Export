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

        const result = await productService.getAllProducts(categoryId, search, page, limit);
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

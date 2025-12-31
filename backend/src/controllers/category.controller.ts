import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';
import { createCategorySchema } from '../schemas/validation.schemas';

export const getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name } = createCategorySchema.parse(req.body);
        const category = await categoryService.createCategory(name);
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

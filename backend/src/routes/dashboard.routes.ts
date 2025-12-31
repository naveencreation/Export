import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.get('/stats', dashboardController.getDashboardStats);

export default router;

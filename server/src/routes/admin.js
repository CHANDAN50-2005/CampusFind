import { Router } from 'express';
import { getQueryPlans, listAdminClaims, listAdminItems, moderateItem } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin);
router.get('/items', listAdminItems);
router.patch('/items/:id/status', moderateItem);
router.get('/claims', listAdminClaims);
router.get('/query-plans', getQueryPlans);
export default router;

import { Router } from 'express';
import { createClaim, getClaim, listMyClaims, reviewClaim } from '../controllers/claimController.js';
const router = Router();
router.post('/', createClaim);
router.get('/my', listMyClaims);
router.get('/:id', getClaim);
router.patch('/:id/status', reviewClaim);
export default router;

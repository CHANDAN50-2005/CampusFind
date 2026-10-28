import { Router } from 'express';
import { listMatches, updateMatchStatus } from '../controllers/matchController.js';
const router = Router();
router.get('/', listMatches);
router.patch('/:id/status', updateMatchStatus);
export default router;

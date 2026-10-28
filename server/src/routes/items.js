import { Router } from 'express';
import { closeItem, createItem, getItem, listItems, listMyItems, updateItem } from '../controllers/itemController.js';
import { attachOptionalUser, requireAuth } from '../middleware/auth.js';
import { receiveItemImage, uploadErrorHandler, verifyItemImage } from '../middleware/uploads.js';

const router = Router();
router.get('/', listItems);
router.get('/my', requireAuth, listMyItems);
router.post('/', requireAuth, receiveItemImage, uploadErrorHandler, verifyItemImage, createItem);
router.get('/:id', attachOptionalUser, getItem);
router.patch('/:id', requireAuth, receiveItemImage, uploadErrorHandler, verifyItemImage, updateItem);
router.delete('/:id', requireAuth, closeItem);

export default router;

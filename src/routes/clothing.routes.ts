import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  uploadClothing,
  getClothingItems,
  getClothingItemById,
  deleteClothingItem,
  removeClothingBackground,
} from '../controllers/clothing.controller';

const router = Router();

router.use(authMiddleware);

router.post('/upload', upload.single('image'), uploadClothing);
router.get('/', getClothingItems);
router.get('/:id', getClothingItemById);
router.post('/:id/remove-bg', removeClothingBackground);
router.delete('/:id', deleteClothingItem);

export default router;

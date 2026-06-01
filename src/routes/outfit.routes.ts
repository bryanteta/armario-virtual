import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  generateOutfits,
  getOutfits,
  getOutfitById,
  deleteOutfit,
} from '../controllers/outfit.controller';

const router = Router();

router.use(authMiddleware);

router.post('/generate', generateOutfits);
router.get('/', getOutfits);
router.get('/:id', getOutfitById);
router.delete('/:id', deleteOutfit);

export default router;

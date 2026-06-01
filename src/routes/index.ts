import { Router } from 'express';
import clothingRoutes from './clothing.routes';
import outfitRoutes from './outfit.routes';
import tryonRoutes from './tryon.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Armario Virtual API is running' });
});

router.use('/clothing', clothingRoutes);
router.use('/outfits', outfitRoutes);
router.use('/try-on', tryonRoutes);
router.use('/uploads', uploadRoutes);

export default router;

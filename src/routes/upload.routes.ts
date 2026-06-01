import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadModelPhoto } from '../controllers/upload.controller';

const router = Router();

router.use(authMiddleware);
router.post('/model-photo', upload.single('image'), uploadModelPhoto);

export default router;

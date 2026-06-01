import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tryOn } from '../controllers/tryon.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', tryOn);

export default router;

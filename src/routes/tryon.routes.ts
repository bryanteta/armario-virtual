import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tryOn } from '../controllers/tryon.controller';

const router = Router();

router.use(authMiddleware);

// HuggingFace Space can queue — allow up to 10 minutes
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  res.setTimeout(600_000);
  tryOn(req, res, next);
});

export default router;

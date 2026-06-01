import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getMonthEntries, assignOutfit, removeEntry } from '../controllers/calendar.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', getMonthEntries);
router.post('/', assignOutfit);
router.delete('/:date', removeEntry);

export default router;

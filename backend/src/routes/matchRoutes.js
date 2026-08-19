import { Router } from 'express';
import { getMyMatches, getMatchMessages } from '../controllers/matchController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getMyMatches);
router.get('/:matchId/messages', protect, getMatchMessages);

export default router;

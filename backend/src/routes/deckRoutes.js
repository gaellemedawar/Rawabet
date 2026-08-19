import { Router } from 'express';
import { getInvestorDeck, investorSwipe } from '../controllers/swipeController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(protect, requireRole('investor'));
router.get('/', getInvestorDeck);
router.post('/swipe', investorSwipe);

export default router;

import { Router } from 'express';
import { upsertMyProfile, getMyProfile, deleteMyImage } from '../controllers/businessController.js';
import { getInvestorsWhoLikedMe, businessSwipe } from '../controllers/swipeController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(protect, requireRole('business'));
router.get('/profile', getMyProfile);
router.put('/profile', upload.array('images', 5), upsertMyProfile);
router.delete('/profile/images/:filename', deleteMyImage);

router.get('/likes', getInvestorsWhoLikedMe);
router.post('/swipe', businessSwipe);

export default router;

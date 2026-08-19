import { Router } from 'express';
import { upsertMyProfile, getMyProfile } from '../controllers/investorController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(protect, requireRole('investor'));
router.get('/profile', getMyProfile);
router.put('/profile', upsertMyProfile);

export default router;

import { Router } from 'express';
import { listBusinesses, listInvestors } from '../controllers/browseController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/businesses', protect, listBusinesses);
router.get('/investors', protect, listInvestors);

export default router;

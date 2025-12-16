import { Router } from 'express';
import templateRoutes from './templateRoutes';
import siteRoutes from './siteRoutes';
import guestRoutes from './guestRoutes';
import wishRoutes from './wishRoutes';
import mediaRoutes from './mediaRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/templates', templateRoutes);
router.use('/sites', siteRoutes);
router.use('/guests', guestRoutes);
router.use('/wishes', wishRoutes);
router.use('/media', mediaRoutes);
router.use('/auth', authRoutes);

export default router;

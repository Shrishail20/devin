import { Router } from 'express';
import templateRoutes from './templateRoutes';
import instanceRoutes from './instanceRoutes';
import mediaRoutes from './mediaRoutes';
import authRoutes from './authRoutes';
import componentRoutes from './componentRoutes';

const router = Router();

router.use('/templates', templateRoutes);
router.use('/instances', instanceRoutes);
router.use('/media', mediaRoutes);
router.use('/auth', authRoutes);
router.use('/components', componentRoutes);

export default router;

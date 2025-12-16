import { Router } from 'express';
import { getInstance, exportInstance } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.get('/:id', authenticate, getInstance);
router.get('/:id/export', authenticate, exportInstance);

export default router;

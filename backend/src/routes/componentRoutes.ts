import { Router } from 'express';
import { getComponents, getComponentCategories } from '../controllers';

const router = Router();

router.get('/', getComponents);
router.get('/categories', getComponentCategories);

export default router;

import { Router } from 'express';
import { login, register, logout, getCurrentUser } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;

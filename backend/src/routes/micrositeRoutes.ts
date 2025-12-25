import { Router } from 'express';
import {
  createMicrosite,
  getMicrosites,
  getMicrosite,
  updateMicrosite,
  updateMicrositeSection,
  toggleSection,
  reorderMicrositeSections,
  publishMicrosite,
  unpublishMicrosite,
  deleteMicrosite,
  getMicrositeStats,
  getPublicMicrosite,
  submitMicrositeRsvp,
  submitMicrositeWish
} from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

// Public routes (for guests)
router.get('/public/:slug', getPublicMicrosite);
router.post('/public/:slug/rsvp', submitMicrositeRsvp);
router.post('/public/:slug/wish', submitMicrositeWish);

// Protected routes (for users)
router.post('/', authenticate, createMicrosite);
router.get('/', authenticate, getMicrosites);
router.get('/:id', authenticate, getMicrosite);
router.put('/:id', authenticate, updateMicrosite);
router.delete('/:id', authenticate, deleteMicrosite);
router.post('/:id/publish', authenticate, publishMicrosite);
router.post('/:id/unpublish', authenticate, unpublishMicrosite);
router.get('/:id/stats', authenticate, getMicrositeStats);

// Section management
router.put('/:id/sections/:sectionId', authenticate, updateMicrositeSection);
router.post('/:id/sections/:sectionId/toggle', authenticate, toggleSection);
router.post('/:id/sections/reorder', authenticate, reorderMicrositeSections);

export default router;

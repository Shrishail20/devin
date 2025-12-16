import { Router } from 'express';
import {
  createSite,
  getSites,
  getSite,
  getSiteBySlug,
  updateSite,
  updateSiteSlug,
  updateSectionContent,
  reorderSiteSections,
  publishSite,
  unpublishSite,
  deleteSite,
  getSiteStats
} from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

// Public routes
router.get('/public/:slug', getSiteBySlug);

// Protected routes
router.post('/', authenticate, createSite);
router.get('/', authenticate, getSites);
router.get('/:id', authenticate, getSite);
router.put('/:id', authenticate, updateSite);
router.put('/:id/slug', authenticate, updateSiteSlug);
router.put('/:id/sections/:sectionId', authenticate, updateSectionContent);
router.post('/:id/sections/reorder', authenticate, reorderSiteSections);
router.post('/:id/publish', authenticate, publishSite);
router.post('/:id/unpublish', authenticate, unpublishSite);
router.delete('/:id', authenticate, deleteSite);
router.get('/:id/stats', authenticate, getSiteStats);

export default router;

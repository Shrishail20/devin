import { Router } from 'express';
import {
  createTemplate,
  getTemplates,
  getTemplate,
  getPublishedTemplates,
  updateTemplate,
  updateTemplateVersion,
  deleteTemplate,
  duplicateTemplate,
  publishTemplate,
  unpublishTemplate,
  previewTemplate,
  createNewVersion,
  addSection,
  updateSection,
  deleteSection,
  reorderSections
} from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

// Public routes
router.get('/published', getPublishedTemplates);

// Protected routes (admin)
router.post('/', authenticate, createTemplate);
router.get('/', authenticate, getTemplates);
router.get('/:id', authenticate, getTemplate);
router.put('/:id', authenticate, updateTemplate);
router.put('/:id/version', authenticate, updateTemplateVersion);
router.delete('/:id', authenticate, deleteTemplate);
router.post('/:id/duplicate', authenticate, duplicateTemplate);
router.post('/:id/publish', authenticate, publishTemplate);
router.post('/:id/unpublish', authenticate, unpublishTemplate);
router.post('/:id/preview', authenticate, previewTemplate);
router.post('/:id/new-version', authenticate, createNewVersion);

// Section management
router.post('/:id/sections', authenticate, addSection);
router.put('/:id/sections/:sectionId', authenticate, updateSection);
router.delete('/:id/sections/:sectionId', authenticate, deleteSection);
router.post('/:id/sections/reorder', authenticate, reorderSections);

export default router;

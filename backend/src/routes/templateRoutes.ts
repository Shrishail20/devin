import { Router } from 'express';
import {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  publishTemplate,
  previewTemplate,
  createInstance,
  getInstance,
  exportInstance
} from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.post('/', authenticate, createTemplate);
router.get('/', authenticate, getTemplates);
router.get('/:id', authenticate, getTemplate);
router.put('/:id', authenticate, updateTemplate);
router.delete('/:id', authenticate, deleteTemplate);
router.post('/:id/duplicate', authenticate, duplicateTemplate);
router.post('/:id/publish', authenticate, publishTemplate);
router.post('/:id/preview', authenticate, previewTemplate);
router.post('/:id/instances', authenticate, createInstance);

export default router;

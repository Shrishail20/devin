import { Router } from 'express';
import {
  getWishes,
  getWishStats,
  approveWish,
  rejectWish,
  toggleHighlight,
  deleteWish,
  bulkApprove,
  bulkReject,
  bulkDelete,
  submitWish,
  getApprovedWishes
} from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

// Public routes
router.post('/:siteId', submitWish);
router.get('/:siteId/approved', getApprovedWishes);

// Protected routes
router.get('/:siteId', authenticate, getWishes);
router.get('/:siteId/stats', authenticate, getWishStats);
router.post('/:siteId/:wishId/approve', authenticate, approveWish);
router.post('/:siteId/:wishId/reject', authenticate, rejectWish);
router.post('/:siteId/:wishId/highlight', authenticate, toggleHighlight);
router.delete('/:siteId/:wishId', authenticate, deleteWish);
router.post('/:siteId/bulk/approve', authenticate, bulkApprove);
router.post('/:siteId/bulk/reject', authenticate, bulkReject);
router.post('/:siteId/bulk/delete', authenticate, bulkDelete);

export default router;

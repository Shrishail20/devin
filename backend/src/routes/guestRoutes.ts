import { Router } from 'express';
import {
  getGuests,
  getGuestStats,
  updateGuestStatus,
  deleteGuest,
  exportGuests,
  submitRsvp,
  lookupRsvp,
  updateRsvp
} from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

// Public routes (for guests submitting RSVPs)
router.post('/:siteId/rsvp', submitRsvp);
router.post('/:siteId/rsvp/lookup', lookupRsvp);
router.put('/:siteId/rsvp', updateRsvp);

// Protected routes (for site owners)
router.get('/:siteId', authenticate, getGuests);
router.get('/:siteId/stats', authenticate, getGuestStats);
router.put('/:siteId/:guestId/status', authenticate, updateGuestStatus);
router.delete('/:siteId/:guestId', authenticate, deleteGuest);
router.get('/:siteId/export', authenticate, exportGuests);

export default router;

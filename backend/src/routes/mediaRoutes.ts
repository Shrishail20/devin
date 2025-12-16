import { Router } from 'express';
import {
  uploadMedia,
  getMediaList,
  getMedia,
  deleteMedia,
  serveMedia
} from '../controllers';
import { authenticate, upload } from '../middleware';

const router = Router();

router.post('/upload', authenticate, upload.single('file'), uploadMedia);
router.get('/', authenticate, getMediaList);
router.get('/serve/:filename', serveMedia);
router.get('/:id', authenticate, getMedia);
router.delete('/:id', authenticate, deleteMedia);

export default router;

import express from 'express';
import {
  applyArtist,
  getArtists,
  getArtistById,
  getMyArtistProfile,
  reviewArtist,
  updateArtistProfile,
  suspendArtist
} from '../controllers/artistController';
import { authenticate, requireAdmin, requireMerchant } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { validate, schemas } from '../middleware/validate';

const router = express.Router();

router.get('/', validate(schemas.artist.getList, 'query'), getArtists);
router.get('/:id', getArtistById);

router.use(authenticate);
router.post('/apply', validate(schemas.artist.apply, 'body'), operationLog('artist', '申请成为艺术家'), applyArtist);
router.get('/me/profile', getMyArtistProfile);
router.put('/me/profile', validate(schemas.artist.apply, 'body'), operationLog('artist', '更新艺术家资料'), updateArtistProfile);

router.use(requireAdmin);
router.put('/:id/review', validate(schemas.artist.review, 'body'), operationLog('artist', '审核艺术家申请'), reviewArtist);
router.put('/:id/suspend', validate(schemas.artist.suspend, 'body'), operationLog('artist', '暂停艺术家'), suspendArtist);

export default router;

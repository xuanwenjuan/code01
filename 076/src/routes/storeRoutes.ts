import { Router } from 'express';
import {
  createStore,
  updateStore,
  deleteStore,
  getStore,
  getStoreList,
  getAllStores
} from '../controllers/storeController';
import { authenticate, requireSuperAdmin, requireStoreManager } from '../middleware/auth';

const router = Router();

router.get('/all', getAllStores);

router.use(authenticate);
router.get('/', getStoreList);
router.get('/:id', getStore);

router.use(requireStoreManager);
router.put('/:id', updateStore);

router.use(requireSuperAdmin);
router.post('/', createStore);
router.delete('/:id', deleteStore);

export default router;

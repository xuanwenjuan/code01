import { Router } from 'express';
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomer,
  getCustomerList,
  batchUpdateStatus
} from '../controllers/customer.controller';
import { authenticateJWT, requireOperator } from '../middlewares/jwt.middleware';
import { validate, validateId, createCustomerSchema } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/:id', validate(validateId, 'params'), getCustomer);
router.get('/', getCustomerList);

router.use(requireOperator);

router.post('/', validate(createCustomerSchema), createCustomer);
router.put('/:id', validate(validateId, 'params'), updateCustomer);
router.delete('/:id', validate(validateId, 'params'), deleteCustomer);
router.patch('/batch/status', batchUpdateStatus);

export default router;

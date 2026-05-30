import { Router } from 'express';
import Joi from 'joi';
import {
  createAddress,
  getAddressList,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController';
import { authMiddleware } from '../middlewares/auth';
import { validate, validateIdParam } from '../middlewares/validate';

const router = Router();

const addressSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  province: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  detail: Joi.string().required(),
  isDefault: Joi.number().valid(0, 1).default(0),
});

router.use(authMiddleware);
router.post('/', validate({ body: addressSchema }), createAddress);
router.get('/list', getAddressList);
router.get('/:id', validate({ params: validateIdParam }), getAddressById);
router.put('/:id', validate({ params: validateIdParam, body: addressSchema }), updateAddress);
router.delete('/:id', validate({ params: validateIdParam }), deleteAddress);
router.put('/:id/default', validate({ params: validateIdParam }), setDefaultAddress);

export default router;

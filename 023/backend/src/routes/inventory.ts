import express from 'express';
import * as controller from '../controllers/inventory.controller';

const router = express.Router();

router.get('/', controller.getLogs);
router.get('/:id', controller.getLog);
router.post('/inbound', controller.createInbound);
router.post('/sale', controller.createSale);
router.post('/defective', controller.createDefective);

export default router;

import express from 'express';
import * as controller from '../controllers/operation.controller';

const router = express.Router();

router.get('/', controller.getLogs);
router.get('/module/:module', controller.getLogsByModule);

export default router;

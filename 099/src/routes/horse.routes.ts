import { Router } from 'express';
import { horseController } from '../controllers/horse.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { horseSchemas, stableSchemas } from '../validations';

const router = Router();

router.post('/', authenticate, authorize('horse:write'), validate({ body: horseSchemas.create.body }), horseController.createHorse);
router.get('/', authenticate, authorize('horse:read'), validate({ query: horseSchemas.list.query }), horseController.getHorses);
router.get('/vaccination-reminders', authenticate, authorize('horse:read'), horseController.getVaccinationReminders);
router.get('/statistics', authenticate, authorize('horse:read'), horseController.getHorseStatistics);
router.post('/:id/vaccination', authenticate, authorize('horse:vaccination'), validate({ params: horseSchemas.update.params, body: horseSchemas.vaccination.body }), horseController.recordVaccination);
router.get('/:id', authenticate, authorize('horse:read'), validate({ params: horseSchemas.update.params }), horseController.getHorse);
router.put('/:id', authenticate, authorize('horse:write'), validate({ params: horseSchemas.update.params, body: horseSchemas.update.body }), horseController.updateHorse);
router.delete('/:id', authenticate, authorize('horse:delete'), validate({ params: horseSchemas.update.params }), horseController.deleteHorse);

router.post('/stables', authenticate, authorize('stable:write'), validate({ body: stableSchemas.create.body }), horseController.createStable);
router.get('/stables', authenticate, authorize('stable:read'), horseController.getStables);
router.get('/stables/:id', authenticate, authorize('stable:read'), validate({ params: stableSchemas.update.params }), horseController.getStable);
router.put('/stables/:id', authenticate, authorize('stable:write'), validate({ params: stableSchemas.update.params, body: stableSchemas.update.body }), horseController.updateStable);
router.delete('/stables/:id', authenticate, authorize('stable:delete'), validate({ params: stableSchemas.update.params }), horseController.deleteStable);

export default router;

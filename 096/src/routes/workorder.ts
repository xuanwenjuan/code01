import { Router } from 'express';
import WorkOrderController from '../controllers/WorkOrderController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate';
import { operationLog, LogModules, LogOperations } from '../middlewares/operationLog';
import {
  createWorkOrderSchema,
  updateWorkOrderSchema,
  getWorkOrderListSchema,
  workOrderIdSchema,
  assignRepairerSchema,
  submitQuotationSchema,
  completeRepairSchema,
  submitInspectionSchema,
  putOnConsignSchema,
  markAsSoldSchema
} from '../validations/workorder.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/my-workorders',
  authorize('workorder:myWorkOrders'),
  validateQuery(getWorkOrderListSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.LIST }),
  WorkOrderController.getMyWorkOrders
);

router.get(
  '/list',
  authorize('workorder:view'),
  validateQuery(getWorkOrderListSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.LIST }),
  WorkOrderController.getWorkOrderList
);

router.get(
  '/:id',
  authorize('workorder:view'),
  validateParams(workOrderIdSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.VIEW }),
  WorkOrderController.getWorkOrderById
);

router.post(
  '/',
  authorize('workorder:create'),
  validateBody(createWorkOrderSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.CREATE }),
  WorkOrderController.createWorkOrder
);

router.put(
  '/:id',
  authorize('workorder:update'),
  validateParams(workOrderIdSchema),
  validateBody(updateWorkOrderSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.UPDATE }),
  WorkOrderController.updateWorkOrder
);

router.patch(
  '/:id/assign-repairer',
  authorize('workorder:assignRepairer'),
  validateParams(workOrderIdSchema),
  validateBody(assignRepairerSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.ASSIGN_REPAIRER }),
  WorkOrderController.assignRepairer
);

router.patch(
  '/:id/submit-inspection',
  authorize('workorder:submitInspection'),
  validateParams(workOrderIdSchema),
  validateBody(submitInspectionSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.SUBMIT_INSPECTION }),
  WorkOrderController.submitInspection
);

router.patch(
  '/:id/submit-quotation',
  authorize('workorder:submitQuotation'),
  validateParams(workOrderIdSchema),
  validateBody(submitQuotationSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.SUBMIT_QUOTATION }),
  WorkOrderController.submitQuotation
);

router.patch(
  '/:id/confirm-quotation',
  authorize('workorder:confirmQuotation'),
  validateParams(workOrderIdSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.CONFIRM_QUOTATION }),
  WorkOrderController.confirmQuotation
);

router.patch(
  '/:id/reject-quotation',
  authorize('workorder:rejectQuotation'),
  validateParams(workOrderIdSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.REJECT_QUOTATION }),
  WorkOrderController.rejectQuotation
);

router.patch(
  '/:id/start-repair',
  authorize('workorder:startRepair'),
  validateParams(workOrderIdSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.START_REPAIR }),
  WorkOrderController.startRepair
);

router.patch(
  '/:id/complete-repair',
  authorize('workorder:completeRepair'),
  validateParams(workOrderIdSchema),
  validateBody(completeRepairSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.COMPLETE_REPAIR }),
  WorkOrderController.completeRepair
);

router.patch(
  '/:id/deliver',
  authorize('workorder:deliver'),
  validateParams(workOrderIdSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.DELIVER }),
  WorkOrderController.deliverToCustomer
);

router.patch(
  '/:id/put-on-consign',
  authorize('workorder:putOnConsign'),
  validateParams(workOrderIdSchema),
  validateBody(putOnConsignSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.PUT_ON_CONSIGN }),
  WorkOrderController.putOnConsign
);

router.patch(
  '/:id/mark-sold',
  authorize('workorder:markSold'),
  validateParams(workOrderIdSchema),
  validateBody(markAsSoldSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.MARK_SOLD }),
  WorkOrderController.markAsSold
);

router.patch(
  '/:id/cancel',
  authorize('workorder:cancel'),
  validateParams(workOrderIdSchema),
  operationLog({ module: LogModules.WORKORDER, operation: LogOperations.CANCEL }),
  WorkOrderController.cancelWorkOrder
);

export default router;

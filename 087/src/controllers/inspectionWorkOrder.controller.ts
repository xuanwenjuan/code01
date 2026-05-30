import { Request, Response, NextFunction } from 'express';
import inspectionWorkOrderService from '../services/inspectionWorkOrder.service';
import { ResponseUtil } from '../utils/response';

class InspectionWorkOrderController {
  async createWorkOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        createdBy: req.user?.userId
      };
      const workOrder = await inspectionWorkOrderService.createWorkOrder(data, req);
      res.json(ResponseUtil.success(workOrder, '创建成功'));
    } catch (error) {
      next(error);
    }
  }

  async batchCreateWorkOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        createdBy: req.user?.userId
      };
      const workOrders = await inspectionWorkOrderService.batchCreateWorkOrders(data);
      res.json(ResponseUtil.success(workOrders, '批量创建成功'));
    } catch (error) {
      next(error);
    }
  }

  async updateWorkOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const workOrder = await inspectionWorkOrderService.updateWorkOrder(Number(id), req.body, req);
      res.json(ResponseUtil.success(workOrder, '更新成功'));
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await inspectionWorkOrderService.deleteWorkOrder(Number(id), req);
      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      next(error);
    }
  }

  async getWorkOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const workOrder = await inspectionWorkOrderService.getWorkOrderById(Number(id));
      res.json(ResponseUtil.success(workOrder));
    } catch (error) {
      next(error);
    }
  }

  async getWorkOrderList(req: Request, res: Response, next: NextFunction) {
    try {
      const params = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined
      };
      const result = await inspectionWorkOrderService.getWorkOrderList(params);
      res.json(ResponseUtil.success(result));
    } catch (error) {
      next(error);
    }
  }

  async startInspection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const inspectorId = req.user?.userId as number;
      const workOrder = await inspectionWorkOrderService.startInspection(Number(id), inspectorId, req);
      res.json(ResponseUtil.success(workOrder, '开始巡检'));
    } catch (error) {
      next(error);
    }
  }

  async submitInspectionResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const workOrder = await inspectionWorkOrderService.submitInspectionResult(Number(id), req.body, req);
      res.json(ResponseUtil.success(workOrder, '巡检结果提交成功'));
    } catch (error) {
      next(error);
    }
  }

  async assignMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { maintenancePersonId } = req.body;
      const workOrder = await inspectionWorkOrderService.assignMaintenance(Number(id), maintenancePersonId, req);
      res.json(ResponseUtil.success(workOrder, '维修人员分配成功'));
    } catch (error) {
      next(error);
    }
  }

  async submitMaintenanceResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const workOrder = await inspectionWorkOrderService.submitMaintenanceResult(Number(id), req.body, req);
      res.json(ResponseUtil.success(workOrder, '维修结果提交成功'));
    } catch (error) {
      next(error);
    }
  }

  async submitReinspectionResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const workOrder = await inspectionWorkOrderService.submitReinspectionResult(Number(id), req.body, req);
      res.json(ResponseUtil.success(workOrder, '复检结果提交成功'));
    } catch (error) {
      next(error);
    }
  }

  async getOverdueWorkOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const workOrders = await inspectionWorkOrderService.getOverdueWorkOrders();
      res.json(ResponseUtil.success(workOrders));
    } catch (error) {
      next(error);
    }
  }

  async getWorkOrderStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const statistics = await inspectionWorkOrderService.getWorkOrderStatistics();
      res.json(ResponseUtil.success(statistics));
    } catch (error) {
      next(error);
    }
  }
}

export default new InspectionWorkOrderController();

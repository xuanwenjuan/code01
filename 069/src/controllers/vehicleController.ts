import { Response, NextFunction } from 'express';
import vehicleService from '../services/vehicleService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { VehicleStatus } from '../models/Vehicle';

class VehicleController {
  async createVehicle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      ResponseUtil.success(res, vehicle, '车辆创建成功');
    } catch (error) {
      next(error);
    }
  }

  async updateVehicle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.updateVehicle(Number(id), req.body);
      ResponseUtil.success(res, vehicle, '车辆更新成功');
    } catch (error) {
      next(error);
    }
  }

  async deleteVehicle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await vehicleService.deleteVehicle(Number(id));
      ResponseUtil.success(res, null, '车辆删除成功');
    } catch (error) {
      next(error);
    }
  }

  async getVehicleById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.getVehicleById(Number(id));
      ResponseUtil.success(res, vehicle);
    } catch (error) {
      next(error);
    }
  }

  async getVehicleList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { branchId, status, vehicleType, vehicleTypes, minLoadCapacity, maxLoadCapacity, minLoadVolume, maxLoadVolume, keyword, page, pageSize, sortBy, sortOrder } = req.query;
      
      let parsedVehicleTypes: string[] | undefined;
      if (vehicleTypes) {
        if (Array.isArray(vehicleTypes)) {
          parsedVehicleTypes = vehicleTypes as string[];
        } else if (typeof vehicleTypes === 'string') {
          parsedVehicleTypes = vehicleTypes.split(',').map(t => t.trim());
        }
      }

      const result = await vehicleService.getVehicleList({
        branchId: branchId ? Number(branchId) : undefined,
        status: status as VehicleStatus,
        vehicleType: vehicleType as string,
        vehicleTypes: parsedVehicleTypes,
        minLoadCapacity: minLoadCapacity ? Number(minLoadCapacity) : undefined,
        maxLoadCapacity: maxLoadCapacity ? Number(maxLoadCapacity) : undefined,
        minLoadVolume: minLoadVolume ? Number(minLoadVolume) : undefined,
        maxLoadVolume: maxLoadVolume ? Number(maxLoadVolume) : undefined,
        keyword: keyword as string,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC'
      });
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateVehicleStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, remark } = req.body;
      const vehicle = await vehicleService.updateVehicleStatus(
        Number(id),
        status,
        req.user?.id,
        remark
      );
      ResponseUtil.success(res, vehicle, '状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  async bindBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { branchId } = req.body;
      const vehicle = await vehicleService.bindBranch(Number(id), branchId);
      ResponseUtil.success(res, vehicle, '绑定网点成功');
    } catch (error) {
      next(error);
    }
  }

  async getExpiringVehicles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { days } = req.query;
      const vehicles = await vehicleService.getExpiringVehicles(days ? Number(days) : 30);
      ResponseUtil.success(res, vehicles);
    } catch (error) {
      next(error);
    }
  }

  async getAvailableVehicles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { branchId, minCapacity, maxCapacity } = req.query;
      const vehicles = await vehicleService.getAvailableVehicles(
        branchId ? Number(branchId) : undefined,
        minCapacity ? Number(minCapacity) : undefined,
        maxCapacity ? Number(maxCapacity) : undefined
      );
      ResponseUtil.success(res, vehicles);
    } catch (error) {
      next(error);
    }
  }

  async getVehicleStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { branchId } = req.query;
      const stats = await vehicleService.getVehicleStats(
        branchId ? Number(branchId) : undefined
      );
      ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new VehicleController();

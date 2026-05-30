import { Response } from 'express';
import { supplierService } from '../services/supplier.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { SupplierStatus } from '../constants/business';

export class SupplierController {
  async create(req: AuthRequest, res: Response) {
    const supplier = await supplierService.createSupplier(req.body);
    return ResponseUtil.success(res, supplier);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const supplier = await supplierService.updateSupplier(Number(id), req.body);
    return ResponseUtil.success(res, supplier);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await supplierService.deleteSupplier(Number(id));
    return ResponseUtil.success(res, null, '删除成功');
  }

  async get(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const supplier = await supplierService.getSupplier(Number(id));
    return ResponseUtil.success(res, supplier);
  }

  async getList(req: AuthRequest, res: Response) {
    const { page, pageSize, name, code, status, qualificationExpiring } = req.query;
    const result = await supplierService.getSupplierList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      name: name as string,
      code: code as string,
      status: status as SupplierStatus,
      qualificationExpiring: qualificationExpiring === 'true',
    });
    return ResponseUtil.success(res, result);
  }
}

export const supplierController = new SupplierController();

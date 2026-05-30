import LowStockAlert, { AlertStatus } from '../models/LowStockAlert';
import { BusinessError } from '../middlewares/errorHandler';
import { Op } from 'sequelize';

class AlertService {
  async getLowStockAlerts(params: {
    status?: AlertStatus;
    warehouseId?: number;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};
    
    if (params.status !== undefined) {
      where.status = params.status;
    }
    if (params.warehouseId) {
      where.warehouseId = params.warehouseId;
    }
    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }
    if (params.startDate && params.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(params.startDate), new Date(params.endDate)]
      };
    }

    return LowStockAlert.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
  }

  async getById(id: number) {
    const alert = await LowStockAlert.findByPk(id);
    if (!alert) {
      throw new BusinessError('预警记录不存在', 404);
    }
    return alert;
  }

  async processAlert(id: number, processedBy: number, remark?: string) {
    const alert = await LowStockAlert.findByPk(id);
    if (!alert) {
      throw new BusinessError('预警记录不存在', 404);
    }
    if (alert.status !== AlertStatus.PENDING) {
      throw new BusinessError('只能处理待处理状态的预警', 400);
    }

    return alert.update({
      status: AlertStatus.PROCESSED,
      processedBy,
      processedAt: new Date(),
      remark
    });
  }

  async ignoreAlert(id: number, processedBy: number, remark?: string) {
    const alert = await LowStockAlert.findByPk(id);
    if (!alert) {
      throw new BusinessError('预警记录不存在', 404);
    }
    if (alert.status !== AlertStatus.PENDING) {
      throw new BusinessError('只能忽略待处理状态的预警', 400);
    }

    return alert.update({
      status: AlertStatus.IGNORED,
      processedBy,
      processedAt: new Date(),
      remark
    });
  }

  async getPendingCount() {
    return LowStockAlert.count({
      where: { status: AlertStatus.PENDING }
    });
  }

  async batchProcess(ids: number[], processedBy: number, remark?: string) {
    const result = await LowStockAlert.update(
      {
        status: AlertStatus.PROCESSED,
        processedBy,
        processedAt: new Date(),
        remark
      },
      {
        where: {
          id: { [Op.in]: ids },
          status: AlertStatus.PENDING
        }
      }
    );
    return result;
  }
}

export default new AlertService();

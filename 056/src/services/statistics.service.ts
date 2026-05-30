import { Op, fn } from 'sequelize';
import sequelize from '../config/database';
import { Equipment, InspectionTask, WorkOrder, Department } from '../models';
import { EquipmentStatus, InspectionStatus, WorkOrderStatus } from '../types';
import dayjs from 'dayjs';

interface EquipmentStatistics {
  total: number;
  status: Record<string, number>;
}

interface InspectionStatistics {
  total: number;
  status: Record<string, number>;
  today: number;
}

interface WorkOrderStatistics {
  total: number;
  status: Record<string, number>;
  type: Record<string, number>;
}

interface DashboardData {
  equipment: EquipmentStatistics;
  inspection: InspectionStatistics;
  workOrder: WorkOrderStatistics;
}

interface EquipmentByDepartment {
  departmentId: number;
  departmentName: string;
  count: number;
}

interface DateStatisticsItem {
  date: string;
  count: number;
}

interface MonthlyTrendItem {
  month: number;
  inspections: number;
  workOrders: number;
}

export class StatisticsService {
  async getDashboard(): Promise<DashboardData> {
    const [equipmentStats, inspectionStats, workOrderStats] = await Promise.all([
      this.getEquipmentStatistics(),
      this.getInspectionStatistics(),
      this.getWorkOrderStatistics(),
    ]);

    return {
      equipment: equipmentStats,
      inspection: inspectionStats,
      workOrder: workOrderStats,
    };
  }

  async getEquipmentStatistics(): Promise<EquipmentStatistics> {
    const total = await Equipment.count();

    const statusResult = await Equipment.findAll({
      attributes: [
        'status',
        [fn('COUNT', 'id'), 'count'],
      ],
      group: ['status'],
    });

    const statusMap: Record<string, number> = {
      [EquipmentStatus.NORMAL]: 0,
      [EquipmentStatus.FAULT]: 0,
      [EquipmentStatus.SCRAPPED]: 0,
    };

    statusResult.forEach((item) => {
      const status = item.getDataValue('status') as string;
      statusMap[status] = Number(item.getDataValue('count'));
    });

    return {
      total,
      status: statusMap,
    };
  }

  async getInspectionStatistics(): Promise<InspectionStatistics> {
    const total = await InspectionTask.count();

    const statusResult = await InspectionTask.findAll({
      attributes: [
        'status',
        [fn('COUNT', 'id'), 'count'],
      ],
      group: ['status'],
    });

    const statusMap: Record<string, number> = {
      [InspectionStatus.PENDING]: 0,
      [InspectionStatus.IN_PROGRESS]: 0,
      [InspectionStatus.COMPLETED]: 0,
      [InspectionStatus.EXCEPTION]: 0,
    };

    statusResult.forEach((item) => {
      const status = item.getDataValue('status') as string;
      statusMap[status] = Number(item.getDataValue('count'));
    });

    const today = dayjs().startOf('day').toDate();
    const todayCount = await InspectionTask.count({
      where: {
        scheduledDate: {
          [Op.gte]: today,
        },
      },
    });

    return {
      total,
      status: statusMap,
      today: todayCount,
    };
  }

  async getWorkOrderStatistics(): Promise<WorkOrderStatistics> {
    const total = await WorkOrder.count();

    const statusResult = await WorkOrder.findAll({
      attributes: [
        'status',
        [fn('COUNT', 'id'), 'count'],
      ],
      group: ['status'],
    });

    const statusMap: Record<string, number> = {
      [WorkOrderStatus.PENDING]: 0,
      [WorkOrderStatus.ASSIGNED]: 0,
      [WorkOrderStatus.IN_PROGRESS]: 0,
      [WorkOrderStatus.COMPLETED]: 0,
      [WorkOrderStatus.ACCEPTED]: 0,
      [WorkOrderStatus.CLOSED]: 0,
    };

    statusResult.forEach((item) => {
      const status = item.getDataValue('status') as string;
      statusMap[status] = Number(item.getDataValue('count'));
    });

    const typeResult = await WorkOrder.findAll({
      attributes: [
        'type',
        [fn('COUNT', 'id'), 'count'],
      ],
      group: ['type'],
    });

    const typeMap: Record<string, number> = {};
    typeResult.forEach((item) => {
      const type = item.getDataValue('type') as string;
      typeMap[type] = Number(item.getDataValue('count'));
    });

    return {
      total,
      status: statusMap,
      type: typeMap,
    };
  }

  async getEquipmentByDepartment(): Promise<EquipmentByDepartment[]> {
    const result = await Equipment.findAll({
      attributes: [
        'departmentId',
        [fn('COUNT', 'id'), 'count'],
      ],
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
      ],
      group: ['departmentId'],
    });

    return result.map((item) => ({
      departmentId: item.departmentId,
      departmentName: item.department?.name || '未分配',
      count: Number(item.getDataValue('count')),
    }));
  }

  async getInspectionByDateRange(startDate: Date, endDate: Date): Promise<DateStatisticsItem[]> {
    const result = await InspectionTask.findAll({
      attributes: [
        [fn('DATE', 'scheduledDate'), 'date'],
        [fn('COUNT', 'id'), 'count'],
      ],
      where: {
        scheduledDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [fn('DATE', 'scheduledDate')],
      order: [[fn('DATE', 'scheduledDate'), 'ASC']],
    });

    return result.map((item) => ({
      date: item.getDataValue('date') as string,
      count: Number(item.getDataValue('count')),
    }));
  }

  async getWorkOrderByDateRange(startDate: Date, endDate: Date): Promise<DateStatisticsItem[]> {
    const result = await WorkOrder.findAll({
      attributes: [
        [fn('DATE', 'reportedAt'), 'date'],
        [fn('COUNT', 'id'), 'count'],
      ],
      where: {
        reportedAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [fn('DATE', 'reportedAt')],
      order: [[fn('DATE', 'reportedAt'), 'ASC']],
    });

    return result.map((item) => ({
      date: item.getDataValue('date') as string,
      count: Number(item.getDataValue('count')),
    }));
  }

  async getMonthlyTrend(year: number): Promise<MonthlyTrendItem[]> {
    const startDate = dayjs(`${year}-01-01`).toDate();
    const endDate = dayjs(`${year}-12-31`).toDate();

    const [inspectionResult, workOrderResult] = await Promise.all([
      InspectionTask.findAll({
        attributes: [
          [fn('MONTH', 'scheduledDate'), 'month'],
          [fn('COUNT', 'id'), 'count'],
        ],
        where: {
          scheduledDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: [fn('MONTH', 'scheduledDate')],
      }),
      WorkOrder.findAll({
        attributes: [
          [fn('MONTH', 'reportedAt'), 'month'],
          [fn('COUNT', 'id'), 'count'],
        ],
        where: {
          reportedAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: [fn('MONTH', 'reportedAt')],
      }),
    ]);

    const inspectionMap: Record<number, number> = {};
    const workOrderMap: Record<number, number> = {};

    inspectionResult.forEach((item) => {
      const month = Number(item.getDataValue('month'));
      inspectionMap[month] = Number(item.getDataValue('count'));
    });

    workOrderResult.forEach((item) => {
      const month = Number(item.getDataValue('month'));
      workOrderMap[month] = Number(item.getDataValue('count'));
    });

    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return months.map((month) => ({
      month,
      inspections: inspectionMap[month] || 0,
      workOrders: workOrderMap[month] || 0,
    }));
  }
}

export default new StatisticsService();

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { WorkOrderStatus } from '../types';

export interface InspectionWorkOrderAttributes {
  id?: number;
  orderNo: string;
  siteId: number;
  equipmentCategoryId?: number;
  plannedDate: Date;
  actualDate?: Date;
  inspectorId?: number;
  status: WorkOrderStatus;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: string;
  airPressure?: number;
  radiation?: number;
  equipmentCheckResult?: string;
  faultDescription?: string;
  maintenanceMeasures?: string;
  maintenancePersonId?: number;
  maintenanceCost?: number;
  reinspectionDate?: Date;
  reinspectionResult?: string;
  remark?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class InspectionWorkOrder extends Model<InspectionWorkOrderAttributes> implements InspectionWorkOrderAttributes {
  public id!: number;
  public orderNo!: string;
  public siteId!: number;
  public equipmentCategoryId?: number;
  public plannedDate!: Date;
  public actualDate?: Date;
  public inspectorId?: number;
  public status!: WorkOrderStatus;
  public temperature?: number;
  public humidity?: number;
  public windSpeed?: number;
  public windDirection?: string;
  public airPressure?: number;
  public radiation?: number;
  public equipmentCheckResult?: string;
  public faultDescription?: string;
  public maintenanceMeasures?: string;
  public maintenancePersonId?: number;
  public maintenanceCost?: number;
  public reinspectionDate?: Date;
  public reinspectionResult?: string;
  public remark?: string;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InspectionWorkOrder.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '工单编号'
    },
    siteId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '站点ID'
    },
    equipmentCategoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '设备类目ID'
    },
    plannedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '计划巡检日期'
    },
    actualDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '实际巡检日期'
    },
    inspectorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '巡检人员ID'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      allowNull: false,
      defaultValue: WorkOrderStatus.PENDING,
      comment: '工单状态'
    },
    temperature: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '温度(℃)'
    },
    humidity: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '湿度(%)'
    },
    windSpeed: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '风速(m/s)'
    },
    windDirection: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '风向'
    },
    airPressure: {
      type: DataTypes.DECIMAL(7, 2),
      allowNull: true,
      comment: '气压(hPa)'
    },
    radiation: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '辐射(W/m²)'
    },
    equipmentCheckResult: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '设备检查结果'
    },
    faultDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '故障描述'
    },
    maintenanceMeasures: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '维修措施'
    },
    maintenancePersonId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '维修人员ID'
    },
    maintenanceCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: '维修费用'
    },
    reinspectionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '复检日期'
    },
    reinspectionResult: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '复检结果'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '创建人'
    }
  },
  {
    sequelize,
    tableName: 'inspection_work_orders',
    modelName: 'InspectionWorkOrder'
  }
);

export default InspectionWorkOrder;

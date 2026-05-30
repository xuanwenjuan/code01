import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Collection from './Collection';
import User from './User';

export enum WorkOrderType {
  REPAIR = 'repair',
  CONSIGN = 'consign'
}

export enum WorkOrderStatus {
  PENDING_INSPECTION = 'pending_inspection',
  INSPECTING = 'inspecting',
  PENDING_QUOTATION = 'pending_quotation',
  QUOTATION_SENT = 'quotation_sent',
  QUOTATION_APPROVED = 'quotation_approved',
  QUOTATION_REJECTED = 'quotation_rejected',
  IN_REPAIR = 'in_repair',
  REPAIR_COMPLETED = 'repair_completed',
  PENDING_DELIVERY = 'pending_delivery',
  DELIVERED = 'delivered',
  ON_CONSIGN = 'on_consign',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

export interface WorkOrderAttributes {
  id?: number;
  orderNo: string;
  type: WorkOrderType;
  collectionId: number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  faultDescription?: string;
  inspectionReport?: string;
  estimatedCost?: number;
  quotationTime?: Date;
  quotationExpireTime?: Date;
  repairerId?: number;
  repairStartTime?: Date;
  repairEndTime?: Date;
  repairDescription?: string;
  actualCost?: number;
  laborFee?: number;
  partsFee?: number;
  commissionRate?: number;
  commissionAmount?: number;
  salePrice?: number;
  platformShare?: number;
  storeShare?: number;
  repairerShare?: number;
  ownerAmount?: number;
  settlementStatus?: string;
  settledAt?: Date;
  status: WorkOrderStatus;
  priority?: number;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class WorkOrder extends Model<WorkOrderAttributes> implements WorkOrderAttributes {
  public id!: number;
  public orderNo!: string;
  public type!: WorkOrderType;
  public collectionId!: number;
  public customerName!: string;
  public customerPhone!: string;
  public customerAddress?: string;
  public faultDescription?: string;
  public inspectionReport?: string;
  public estimatedCost?: number;
  public quotationTime?: Date;
  public quotationExpireTime?: Date;
  public repairerId?: number;
  public repairStartTime?: Date;
  public repairEndTime?: Date;
  public repairDescription?: string;
  public actualCost?: number;
  public laborFee?: number;
  public partsFee?: number;
  public commissionRate?: number;
  public commissionAmount?: number;
  public salePrice?: number;
  public status!: WorkOrderStatus;
  public priority?: number;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly collection?: Collection;
  public readonly repairer?: User;
  public readonly creator?: User;
}

WorkOrder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '工单号'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(WorkOrderType)),
      allowNull: false,
      comment: '工单类型'
    },
    collectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '藏品ID'
    },
    customerName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '客户姓名'
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '客户电话'
    },
    customerAddress: {
      type: DataTypes.STRING(500),
      comment: '客户地址'
    },
    faultDescription: {
      type: DataTypes.TEXT,
      comment: '故障描述'
    },
    inspectionReport: {
      type: DataTypes.TEXT,
      comment: '检测报告'
    },
    estimatedCost: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '预估费用'
    },
    quotationTime: {
      type: DataTypes.DATE,
      comment: '报价时间'
    },
    quotationExpireTime: {
      type: DataTypes.DATE,
      comment: '报价过期时间'
    },
    repairerId: {
      type: DataTypes.INTEGER,
      comment: '维修师ID'
    },
    repairStartTime: {
      type: DataTypes.DATE,
      comment: '维修开始时间'
    },
    repairEndTime: {
      type: DataTypes.DATE,
      comment: '维修结束时间'
    },
    repairDescription: {
      type: DataTypes.TEXT,
      comment: '维修描述'
    },
    actualCost: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '实际费用'
    },
    laborFee: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '工时费'
    },
    partsFee: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '配件费'
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      comment: '佣金率(%)'
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '佣金金额'
    },
    salePrice: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '售出价格'
    },
    platformShare: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '平台分成'
    },
    storeShare: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '门店分成'
    },
    repairerShare: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '维修师分成'
    },
    ownerAmount: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '物主所得'
    },
    settlementStatus: {
      type: DataTypes.ENUM('pending', 'settled'),
      defaultValue: 'pending',
      comment: '结算状态'
    },
    settledAt: {
      type: DataTypes.DATE,
      comment: '结算时间'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      allowNull: false,
      defaultValue: WorkOrderStatus.PENDING_INSPECTION,
      comment: '工单状态'
    },
    priority: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '优先级'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      comment: '创建人ID'
    }
  },
  {
    sequelize,
    modelName: 'WorkOrder',
    tableName: 'work_orders'
  }
);

WorkOrder.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });
Collection.hasMany(WorkOrder, { foreignKey: 'collectionId' });

WorkOrder.belongsTo(User, { foreignKey: 'repairerId', as: 'repairer' });
User.hasMany(WorkOrder, { foreignKey: 'repairerId', as: 'assignedWorkOrders' });

WorkOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(WorkOrder, { foreignKey: 'createdBy', as: 'createdWorkOrders' });

export default WorkOrder;
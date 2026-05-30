import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { WORK_ORDER_STATUS, WorkOrderStatusType } from '../config';
import User from './User';

interface WorkOrderAttributes {
  id: number;
  orderNo: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  productName: string;
  patternDesign?: string;
  patternImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  depositAmount: number;
  isDepositPaid: boolean;
  payMethod?: string;
  payRemark?: string;
  deadline?: Date;
  status: WorkOrderStatusType;
  artisanId?: number;
  remark?: string;
  cancelledReason?: string;
  cancelledAt?: Date;
  completedAt?: Date;
  deliveredAt?: Date;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkOrderCreationAttributes extends Optional<WorkOrderAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isDepositPaid' | 'quantity' | 'unitPrice' | 'totalPrice' | 'depositAmount'> {}

class WorkOrder extends Model<WorkOrderAttributes, WorkOrderCreationAttributes> implements WorkOrderAttributes {
  public id!: number;
  public orderNo!: string;
  public customerName!: string;
  public customerPhone?: string;
  public customerAddress?: string;
  public productName!: string;
  public patternDesign?: string;
  public patternImage?: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public depositAmount!: number;
  public isDepositPaid!: boolean;
  public payMethod?: string;
  public payRemark?: string;
  public deadline?: Date;
  public status!: WorkOrderStatusType;
  public artisanId?: number;
  public remark?: string;
  public cancelledReason?: string;
  public cancelledAt?: Date;
  public completedAt?: Date;
  public deliveredAt?: Date;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly artisan?: User;
  public readonly creator?: User;
}

WorkOrder.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '工单编号',
    },
    customerName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '客户姓名',
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      comment: '客户电话',
    },
    customerAddress: {
      type: DataTypes.STRING(500),
      comment: '客户地址',
    },
    productName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '产品名称',
    },
    patternDesign: {
      type: DataTypes.TEXT,
      comment: '纹样设计说明',
    },
    patternImage: {
      type: DataTypes.STRING(500),
      comment: '纹样图片',
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '数量',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '单价',
    },
    totalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总价',
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '定金金额',
    },
    isDepositPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '定金是否支付',
    },
    payMethod: {
      type: DataTypes.STRING(20),
      comment: '支付方式',
    },
    payRemark: {
      type: DataTypes.STRING(500),
      comment: '支付备注',
    },
    deadline: {
      type: DataTypes.DATE,
      comment: '工期约定',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WORK_ORDER_STATUS)),
      allowNull: false,
      defaultValue: WORK_ORDER_STATUS.PENDING_DEPOSIT,
      comment: '工单状态',
    },
    artisanId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '负责匠人ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注',
    },
    cancelledReason: {
      type: DataTypes.TEXT,
      comment: '取消原因',
    },
    cancelledAt: {
      type: DataTypes.DATE,
      comment: '取消时间',
    },
    completedAt: {
      type: DataTypes.DATE,
      comment: '完成时间',
    },
    deliveredAt: {
      type: DataTypes.DATE,
      comment: '交付时间',
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '创建人ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'work_orders',
    modelName: 'WorkOrder',
    timestamps: true,
    indexes: [
      { fields: ['orderNo'], unique: true },
      { fields: ['status'] },
      { fields: ['artisanId'] },
      { fields: ['customerPhone'] },
      { fields: ['createdAt'] },
      { fields: ['createdBy'] },
    ],
  }
);

WorkOrder.belongsTo(User, {
  as: 'artisan',
  foreignKey: 'artisanId',
});

WorkOrder.belongsTo(User, {
  as: 'creator',
  foreignKey: 'createdBy',
});

export default WorkOrder;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { WorkOrderStatus } from '../types';

class WorkOrder extends Model {
  public id!: number;
  public orderNo!: string;
  public bookName!: string;
  public bookCode?: string;
  public edition?: string;
  public quantity!: number;
  public status!: WorkOrderStatus;
  public priority!: number;
  public deadline?: Date;
  public typesetterId?: number;
  public engraverId?: number;
  public printerId?: number;
  public binderId?: number;
  public currentHandlerId?: number;
  public remark?: string;
  public creatorId!: number;
  public completedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    bookName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '书目名称'
    },
    bookCode: {
      type: DataTypes.STRING(50),
      comment: '书目编码'
    },
    edition: {
      type: DataTypes.STRING(100),
      comment: '版本信息'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '制作数量'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      defaultValue: WorkOrderStatus.PENDING,
      comment: '工单状态'
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '优先级'
    },
    deadline: {
      type: DataTypes.DATE,
      comment: '截止日期'
    },
    typesetterId: {
      type: DataTypes.INTEGER,
      comment: '排版师ID'
    },
    engraverId: {
      type: DataTypes.INTEGER,
      comment: '雕版师ID'
    },
    printerId: {
      type: DataTypes.INTEGER,
      comment: '印刷师ID'
    },
    binderId: {
      type: DataTypes.INTEGER,
      comment: '装订师ID'
    },
    currentHandlerId: {
      type: DataTypes.INTEGER,
      comment: '当前处理人ID'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '创建人ID'
    },
    completedAt: {
      type: DataTypes.DATE,
      comment: '完成时间'
    }
  },
  {
    sequelize,
    modelName: 'WorkOrder',
    tableName: 'work_orders',
    comment: '古籍复刻工单表'
  }
);

export default WorkOrder;

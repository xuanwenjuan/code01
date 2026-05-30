import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Department from './Department';

export enum RequisitionStatus {
  PENDING = 1,
  APPROVING = 2,
  APPROVED = 3,
  REJECTED = 4,
  DELIVERED = 5,
  CANCELLED = 6
}

class Requisition extends Model {
  public id!: number;
  public requisitionNo!: string;
  public applicantId!: number;
  public departmentId!: number;
  public approverId?: number;
  public delivererId?: number;
  public status!: RequisitionStatus;
  public reason?: string;
  public rejectReason?: string;
  public approvalTime?: Date;
  public deliveryTime?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Requisition.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    requisitionNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '申领单号'
    },
    applicantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '申请人ID'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '部门ID'
    },
    approverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '审批人ID'
    },
    delivererId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '发放人ID'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: RequisitionStatus.PENDING,
      comment: '状态：1-待提交，2-审批中，3-已审批，4-已驳回，5-已发放，6-已取消'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '申领原因'
    },
    rejectReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '驳回原因'
    },
    approvalTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '审批时间'
    },
    deliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '发放时间'
    }
  },
  {
    sequelize,
    modelName: 'Requisition',
    tableName: 'requisitions',
    comment: '物资申领单表'
  }
);

Requisition.belongsTo(User, { foreignKey: 'applicantId', as: 'applicant' });
Requisition.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });
Requisition.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

export default Requisition;
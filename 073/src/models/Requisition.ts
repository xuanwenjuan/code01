import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import { RequisitionStatus } from '../types';

interface RequisitionAttributes {
  id: number;
  requisitionNo: string;
  applicantId: number;
  approverId: number;
  department: string;
  purpose: string;
  totalAmount: number;
  status: RequisitionStatus;
  approvalRemark: string;
  approvedAt: Date;
  deliveredBy: number;
  deliveredAt: Date;
  returnedAt: Date;
  scrappedAt: Date;
  remarks: string;
}

interface RequisitionCreationAttributes extends Optional<RequisitionAttributes, 'id' | 'totalAmount' | 'status' | 'remarks'> {}

class Requisition extends Model<RequisitionAttributes, RequisitionCreationAttributes> implements RequisitionAttributes {
  public id!: number;
  public requisitionNo!: string;
  public applicantId!: number;
  public approverId!: number;
  public department!: string;
  public purpose!: string;
  public totalAmount!: number;
  public status!: RequisitionStatus;
  public approvalRemark!: string;
  public approvedAt!: Date;
  public deliveredBy!: number;
  public deliveredAt!: Date;
  public returnedAt!: Date;
  public scrappedAt!: Date;
  public remarks!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly applicant?: User;
  public readonly approver?: User;
}

Requisition.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    requisitionNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '领用单号'
    },
    applicantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'applicant_id',
      comment: '申请人ID'
    },
    approverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'approver_id',
      comment: '审批人ID'
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '领用用途'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RequisitionStatus)),
      allowNull: false,
      defaultValue: RequisitionStatus.DRAFT
    },
    approvalRemark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '审批备注'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at',
      comment: '审批时间'
    },
    deliveredBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'delivered_by',
      comment: '出库操作员ID'
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'delivered_at',
      comment: '出库时间'
    },
    returnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'returned_at',
      comment: '归还时间'
    },
    scrappedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'scrapped_at',
      comment: '报废时间'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'requisitions',
    modelName: 'Requisition'
  }
);

Requisition.belongsTo(User, { as: 'applicant', foreignKey: 'applicantId' });
Requisition.belongsTo(User, { as: 'approver', foreignKey: 'approverId' });

export default Requisition;

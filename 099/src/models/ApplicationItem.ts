import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface ApplicationItemAttributes {
  id?: number;
  applicationId: number;
  categoryId: number;
  requestedQuantity: number;
  approvedQuantity?: number;
  actualQuantity?: number;
  returnedQuantity?: number;
  damagedQuantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class ApplicationItem extends Model<ApplicationItemAttributes> implements ApplicationItemAttributes {
  public id!: number;
  public applicationId!: number;
  public categoryId!: number;
  public requestedQuantity!: number;
  public approvedQuantity?: number;
  public actualQuantity?: number;
  public returnedQuantity?: number;
  public damagedQuantity?: number;
  public unitPrice?: number;
  public totalPrice?: number;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ApplicationItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '申领单ID'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '饲草料类目ID'
    },
    requestedQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '申领数量'
    },
    approvedQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '批准数量'
    },
    actualQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '实际发放数量'
    },
    returnedQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '退回数量'
    },
    damagedQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '报损数量'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '单价'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '总价'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'ApplicationItem',
    tableName: 'application_items',
    indexes: [
      { fields: ['applicationId'] },
      { fields: ['categoryId'] }
    ]
  }
);

export default ApplicationItem;

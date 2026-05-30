import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { MaterialStatus } from '../constants/material.constants';
import MaterialCategory from './material-category.model';
import User from './user.model';

export interface IMaterialAttributes {
  id?: number;
  batchNo: string;
  categoryId: number;
  name: string;
  origin: string;
  harvestYear: number;
  processTech: string;
  moistureContent: number;
  quantity: number;
  unit: string;
  status: MaterialStatus;
  agingDays: number;
  agingStartDate?: Date;
  agingEndDate?: Date;
  isAgingReminded: boolean;
  reminderSentAt?: Date;
  isArchived?: boolean;
  archivedAt?: Date;
  warehouseLocation?: string;
  remarks?: string;
  isLocked?: boolean;
  lockReason?: string;
  lockedAt?: Date;
  lockedBy?: number;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Material extends Model<IMaterialAttributes> implements IMaterialAttributes {
  public id!: number;
  public batchNo!: string;
  public categoryId!: number;
  public name!: string;
  public origin!: string;
  public harvestYear!: number;
  public processTech!: string;
  public moistureContent!: number;
  public quantity!: number;
  public unit!: string;
  public status!: MaterialStatus;
  public agingDays!: number;
  public agingStartDate?: Date;
  public agingEndDate?: Date;
  public isAgingReminded!: boolean;
  public reminderSentAt?: Date;
  public isArchived!: boolean;
  public archivedAt?: Date;
  public warehouseLocation?: string;
  public remarks?: string;
  public isLocked!: boolean;
  public lockReason?: string;
  public lockedAt?: Date;
  public lockedBy?: number;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Material.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    batchNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '批次编号',
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '类目ID',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '香材名称',
    },
    origin: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '产地',
    },
    harvestYear: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '采收年份',
    },
    processTech: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '炮制工艺',
    },
    moistureContent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: '含水率(%)',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '数量',
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'kg',
      comment: '单位',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MaterialStatus)),
      allowNull: false,
      defaultValue: MaterialStatus.PENDING_PROCESS,
      comment: '状态',
    },
    agingDays: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '陈化天数',
    },
    agingStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '陈化开始日期',
    },
    agingEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '陈化结束日期',
    },
    isAgingReminded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否已提醒陈化到期',
    },
    reminderSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '提醒发送时间',
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否已归档',
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '归档时间',
    },
    warehouseLocation: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '仓库位置',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '创建人ID',
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否锁定出库',
    },
    lockReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '锁定原因',
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '锁定时间',
    },
    lockedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '锁定人ID',
    },
  },
  {
    sequelize,
    tableName: 'materials',
    timestamps: true,
    indexes: [
      { fields: ['batchNo'], unique: true },
      { fields: ['categoryId'] },
      { fields: ['status'] },
      { fields: ['origin'] },
      { fields: ['isLocked'] },
      { fields: ['createdBy'] },
    ],
  }
);

Material.belongsTo(MaterialCategory, {
  as: 'category',
  foreignKey: 'categoryId',
});

Material.belongsTo(User, {
  as: 'creator',
  foreignKey: 'createdBy',
});

export default Material;

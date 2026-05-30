import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Department from './Department';
import BenefitBatch from './BenefitBatch';

import User from './User';

class BenefitSettlement extends Model {
  public id!: number;
  public settlementNo!: string;
  public departmentId!: number;
  public batchId!: number;
  public totalEmployees!: number;
  public claimedCount!: number;
  public unclaimedCount!: number;
  public totalAmount!: number;
  public actualAmount!: number;
  public status!: number;
  public createdBy!: number;
  public settledBy!: number | null;
  public settledAt!: Date | null;
  public remark!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BenefitSettlement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    settlementNo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      comment: '结算单号'
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '部门ID'
    },
    batchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '发放批次ID'
    },
    totalEmployees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '员工总数'
    },
    claimedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '已申领人数'
    },
    unclaimedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '未申领人数'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '应发总金额'
    },
    actualAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '实发总金额'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态：0待结算，1已结算'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '创建人ID'
    },
    settledBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '结算人ID'
    },
    settledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '结算时间'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'BenefitSettlement',
    tableName: 'benefit_settlements',
    comment: '福利发放结算表'
  }
);

BenefitSettlement.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
BenefitSettlement.belongsTo(BenefitBatch, { foreignKey: 'batchId', as: 'batch' });
BenefitSettlement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
BenefitSettlement.belongsTo(User, { foreignKey: 'settledBy', as: 'settler' });

export default BenefitSettlement;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class InspectionPlan extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public equipmentId!: number;
  public inspectorId!: number | null;
  public frequencyType!: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  public frequencyValue!: number | null;
  public startDate!: Date;
  public endDate!: Date | null;
  public inspectionItems!: string;
  public description!: string;
  public isActive!: boolean;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InspectionPlan.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '计划名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '计划编码',
    },
    equipmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '设备ID',
    },
    inspectorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '巡检员ID',
    },
    frequencyType: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'),
      allowNull: false,
      comment: '频率类型',
    },
    frequencyValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '频率值(自定义时使用)',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '开始日期',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '结束日期',
    },
    inspectionItems: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '巡检项(JSON格式)',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '计划描述',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否激活',
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '创建人ID',
    },
  },
  {
    sequelize,
    tableName: 'inspection_plans',
    modelName: 'InspectionPlan',
    timestamps: true,
    indexes: [
      { fields: ['equipmentId'] },
      { fields: ['inspectorId'] },
      { fields: ['isActive'] },
    ],
  }
);

export default InspectionPlan;

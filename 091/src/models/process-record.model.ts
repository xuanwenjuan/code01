import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { ProcessStatus } from '../constants/material.constants';
import Material from './material.model';
import User from './user.model';

export interface IProcessRecordAttributes {
  id?: number;
  materialId: number;
  batchNo: string;
  status: ProcessStatus;
  operatorId: number;
  inputQuantity: number;
  outputQuantity?: number;
  lossQuantity?: number;
  processDetails?: string;
  qualityCheckResult?: string;
  isQualified?: boolean;
  startAt?: Date;
  endAt?: Date;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class ProcessRecord extends Model<IProcessRecordAttributes> implements IProcessRecordAttributes {
  public id!: number;
  public materialId!: number;
  public batchNo!: string;
  public status!: ProcessStatus;
  public operatorId!: number;
  public inputQuantity!: number;
  public outputQuantity?: number;
  public lossQuantity?: number;
  public processDetails?: string;
  public qualityCheckResult?: string;
  public isQualified?: boolean;
  public startAt?: Date;
  public endAt?: Date;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProcessRecord.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    materialId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '原料ID',
    },
    batchNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '批次编号',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ProcessStatus)),
      allowNull: false,
      defaultValue: ProcessStatus.PENDING_SELECTION,
      comment: '加工状态',
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '操作人ID',
    },
    inputQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '投入数量',
    },
    outputQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '产出数量',
    },
    lossQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '损耗数量',
    },
    processDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '加工详情',
    },
    qualityCheckResult: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '质检结果',
    },
    isQualified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: '是否合格',
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '开始时间',
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '结束时间',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
  },
  {
    sequelize,
    tableName: 'process_records',
    timestamps: true,
    indexes: [
      { fields: ['materialId'] },
      { fields: ['batchNo'] },
      { fields: ['status'] },
      { fields: ['operatorId'] },
    ],
  }
);

ProcessRecord.belongsTo(Material, {
  as: 'material',
  foreignKey: 'materialId',
});

ProcessRecord.belongsTo(User, {
  as: 'operator',
  foreignKey: 'operatorId',
});

export default ProcessRecord;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { WineStatus } from '../constants';

export interface WineAttributes {
  id?: number;
  batchNo: string;
  name: string;
  origin: string;
  vintageYear: number;
  alcoholContent: number;
  flavorProfile: string;
  description?: string;
  status: WineStatus;
  totalQuantity: number;
  currentQuantity: number;
  bottleCount?: number;
  bestDrinkStartDate?: Date;
  bestDrinkEndDate?: Date;
  cellarLocation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Wine extends Model<WineAttributes> implements WineAttributes {
  public id!: number;
  public batchNo!: string;
  public name!: string;
  public origin!: string;
  public vintageYear!: number;
  public alcoholContent!: number;
  public flavorProfile!: string;
  public description?: string;
  public status!: WineStatus;
  public totalQuantity!: number;
  public currentQuantity!: number;
  public bottleCount?: number;
  public bestDrinkStartDate?: Date;
  public bestDrinkEndDate?: Date;
  public cellarLocation?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Wine.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    batchNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '批次号',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '酒品名称',
    },
    origin: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '产区',
    },
    vintageYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '酿造年份',
    },
    alcoholContent: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      comment: '酒精度',
    },
    flavorProfile: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '口感香型',
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WineStatus)),
      allowNull: false,
      defaultValue: WineStatus.BREWING,
      comment: '状态',
    },
    totalQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总数量(升)',
    },
    currentQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '当前数量(升)',
    },
    bottleCount: {
      type: DataTypes.INTEGER,
      comment: '装瓶数量',
    },
    bestDrinkStartDate: {
      type: DataTypes.DATE,
      comment: '最佳饮用开始日期',
    },
    bestDrinkEndDate: {
      type: DataTypes.DATE,
      comment: '最佳饮用结束日期',
    },
    cellarLocation: {
      type: DataTypes.STRING(100),
      comment: '窖藏位置',
    },
  },
  {
    sequelize,
    modelName: 'Wine',
    tableName: 'wines',
    indexes: [
      { fields: ['batchNo'], unique: true },
      { fields: ['status'] },
      { fields: ['vintageYear'] },
    ],
  }
);

export default Wine;

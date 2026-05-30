import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';

export enum CollectionStatus {
  PENDING_REPAIR = 'pending_repair',
  IN_REPAIR = 'in_repair',
  PENDING_CONSIGN = 'pending_consign',
  ON_SALE = 'on_sale',
  SOLD = 'sold',
  ARCHIVED = 'archived'
}

export enum ConditionGrade {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export interface CollectionAttributes {
  id?: number;
  collectionNo: string;
  name: string;
  brand: string;
  productionYear?: string;
  categoryId: number;
  movementType: string;
  conditionGrade: ConditionGrade;
  sourceChannel: string;
  status: CollectionStatus;
  description?: string;
  images?: string;
  purchasePrice?: number;
  estimatedPrice?: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  maintenanceCycleMonths?: number;
  ownerName?: string;
  ownerPhone?: string;
  remarks?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Collection extends Model<CollectionAttributes> implements CollectionAttributes {
  public id!: number;
  public collectionNo!: string;
  public name!: string;
  public brand!: string;
  public productionYear?: string;
  public categoryId!: number;
  public movementType!: string;
  public conditionGrade!: ConditionGrade;
  public sourceChannel!: string;
  public status!: CollectionStatus;
  public description?: string;
  public images?: string;
  public purchasePrice?: number;
  public estimatedPrice?: number;
  public lastMaintenanceDate?: Date;
  public nextMaintenanceDate?: Date;
  public maintenanceCycleMonths?: number;
  public ownerName?: string;
  public ownerPhone?: string;
  public remarks?: string;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly category?: Category;
}

Collection.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    collectionNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '藏品编号'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '藏品名称'
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '品牌'
    },
    productionYear: {
      type: DataTypes.STRING(20),
      comment: '生产年代'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '类目ID'
    },
    movementType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '机芯类型'
    },
    conditionGrade: {
      type: DataTypes.ENUM(...Object.values(ConditionGrade)),
      allowNull: false,
      comment: '品相等级'
    },
    sourceChannel: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '来路渠道'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CollectionStatus)),
      allowNull: false,
      defaultValue: CollectionStatus.PENDING_REPAIR,
      comment: '状态'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    },
    images: {
      type: DataTypes.TEXT,
      comment: '图片JSON'
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '收购价格'
    },
    estimatedPrice: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '估价'
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      comment: '上次保养日期'
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      comment: '下次保养日期'
    },
    maintenanceCycleMonths: {
      type: DataTypes.INTEGER,
      defaultValue: 12,
      comment: '保养周期(月)'
    },
    ownerName: {
      type: DataTypes.STRING(50),
      comment: '持有人姓名'
    },
    ownerPhone: {
      type: DataTypes.STRING(20),
      comment: '持有人电话'
    },
    remarks: {
      type: DataTypes.TEXT,
      comment: '备注'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      comment: '创建人ID'
    }
  },
  {
    sequelize,
    modelName: 'Collection',
    tableName: 'collections'
  }
);

Collection.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Collection, { foreignKey: 'categoryId' });

export default Collection;
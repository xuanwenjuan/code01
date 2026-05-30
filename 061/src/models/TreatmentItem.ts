import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import TreatmentCategory from './TreatmentCategory';
import BillingItem from './BillingItem';

export interface TreatmentItemAttributes {
  id?: number;
  name: string;
  code: string;
  categoryId: number;
  price: number;
  costPrice?: number;
  unit: string;
  duration?: number;
  description?: string;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

class TreatmentItem extends Model<TreatmentItemAttributes> implements TreatmentItemAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public categoryId!: number;
  public price!: number;
  public costPrice?: number;
  public unit!: string;
  public duration?: number;
  public description?: string;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TreatmentItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '项目名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '项目编码',
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '分类ID',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '价格',
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '成本价',
    },
    unit: {
      type: DataTypes.STRING(20),
      defaultValue: '次',
      comment: '单位',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '预计时长(分钟)',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '项目描述',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: '状态',
    },
  },
  {
    sequelize,
    modelName: 'TreatmentItem',
    tableName: 'treatment_items',
  }
);

TreatmentItem.belongsTo(TreatmentCategory, {
  foreignKey: 'categoryId',
  as: 'category',
});

TreatmentCategory.hasMany(TreatmentItem, {
  foreignKey: 'categoryId',
  as: 'items',
});

TreatmentItem.hasMany(BillingItem, {
  foreignKey: 'itemId',
  as: 'billingItems',
});

export default TreatmentItem;

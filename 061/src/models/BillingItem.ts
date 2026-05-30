import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Billing from './Billing';
import TreatmentItem from './TreatmentItem';

export interface BillingItemAttributes {
  id?: number;
  billingId: number;
  itemId?: number;
  itemName: string;
  itemType: 'treatment' | 'medicine' | 'material' | 'other';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class BillingItem extends Model<BillingItemAttributes> implements BillingItemAttributes {
  public id!: number;
  public billingId!: number;
  public itemId?: number;
  public itemName!: string;
  public itemType!: 'treatment' | 'medicine' | 'material' | 'other';
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BillingItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    billingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '账单ID',
    },
    itemId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '项目ID',
    },
    itemName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '项目名称',
    },
    itemType: {
      type: DataTypes.ENUM('treatment', 'medicine', 'material', 'other'),
      allowNull: false,
      comment: '项目类型',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '数量',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价',
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '总价',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
  },
  {
    sequelize,
    modelName: 'BillingItem',
    tableName: 'billing_items',
  }
);

BillingItem.belongsTo(Billing, {
  foreignKey: 'billingId',
  as: 'billing',
});

BillingItem.belongsTo(TreatmentItem, {
  foreignKey: 'itemId',
  as: 'treatmentItem',
});

Billing.hasMany(BillingItem, {
  foreignKey: 'billingId',
  as: 'items',
});

export default BillingItem;

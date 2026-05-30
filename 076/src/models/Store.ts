import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface StoreAttributes {
  id: number;
  name: string;
  address: string;
  phone: string;
  businessHours?: string;
  managerId?: number;
  status: 'active' | 'closed';
  createdAt?: Date;
  updatedAt?: Date;
}

interface StoreCreationAttributes extends Optional<StoreAttributes, 'id'> {}

class Store extends Model<StoreAttributes, StoreCreationAttributes> implements StoreAttributes {
  public id!: number;
  public name!: string;
  public address!: string;
  public phone!: string;
  public businessHours?: string;
  public managerId?: number;
  public status!: 'active' | 'closed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Store.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '门店名称'
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '门店地址'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '联系电话'
    },
    businessHours: {
      type: DataTypes.STRING(100),
      comment: '营业时间'
    },
    managerId: {
      type: DataTypes.INTEGER,
      comment: '店长ID'
    },
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      allowNull: false,
      defaultValue: 'active',
      comment: '门店状态'
    }
  },
  {
    sequelize,
    tableName: 'stores',
    modelName: 'Store',
    timestamps: true
  }
);

export default Store;

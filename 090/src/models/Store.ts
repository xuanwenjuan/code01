import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface StoreAttributes {
  id: number;
  name: string;
  address: string;
  phone: string;
  managerId?: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StoreCreationAttributes extends Optional<StoreAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Store extends Model<StoreAttributes, StoreCreationAttributes> implements StoreAttributes {
  public id!: number;
  public name!: string;
  public address!: string;
  public phone!: string;
  public managerId?: number;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Store.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
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
    managerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '门店管理员ID'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态：1-启用，0-禁用'
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

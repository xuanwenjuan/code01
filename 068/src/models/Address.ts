import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import User from './User';

export interface AddressAttributes {
  id: number;
  userId: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: number;
}

export interface AddressCreationAttributes extends Optional<AddressAttributes, 'id'> {}

class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
  public id!: number;
  public userId!: number;
  public name!: string;
  public phone!: string;
  public province!: string;
  public city!: string;
  public district!: string;
  public detail!: string;
  public isDefault!: number;

  public readonly user?: User;
}

Address.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'user_id',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '收货人姓名',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '收货人电话',
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '省份',
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '城市',
    },
    district: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '区县',
    },
    detail: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '详细地址',
    },
    isDefault: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: 'is_default',
      comment: '1: 默认地址, 0: 普通地址',
    },
  },
  {
    sequelize,
    tableName: 'addresses',
  }
);

Address.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Address, { as: 'addresses', foreignKey: 'userId' });

export default Address;

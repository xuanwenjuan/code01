import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export interface IMerchantAttributes {
  id?: number;
  userId: number;
  companyName?: string;
  businessLicense?: string;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  industry?: string;
  description?: string;
  verified: boolean;
  verifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class Merchant extends Model<IMerchantAttributes> implements IMerchantAttributes {
  public id!: number;
  public userId!: number;
  public companyName?: string;
  public businessLicense?: string;
  public contactPerson?: string;
  public contactPhone?: string;
  public address?: string;
  public website?: string;
  public industry?: string;
  public description?: string;
  public verified!: boolean;
  public verifiedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Merchant.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      comment: '用户ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    companyName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '公司名称',
    },
    businessLicense: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '营业执照号',
    },
    contactPerson: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '联系人',
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '联系电话',
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '地址',
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '网站',
    },
    industry: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '所属行业',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '商家描述',
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否已认证',
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '认证时间',
    },
  },
  {
    sequelize,
    tableName: 'merchants',
    modelName: 'Merchant',
  }
);

Merchant.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasOne(Merchant, { as: 'merchant', foreignKey: 'userId' });

export default Merchant;

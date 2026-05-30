import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { InfluencerStatus } from '../utils/constants';
import User from './User';

export interface IInfluencerAttributes {
  id?: number;
  userId: number;
  realName?: string;
  idCard?: string;
  platformAccounts?: any;
  followerCount?: number;
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: number[];
  tags?: string[];
  status: InfluencerStatus;
  bio?: string;
  portfolio?: any;
  rejectionReason?: string;
  verifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class Influencer extends Model<IInfluencerAttributes> implements IInfluencerAttributes {
  public id!: number;
  public userId!: number;
  public realName?: string;
  public idCard?: string;
  public platformAccounts?: any;
  public followerCount?: number;
  public minPrice?: number;
  public maxPrice?: number;
  public categoryIds?: number[];
  public tags?: string[];
  public status!: InfluencerStatus;
  public bio?: string;
  public portfolio?: any;
  public rejectionReason?: string;
  public verifiedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Influencer.init(
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
    realName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '真实姓名',
    },
    idCard: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '身份证号',
    },
    platformAccounts: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '平台账号信息',
    },
    followerCount: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: '粉丝数量',
    },
    minPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '最低报价',
    },
    maxPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '最高报价',
    },
    categoryIds: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '擅长品类分类ID数组',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '标签数组',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(InfluencerStatus)),
      allowNull: false,
      defaultValue: InfluencerStatus.PENDING,
      comment: '审核状态',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '个人简介',
    },
    portfolio: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '过往案例',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '拒绝原因',
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '审核通过时间',
    },
  },
  {
    sequelize,
    tableName: 'influencers',
    modelName: 'Influencer',
  }
);

Influencer.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasOne(Influencer, { as: 'influencer', foreignKey: 'userId' });

export default Influencer;

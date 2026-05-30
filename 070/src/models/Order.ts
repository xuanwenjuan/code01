import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus } from '../utils/constants';
import User from './User';
import Category from './Category';

export interface IOrderAttributes {
  id?: number;
  orderNo: string;
  merchantId: number;
  influencerId?: number;
  categoryId: number;
  title: string;
  description?: string;
  budget: number;
  deadline?: Date;
  requirements?: any;
  status: OrderStatus;
  scriptUrl?: string;
  videoUrl?: string;
  publishUrl?: string;
  negotiationNotes?: string;
  completionNotes?: string;
  expireAt?: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class Order extends Model<IOrderAttributes> implements IOrderAttributes {
  public id!: number;
  public orderNo!: string;
  public merchantId!: number;
  public influencerId?: number;
  public categoryId!: number;
  public title!: string;
  public description?: string;
  public budget!: number;
  public deadline?: Date;
  public requirements?: any;
  public status!: OrderStatus;
  public scriptUrl?: string;
  public videoUrl?: string;
  public publishUrl?: string;
  public negotiationNotes?: string;
  public completionNotes?: string;
  public expireAt?: Date;
  public confirmedAt?: Date;
  public completedAt?: Date;
  public cancelledAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '订单编号',
    },
    merchantId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '商家ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    influencerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '达人ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '内容分类ID',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '订单标题',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '订单描述',
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '预算金额',
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '交付截止日期',
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '详细要求',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.DRAFT,
      comment: '订单状态',
    },
    scriptUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '脚本URL',
    },
    videoUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '视频URL',
    },
    publishUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '发布链接',
    },
    negotiationNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '洽谈备注',
    },
    completionNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '完成备注',
    },
    expireAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '过期时间',
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '脚本确认时间',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '完成时间',
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '取消时间',
    },
  },
  {
    sequelize,
    tableName: 'orders',
    modelName: 'Order',
    indexes: [
      { fields: ['merchantId'] },
      { fields: ['influencerId'] },
      { fields: ['categoryId'] },
      { fields: ['status'] },
    ],
  }
);

Order.belongsTo(User, { as: 'merchant', foreignKey: 'merchantId' });
Order.belongsTo(User, { as: 'influencer', foreignKey: 'influencerId' });
Order.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

export default Order;

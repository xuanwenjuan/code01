import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum GroupBuyStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  LOCKED = 'locked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface GroupBuyAttributes {
  id?: number;
  title: string;
  productId: number;
  leaderId: number;
  minQuantity: number;
  currentQuantity: number;
  startTime: Date;
  endTime: Date;
  pickupAddress: string;
  pickupTime?: Date;
  status: GroupBuyStatus;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class GroupBuy extends Model<GroupBuyAttributes> implements GroupBuyAttributes {
  public id!: number;
  public title!: string;
  public productId!: number;
  public leaderId!: number;
  public minQuantity!: number;
  public currentQuantity!: number;
  public startTime!: Date;
  public endTime!: Date;
  public pickupAddress!: string;
  public pickupTime?: Date;
  public status!: GroupBuyStatus;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GroupBuy.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '拼团标题'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    leaderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '团长ID'
    },
    minQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: '最低成团数量'
    },
    currentQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '当前参团数量'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '开始时间'
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '结束时间'
    },
    pickupAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '自提地址'
    },
    pickupTime: {
      type: DataTypes.DATE,
      comment: '自提时间'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(GroupBuyStatus)),
      allowNull: false,
      defaultValue: GroupBuyStatus.PENDING,
      comment: '状态 pending:待开始 active:进行中 locked:已锁单 completed:已完成 cancelled:已取消'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'GroupBuy',
    tableName: 'group_buys',
    timestamps: true
  }
);

export default GroupBuy;

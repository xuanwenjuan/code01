import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum LeaderStatus {
  PENDING = 'pending',
  NORMAL = 'normal',
  SUSPENDED = 'suspended',
  BANNED = 'banned'
}

export interface LeaderAttributes {
  id?: number;
  userId: number;
  communityName: string;
  address: string;
  province: string;
  city: string;
  district: string;
  buildingCoverage: string;
  phone: string;
  wechat?: string;
  idCard?: string;
  idCardFront?: string;
  idCardBack?: string;
  commissionRate: number;
  status: LeaderStatus;
  auditTime?: Date;
  auditRemark?: string;
  totalOrders?: number;
  totalAmount?: number;
  totalCommission?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Leader extends Model<LeaderAttributes> implements LeaderAttributes {
  public id!: number;
  public userId!: number;
  public communityName!: string;
  public address!: string;
  public province!: string;
  public city!: string;
  public district!: string;
  public buildingCoverage!: string;
  public phone!: string;
  public wechat?: string;
  public idCard?: string;
  public idCardFront?: string;
  public idCardBack?: string;
  public commissionRate!: number;
  public status!: LeaderStatus;
  public auditTime?: Date;
  public auditRemark?: string;
  public totalOrders?: number;
  public totalAmount?: number;
  public totalCommission?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Leader.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: '用户ID'
    },
    communityName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '小区名称'
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '详细地址'
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '省份'
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '城市'
    },
    district: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '区县'
    },
    buildingCoverage: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '覆盖楼栋'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '联系电话'
    },
    wechat: {
      type: DataTypes.STRING(50),
      comment: '微信号'
    },
    idCard: {
      type: DataTypes.STRING(18),
      comment: '身份证号'
    },
    idCardFront: {
      type: DataTypes.STRING(255),
      comment: '身份证正面'
    },
    idCardBack: {
      type: DataTypes.STRING(255),
      comment: '身份证反面'
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 10.00,
      comment: '佣金比例%'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(LeaderStatus)),
      allowNull: false,
      defaultValue: LeaderStatus.PENDING,
      comment: '状态 pending:待审核 normal:正常 suspended:暂停 banned:封禁'
    },
    auditTime: {
      type: DataTypes.DATE,
      comment: '审核时间'
    },
    auditRemark: {
      type: DataTypes.STRING(255),
      comment: '审核备注'
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '总订单数'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '总成交额'
    },
    totalCommission: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '总佣金'
    }
  },
  {
    sequelize,
    modelName: 'Leader',
    tableName: 'leaders',
    timestamps: true
  }
);

export default Leader;

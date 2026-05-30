import { Column, Table, DataType, HasMany } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { Order } from './order.model';

export enum DistributorType {
  TRAVEL_AGENCY = 'travel_agency',
  ONLINE_AGENT = 'online_agent',
  INDIVIDUAL = 'individual',
}

export enum DistributorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
}

export enum DistributorLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

@Table({
  tableName: 'distributors',
  timestamps: true,
  paranoid: true,
})
export class Distributor extends BaseModel {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '分销商名称',
  })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(DistributorType)),
    allowNull: false,
    comment: '分销商类型',
  })
  type: DistributorType;

  @Column({
    type: DataType.ENUM(...Object.values(DistributorLevel)),
    allowNull: false,
    defaultValue: DistributorLevel.BRONZE,
    comment: '分销商等级',
  })
  level: DistributorLevel;

  @Column({
    type: DataType.STRING(50),
    comment: '联系人',
  })
  contactPerson: string;

  @Column({
    type: DataType.STRING(20),
    comment: '联系电话',
  })
  contactPhone: string;

  @Column({
    type: DataType.STRING(200),
    comment: '地址',
  })
  address: string;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '基础佣金比例(%)',
  })
  baseCommissionRate: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '当前实际佣金比例(%)',
  })
  commissionRate: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '累计销售额',
  })
  totalSales: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '本月销售额',
  })
  monthlySales: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '累计订单数',
  })
  totalOrders: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '授信额度',
  })
  creditLimit: number;

  @Column({
    type: DataType.ENUM(...Object.values(DistributorStatus)),
    allowNull: false,
    defaultValue: DistributorStatus.ACTIVE,
    comment: '合作状态',
  })
  status: DistributorStatus;

  @Column({
    type: DataType.DATE,
    comment: '合作生效日期',
  })
  effectiveDate: Date;

  @Column({
    type: DataType.DATE,
    comment: '合作终止日期',
  })
  terminationDate: Date;

  @Column({
    type: DataType.STRING(500),
    comment: '备注',
  })
  remark: string;

  @HasMany(() => Order)
  orders: Order[];
}

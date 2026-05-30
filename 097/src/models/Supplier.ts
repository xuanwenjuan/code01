import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, HasMany } from 'sequelize-typescript';
import PriceAdjustment from './PriceAdjustment';

export enum SettlementMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MONTHLY_SETTLEMENT = 'monthly_settlement'
}

export enum CooperationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated'
}

@Table({
  tableName: 'suppliers',
  timestamps: true
})
export default class Supplier extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  name: string;

  @Column({
    type: DataType.STRING(50),
    unique: true,
    allowNull: false
  })
  code: string;

  @Column({
    type: DataType.STRING(100)
  })
  contactPerson: string;

  @Column({
    type: DataType.STRING(20)
  })
  phone: string;

  @Column({
    type: DataType.STRING(255)
  })
  address: string;

  @Column({
    type: DataType.STRING(100)
  })
  email: string;

  @Column({
    type: DataType.TEXT
  })
  mainCategories: string;

  @Column({
    type: DataType.INTEGER,
    comment: '发货时效(小时)'
  })
  deliveryTime: number;

  @Column({
    type: DataType.ENUM(...Object.values(SettlementMethod)),
    defaultValue: SettlementMethod.MONTHLY_SETTLEMENT
  })
  settlementMethod: SettlementMethod;

  @Column({
    type: DataType.ENUM(...Object.values(CooperationStatus)),
    defaultValue: CooperationStatus.ACTIVE
  })
  cooperationStatus: CooperationStatus;

  @Column({
    type: DataType.TEXT
  })
  qualification: string;

  @Column({
    type: DataType.TEXT
  })
  remark: string;

  @HasMany(() => PriceAdjustment)
  priceAdjustments: PriceAdjustment[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

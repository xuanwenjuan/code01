import { Column, Table, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { Distributor } from './distributor.model';
import { Ticket } from './ticket.model';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Table({
  tableName: 'orders',
  timestamps: true,
  paranoid: true,
})
export class Order extends BaseModel {
  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单号',
  })
  orderNo: string;

  @ForeignKey(() => Distributor)
  @Column({
    type: DataType.INTEGER,
    comment: '分销商ID',
  })
  distributorId: number;

  @BelongsTo(() => Distributor)
  distributor: Distributor;

  @Column({
    type: DataType.STRING(100),
    comment: '游客姓名',
  })
  visitorName: string;

  @Column({
    type: DataType.STRING(20),
    comment: '游客电话',
  })
  visitorPhone: string;

  @Column({
    type: DataType.STRING(50),
    comment: '身份证号',
  })
  idCard: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '购买数量',
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    comment: '单价',
  })
  unitPrice: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    comment: '总金额',
  })
  totalAmount: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '佣金金额',
  })
  commissionAmount: number;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
    comment: '订单状态',
  })
  status: OrderStatus;

  @Column({
    type: DataType.DATE,
    comment: '支付时间',
  })
  paidAt: Date;

  @Column({
    type: DataType.DATE,
    comment: '过期时间',
  })
  expireAt: Date;

  @Column({
    type: DataType.STRING(500),
    comment: '备注',
  })
  remark: string;

  @HasMany(() => Ticket)
  tickets: Ticket[];
}

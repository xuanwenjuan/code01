import { Column, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { Order } from './order.model';

export enum TicketStatus {
  UNUSED = 'unused',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Table({
  tableName: 'tickets',
  timestamps: true,
  paranoid: true,
})
export class Ticket extends BaseModel {
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    comment: '票码',
  })
  ticketCode: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '订单ID',
  })
  orderId: number;

  @BelongsTo(() => Order)
  order: Order;

  @Column({
    type: DataType.STRING(100),
    comment: '产品名称',
  })
  productName: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    comment: '票面价',
  })
  price: number;

  @Column({
    type: DataType.ENUM(...Object.values(TicketStatus)),
    allowNull: false,
    defaultValue: TicketStatus.UNUSED,
    comment: '票状态',
  })
  status: TicketStatus;

  @Column({
    type: DataType.DATE,
    comment: '核销时间',
  })
  verifiedAt: Date;

  @Column({
    type: DataType.INTEGER,
    comment: '核销人ID',
  })
  verifiedBy: number;

  @Column({
    type: DataType.STRING(50),
    comment: '核销人',
  })
  verifierName: string;

  @Column({
    type: DataType.DATE,
    comment: '过期时间',
  })
  expireAt: Date;
}

import { Table, Column, Model, DataType, CreatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Reservation } from './Reservation';
import { User } from './User';

export enum PaymentMethod {
  CASH = 'cash',
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  TRANSFER = 'transfer'
}

export enum PaymentType {
  DEPOSIT = 'deposit',
  ROOM_CHARGE = 'room_charge',
  EXTRA = 'extra',
  REFUND = 'refund'
}

@Table({
  tableName: 'payments',
  timestamps: true
})
export class Payment extends Model<Payment> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    unique: true
  })
  paymentNo: string;

  @ForeignKey(() => Reservation)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  reservationId: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentType)),
    allowNull: false
  })
  type: PaymentType;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentMethod)),
    allowNull: false
  })
  method: PaymentMethod;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  handledBy: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  transactionId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;

  @BelongsTo(() => Reservation)
  reservation: Reservation;

  @BelongsTo(() => User)
  handler: User;

  @CreatedAt
  createdAt: Date;
}

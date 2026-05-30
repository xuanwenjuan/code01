import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { ChargingOrder } from './ChargingOrder';
import { User } from './User';

@Table({
  tableName: 'invoices',
  timestamps: true,
  indexes: [
    { fields: ['invoiceNo'] },
    { fields: ['userId'] },
    { fields: ['orderId'] },
  ],
})
export class Invoice extends Model<Invoice> {
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    comment: '发票编号',
  })
  invoiceNo: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '用户ID',
  })
  userId: number;

  @ForeignKey(() => ChargingOrder)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '订单ID',
  })
  orderId: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '发票抬头',
  })
  title: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '税号',
  })
  taxNumber: string;

  @Column({
    type: DataType.STRING(255),
    comment: '公司地址',
  })
  companyAddress: string;

  @Column({
    type: DataType.STRING(20),
    comment: '公司电话',
  })
  companyPhone: string;

  @Column({
    type: DataType.STRING(100),
    comment: '开户银行',
  })
  bankName: string;

  @Column({
    type: DataType.STRING(50),
    comment: '银行账号',
  })
  bankAccount: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: '开票金额',
  })
  amount: number;

  @Column({
    type: DataType.STRING(255),
    comment: '发票URL',
  })
  invoiceUrl: string;

  @Column({
    type: DataType.DATE,
    comment: '开票时间',
  })
  issuedAt: Date;

  @Column({
    type: DataType.TEXT,
    comment: '失败原因',
  })
  failReason: string;

  @Column({
    type: DataType.TEXT,
    comment: '备注',
  })
  remark: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => ChargingOrder)
  order: ChargingOrder;
}

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasOne,
  Index,
} from 'sequelize-typescript';
import { User } from './User';
import { ChargingPile } from './ChargingPile';
import { ChargingSite } from './ChargingSite';
import { OrderStatus, InvoiceStatus } from '../types';
import { Invoice } from './Invoice';

@Table({
  tableName: 'charging_orders',
  timestamps: true,
  indexes: [
    { fields: ['orderNo'] },
    { fields: ['userId'] },
    { fields: ['pileId'] },
    { fields: ['siteId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] },
  ],
})
export class ChargingOrder extends Model<ChargingOrder> {
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    comment: '订单号',
  })
  orderNo: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '用户ID',
  })
  userId: number;

  @ForeignKey(() => ChargingPile)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '充电桩ID',
  })
  pileId: number;

  @ForeignKey(() => ChargingSite)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '站点ID',
  })
  siteId: number;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
    comment: '订单状态',
  })
  status: OrderStatus;

  @Column({
    type: DataType.DATE,
    comment: '开始充电时间',
  })
  startTime: Date;

  @Column({
    type: DataType.DATE,
    comment: '结束充电时间',
  })
  endTime: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '充电时长(分钟)',
  })
  duration: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    defaultValue: 0,
    comment: '起始SOC(%)',
  })
  startSoc: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    defaultValue: 0,
    comment: '结束SOC(%)',
  })
  endSoc: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    defaultValue: 0,
    comment: '充电量(度)',
  })
  energy: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    defaultValue: 0,
    comment: '电价(元/度)',
  })
  electricityPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    defaultValue: 0,
    comment: '服务费(元/度)',
  })
  serviceFee: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '电费金额',
  })
  electricityAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '服务费金额',
  })
  serviceAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '订单总金额',
  })
  totalAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '平台分成金额',
  })
  platformShareAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '运维分成金额',
  })
  maintenanceShareAmount: number;

  @Column({
    type: DataType.ENUM(...Object.values(InvoiceStatus)),
    defaultValue: InvoiceStatus.NOT_REQUESTED,
    comment: '发票状态',
  })
  invoiceStatus: InvoiceStatus;

  @Column({
    type: DataType.TEXT,
    comment: '异常原因',
  })
  abnormalReason: string;

  @Column({
    type: DataType.TEXT,
    comment: '备注',
  })
  remark: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => ChargingPile)
  pile: ChargingPile;

  @BelongsTo(() => ChargingSite)
  site: ChargingSite;

  @HasOne(() => Invoice)
  invoice: Invoice;
}

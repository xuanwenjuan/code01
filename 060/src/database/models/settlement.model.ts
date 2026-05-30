import { Column, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { Distributor } from './distributor.model';

export enum SettlementStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
}

@Table({
  tableName: 'settlements',
  timestamps: true,
  paranoid: true,
})
export class Settlement extends BaseModel {
  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    unique: true,
    comment: '结算单号',
  })
  settlementNo: string;

  @ForeignKey(() => Distributor)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '分销商ID',
  })
  distributorId: number;

  @BelongsTo(() => Distributor)
  distributor: Distributor;

  @Column({
    type: DataType.STRING(7),
    allowNull: false,
    comment: '结算周期(YYYY-MM)',
  })
  period: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '订单总金额',
  })
  totalOrderAmount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '订单总数',
  })
  orderCount: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '可结算佣金',
  })
  commissionAmount: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
    comment: '已结算金额',
  })
  paidAmount: number;

  @Column({
    type: DataType.ENUM(...Object.values(SettlementStatus)),
    allowNull: false,
    defaultValue: SettlementStatus.PENDING,
    comment: '结算状态',
  })
  status: SettlementStatus;

  @Column({
    type: DataType.DATE,
    comment: '确认时间',
  })
  confirmedAt: Date;

  @Column({
    type: DataType.DATE,
    comment: '支付时间',
  })
  paidAt: Date;

  @Column({
    type: DataType.INTEGER,
    comment: '操作人ID',
  })
  operatorId: number;

  @Column({
    type: DataType.STRING(50),
    comment: '操作人',
  })
  operatorName: string;

  @Column({
    type: DataType.STRING(500),
    comment: '备注',
  })
  remark: string;
}

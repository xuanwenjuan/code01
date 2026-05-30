import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { ChargingSite } from './ChargingSite';

@Table({
  tableName: 'settlements',
  timestamps: true,
  indexes: [
    { fields: ['settlementNo'] },
    { fields: ['siteId'] },
    { fields: ['settlementDate'] },
  ],
})
export class Settlement extends Model<Settlement> {
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    comment: '账单编号',
  })
  settlementNo: string;

  @ForeignKey(() => ChargingSite)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '站点ID',
  })
  siteId: number;

  @Index
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    comment: '对账日期',
  })
  settlementDate: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '订单数量',
  })
  orderCount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '总充电量(度)',
  })
  totalEnergy: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '总充电时长(分钟)',
  })
  totalDuration: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '电费总金额',
  })
  totalElectricityAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '服务费总金额',
  })
  totalServiceAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '营收总金额',
  })
  totalAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '平台分成总金额',
  })
  totalPlatformShare: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '运维分成总金额',
  })
  totalMaintenanceShare: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '站点分成金额',
  })
  siteShareAmount: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: '是否已结算',
  })
  isSettled: boolean;

  @Column({
    type: DataType.DATE,
    comment: '结算时间',
  })
  settledAt: Date;

  @Column({
    type: DataType.TEXT,
    comment: '备注',
  })
  remark: string;

  @BelongsTo(() => ChargingSite)
  site: ChargingSite;
}

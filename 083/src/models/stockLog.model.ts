import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Part } from './part.model';
import { User } from './user.model';

export enum StockLogType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  SCRAP = 'SCRAP',
  RETURN = 'RETURN',
  ADJUST = 'ADJUST',
}

@Table({
  tableName: 'stock_logs',
  timestamps: true,
})
export class StockLog extends Model<StockLog> {
  @ForeignKey(() => Part)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  partId!: number;

  @BelongsTo(() => Part)
  part?: Part;

  @Column({
    type: DataType.ENUM(...Object.values(StockLogType)),
    allowNull: false,
  })
  type!: StockLogType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '变动数量(正数增加，负数减少)',
  })
  changeQuantity!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '变动前库存',
  })
  beforeQuantity!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '变动后库存',
  })
  afterQuantity!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: '关联单据号',
  })
  orderNo?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  batchNo?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  operatorId!: number;

  @BelongsTo(() => User)
  operator?: User;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  remark?: string;
}

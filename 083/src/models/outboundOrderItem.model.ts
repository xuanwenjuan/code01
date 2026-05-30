import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { OutboundOrder } from './outboundOrder.model';
import { Part } from './part.model';

@Table({
  tableName: 'outbound_order_items',
  timestamps: true,
})
export class OutboundOrderItem extends Model<OutboundOrderItem> {
  @ForeignKey(() => OutboundOrder)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  outboundOrderId!: number;

  @BelongsTo(() => OutboundOrder)
  outboundOrder?: OutboundOrder;

  @ForeignKey(() => Part)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  partId!: number;

  @BelongsTo(() => Part)
  part?: Part;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  unitPrice!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '报废数量',
  })
  scrappedQuantity!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '退回数量',
  })
  returnedQuantity!: number;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  remark?: string;
}

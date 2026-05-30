import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { PurchaseOrder } from './purchaseOrder.model';
import { Part } from './part.model';

@Table({
  tableName: 'purchase_order_items',
  timestamps: true,
})
export class PurchaseOrderItem extends Model<PurchaseOrderItem> {
  @ForeignKey(() => PurchaseOrder)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  purchaseOrderId!: number;

  @BelongsTo(() => PurchaseOrder)
  purchaseOrder?: PurchaseOrder;

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
    allowNull: true,
  })
  receivedQuantity?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  qualifiedQuantity?: number;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  remark?: string;
}

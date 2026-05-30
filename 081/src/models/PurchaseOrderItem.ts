import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import PurchaseOrder from './PurchaseOrder';
import Material from './Material';

@Table({
  tableName: 'purchase_order_items',
  timestamps: true
})
export default class PurchaseOrderItem extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @ForeignKey(() => PurchaseOrder)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  purchaseOrderId: number;

  @BelongsTo(() => PurchaseOrder)
  purchaseOrder: PurchaseOrder;

  @ForeignKey(() => Material)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  materialId: number;

  @BelongsTo(() => Material)
  material: Material;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  unitPrice: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false
  })
  amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true
  })
  receivedQuantity: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  batchNo: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  expireDate: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;
}

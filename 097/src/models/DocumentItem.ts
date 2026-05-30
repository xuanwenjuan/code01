import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import WarehouseDocument from './WarehouseDocument';
import Product from './Product';

@Table({
  tableName: 'document_items',
  timestamps: false
})
export default class DocumentItem extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @ForeignKey(() => WarehouseDocument)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  documentId: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  productId: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  productName: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  productSku: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  unitPrice: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0
  })
  amount: number;

  @Column({
    type: DataType.STRING(500)
  })
  remark: string;

  @BelongsTo(() => WarehouseDocument)
  document: WarehouseDocument;

  @BelongsTo(() => Product)
  product: Product;
}

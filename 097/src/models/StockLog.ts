import { Table, Column, Model, DataType, CreatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Product from './Product';
import WarehouseDocument from './WarehouseDocument';

export enum StockChangeType {
  IN = 'in',
  OUT = 'out'
}

@Table({
  tableName: 'stock_logs',
  timestamps: false
})
export default class StockLog extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

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
    type: DataType.ENUM(...Object.values(StockChangeType)),
    allowNull: false
  })
  changeType: StockChangeType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  quantity: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  stockBefore: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  stockAfter: number;

  @ForeignKey(() => WarehouseDocument)
  @Column({
    type: DataType.INTEGER
  })
  documentId: number;

  @Column({
    type: DataType.STRING(50)
  })
  documentNo: string;

  @Column({
    type: DataType.STRING(200)
  })
  remark: string;

  @Column({
    type: DataType.INTEGER
  })
  operatorId: number;

  @Column({
    type: DataType.STRING(50)
  })
  operatorName: string;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => WarehouseDocument)
  document: WarehouseDocument;

  @CreatedAt
  createdAt: Date;
}

import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript';
import Store from './Store';
import Material from './Material';

@Table({
  tableName: 'inventory',
  timestamps: true
})
export default class Inventory extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @ForeignKey(() => Store)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  @Index('store_material_unique')
  storeId: number;

  @BelongsTo(() => Store)
  store: Store;

  @ForeignKey(() => Material)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  @Index('store_material_unique')
  materialId: number;

  @BelongsTo(() => Material)
  material: Material;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  lockedQuantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  availableQuantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true
  })
  averageCost: number;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  lastInDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  lastOutDate: Date;
}

import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import InventoryCheck from './InventoryCheck';
import Material from './Material';

@Table({
  tableName: 'inventory_check_items',
  timestamps: true
})
export default class InventoryCheckItem extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @ForeignKey(() => InventoryCheck)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  inventoryCheckId: number;

  @BelongsTo(() => InventoryCheck)
  inventoryCheck: InventoryCheck;

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
  systemQuantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  actualQuantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  differenceQuantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true
  })
  unitCost: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: true
  })
  differenceAmount: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;
}

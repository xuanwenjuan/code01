import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { InventoryOperationType } from '../types';
import Store from './Store';
import Material from './Material';
import User from './User';

@Table({
  tableName: 'inventory_logs',
  timestamps: true
})
export default class InventoryLog extends Model {
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
  storeId: number;

  @BelongsTo(() => Store)
  store: Store;

  @ForeignKey(() => Material)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  materialId: number;

  @BelongsTo(() => Material)
  material: Material;

  @Column({
    type: DataType.ENUM(...Object.values(InventoryOperationType)),
    allowNull: false
  })
  operationType: InventoryOperationType;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  beforeQuantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  changeQuantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  afterQuantity: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  batchNo: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  expireDate: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  operatorId: number;

  @BelongsTo(() => User)
  operator: User;

  @Column({
    type: DataType.STRING(255),
    allowNull: true
  })
  relatedOrderNo: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;
}

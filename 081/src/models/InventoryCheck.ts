import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Store from './Store';
import User from './User';
import InventoryCheckItem from './InventoryCheckItem';

@Table({
  tableName: 'inventory_checks',
  timestamps: true,
  paranoid: true
})
export default class InventoryCheck extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true
  })
  checkNo: string;

  @ForeignKey(() => Store)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  storeId: number;

  @BelongsTo(() => Store)
  store: Store;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  createdBy: number;

  @BelongsTo(() => User, { foreignKey: 'createdBy' })
  creator: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  confirmedBy: number;

  @BelongsTo(() => User, { foreignKey: 'confirmedBy' })
  confirmer: User;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  confirmedAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isConfirmed: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  totalProfitCount: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  totalLossCount: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0
  })
  totalProfitAmount: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0
  })
  totalLossAmount: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;

  @HasMany(() => InventoryCheckItem)
  items: InventoryCheckItem[];
}

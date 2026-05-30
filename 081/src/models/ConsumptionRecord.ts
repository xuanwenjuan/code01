import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Store from './Store';
import Material from './Material';
import User from './User';

@Table({
  tableName: 'consumption_records',
  timestamps: true
})
export default class ConsumptionRecord extends Model {
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
    type: DataType.DATEONLY,
    allowNull: false
  })
  consumptionDate: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  quantity: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  operatorId: number;

  @BelongsTo(() => User)
  operator: User;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  remark: string;
}

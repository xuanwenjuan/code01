import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import MaterialCategory from './MaterialCategory';

@Table({
  tableName: 'materials',
  timestamps: true,
  paranoid: true
})
export default class Material extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  materialName: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true
  })
  materialCode: string;

  @ForeignKey(() => MaterialCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  categoryId: number;

  @BelongsTo(() => MaterialCategory)
  category: MaterialCategory;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  unit: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  specification: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true
  })
  warningStock: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  shelfLifeDays: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  description: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive: boolean;
}

import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

@Table({
  tableName: 'material_categories',
  timestamps: true,
  paranoid: true
})
export default class MaterialCategory extends Model {
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
  categoryName: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true
  })
  categoryCode: string;

  @ForeignKey(() => MaterialCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  parentId: number;

  @BelongsTo(() => MaterialCategory, { foreignKey: 'parentId', onDelete: 'CASCADE' })
  parent: MaterialCategory;

  @HasMany(() => MaterialCategory, { foreignKey: 'parentId' })
  children: MaterialCategory[];

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  sort: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: true
  })
  unit: string;

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

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  storeAvailable: boolean;
}

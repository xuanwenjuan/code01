import { Column, Table, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { BaseModel } from './base.model';

export enum ProductCategoryType {
  TICKET = 'ticket',
  PACKAGE = 'package',
  YEAR_CARD = 'year_card',
  AMUSEMENT = 'amusement',
}

@Table({
  tableName: 'product_categories',
  timestamps: true,
  paranoid: true,
})
export class ProductCategory extends BaseModel {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '分类名称',
  })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(ProductCategoryType)),
    allowNull: false,
    comment: '分类类型',
  })
  type: ProductCategoryType;

  @ForeignKey(() => ProductCategory)
  @Column({
    type: DataType.INTEGER,
    comment: '父分类ID',
  })
  parentId: number;

  @BelongsTo(() => ProductCategory, 'parentId')
  parent: ProductCategory;

  @HasMany(() => ProductCategory, 'parentId')
  children: ProductCategory[];

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '排序权重',
  })
  sortOrder: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: '是否启用',
  })
  enabled: boolean;

  @Column({
    type: DataType.STRING(500),
    comment: '备注',
  })
  remark: string;
}

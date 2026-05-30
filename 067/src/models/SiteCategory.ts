import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { SiteCategoryType } from '../types';
import { ChargingSite } from './ChargingSite';

@Table({
  tableName: 'site_categories',
  timestamps: true,
  paranoid: true,
})
export class SiteCategory extends Model<SiteCategory> {
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '分类名称',
  })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(SiteCategoryType)),
    allowNull: false,
    comment: '分类类型',
  })
  type: SiteCategoryType;

  @ForeignKey(() => SiteCategory)
  @Column({
    type: DataType.INTEGER,
    comment: '父分类ID',
  })
  parentId: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '排序号',
  })
  sortOrder: number;

  @Column({
    type: DataType.STRING(255),
    comment: '分类描述',
  })
  description: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: '是否启用',
  })
  isActive: boolean;

  @BelongsTo(() => SiteCategory, 'parentId')
  parent: SiteCategory;

  @HasMany(() => SiteCategory, 'parentId')
  children: SiteCategory[];

  @HasMany(() => ChargingSite)
  sites: ChargingSite[];
}

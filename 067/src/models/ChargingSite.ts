import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Index,
} from 'sequelize-typescript';
import { SiteCategory } from './SiteCategory';
import { FeeTemplate } from './FeeTemplate';
import { ChargingPile } from './ChargingPile';

@Table({
  tableName: 'charging_sites',
  timestamps: true,
  paranoid: true,
})
export class ChargingSite extends Model<ChargingSite> {
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    comment: '站点编号',
  })
  siteCode: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '站点名称',
  })
  name: string;

  @ForeignKey(() => SiteCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '分类ID',
  })
  categoryId: number;

  @ForeignKey(() => FeeTemplate)
  @Column({
    type: DataType.INTEGER,
    comment: '收费模板ID',
  })
  feeTemplateId: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '详细地址',
  })
  address: string;

  @Column({
    type: DataType.STRING(50),
    comment: '省份',
  })
  province: string;

  @Column({
    type: DataType.STRING(50),
    comment: '城市',
  })
  city: string;

  @Column({
    type: DataType.STRING(50),
    comment: '区县',
  })
  district: string;

  @Column({
    type: DataType.DECIMAL(10, 6),
    comment: '经度',
  })
  longitude: number;

  @Column({
    type: DataType.DECIMAL(10, 6),
    comment: '纬度',
  })
  latitude: number;

  @Column({
    type: DataType.STRING(20),
    comment: '联系人',
  })
  contactPerson: string;

  @Column({
    type: DataType.STRING(20),
    comment: '联系电话',
  })
  contactPhone: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '充电桩数量',
  })
  pileCount: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '排序号',
  })
  sortOrder: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: '是否运营',
  })
  isOperating: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: '是否锁定',
  })
  isLocked: boolean;

  @Column({
    type: DataType.TEXT,
    comment: '备注',
  })
  remark: string;

  @BelongsTo(() => SiteCategory)
  category: SiteCategory;

  @BelongsTo(() => FeeTemplate)
  feeTemplate: FeeTemplate;

  @HasMany(() => ChargingPile)
  piles: ChargingPile[];
}

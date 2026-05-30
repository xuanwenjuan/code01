import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Index,
} from 'sequelize-typescript';
import { ChargingSite } from './ChargingSite';

@Table({
  tableName: 'fee_templates',
  timestamps: true,
  paranoid: true,
})
export class FeeTemplate extends Model<FeeTemplate> {
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    comment: '模板名称',
  })
  name: string;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: false,
    comment: '基础电价(元/度)',
  })
  electricityPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: false,
    comment: '服务费(元/度)',
  })
  serviceFee: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    defaultValue: 0,
    comment: '平台分成比例(%)',
  })
  platformShare: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    defaultValue: 0,
    comment: '运维分成比例(%)',
  })
  maintenanceShare: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    defaultValue: 0,
    comment: '峰时电价倍数',
  })
  peakMultiplier: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    defaultValue: 1,
    comment: '平时电价倍数',
  })
  normalMultiplier: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    defaultValue: 0.7,
    comment: '谷时电价倍数',
  })
  valleyMultiplier: number;

  @Column({
    type: DataType.STRING(255),
    comment: '模板描述',
  })
  description: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: '是否启用',
  })
  isActive: boolean;

  @HasMany(() => ChargingSite)
  sites: ChargingSite[];
}

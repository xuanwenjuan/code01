import { Column, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { Distributor } from './distributor.model';

export enum CommissionTierType {
  MONTHLY_AMOUNT = 'monthly_amount',
  TOTAL_AMOUNT = 'total_amount',
  ORDER_COUNT = 'order_count',
}

@Table({
  tableName: 'commission_tiers',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['distributor_id'] },
    { fields: ['tier_type'] },
  ],
})
export class CommissionTier extends BaseModel {
  @ForeignKey(() => Distributor)
  @Column({
    type: DataType.INTEGER,
    comment: '分销商ID，为空则为全局配置',
  })
  distributorId: number;

  @BelongsTo(() => Distributor)
  distributor: Distributor;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '梯度名称',
  })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(CommissionTierType)),
    allowNull: false,
    comment: '梯度类型',
  })
  tierType: CommissionTierType;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    comment: '阈值下限',
  })
  minThreshold: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    comment: '阈值上限，为空则无上限',
  })
  maxThreshold: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    comment: '佣金比例(%)',
  })
  commissionRate: number;

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

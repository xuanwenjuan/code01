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
import { ChargingSite } from './ChargingSite';
import { ChargingPileStatus, PowerType } from '../types';
import { ChargingOrder } from './ChargingOrder';

@Table({
  tableName: 'charging_piles',
  timestamps: true,
  paranoid: true,
})
export class ChargingPile extends Model<ChargingPile> {
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    comment: '桩号',
  })
  pileCode: string;

  @ForeignKey(() => ChargingSite)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '所属站点ID',
  })
  siteId: number;

  @Column({
    type: DataType.ENUM(...Object.values(PowerType)),
    allowNull: false,
    comment: '功率类型',
  })
  powerType: PowerType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '枪头数量',
  })
  gunCount: number;

  @Column({
    type: DataType.ENUM(...Object.values(ChargingPileStatus)),
    allowNull: false,
    defaultValue: ChargingPileStatus.OFFLINE,
    comment: '设备状态',
  })
  status: ChargingPileStatus;

  @Column({
    type: DataType.DECIMAL(10, 4),
    comment: '自定义电价(元/度)',
  })
  customElectricityPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    comment: '自定义服务费(元/度)',
  })
  customServiceFee: number;

  @Column({
    type: DataType.STRING(255),
    comment: '设备型号',
  })
  model: string;

  @Column({
    type: DataType.STRING(100),
    comment: '厂商',
  })
  manufacturer: string;

  @Column({
    type: DataType.DATE,
    comment: '安装日期',
  })
  installDate: Date;

  @Column({
    type: DataType.DATE,
    comment: '最后上线时间',
  })
  lastOnlineTime: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '累计充电量(度)',
  })
  totalEnergy: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '累计充电时长(分钟)',
  })
  totalDuration: number;

  @Column({
    type: DataType.TEXT,
    comment: '故障描述',
  })
  faultDescription: string;

  @Column({
    type: DataType.TEXT,
    comment: '备注',
  })
  remark: string;

  @BelongsTo(() => ChargingSite)
  site: ChargingSite;

  @HasMany(() => ChargingOrder)
  orders: ChargingOrder[];
}

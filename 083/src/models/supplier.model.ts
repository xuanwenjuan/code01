import {
  Column,
  Model,
  Table,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { SupplierStatus } from '../constants/business';

@Table({
  tableName: 'suppliers',
  timestamps: true,
  paranoid: true,
})
export class Supplier extends Model<Supplier> {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  code!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: '品牌',
  })
  brand?: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  address?: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  contactPerson?: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  contactPhone?: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  qualification?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  qualificationExpiryDate?: Date;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  supplyCategories?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: '供货周期(天)',
  })
  supplyCycle?: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: '账期结算方式',
  })
  paymentTerm?: string;

  @Column({
    type: DataType.ENUM(...Object.values(SupplierStatus)),
    defaultValue: SupplierStatus.COOPERATING,
  })
  status!: SupplierStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  remark?: string;
}

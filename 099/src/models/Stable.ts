import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface StableAttributes {
  id?: number;
  name: string;
  code: string;
  location?: string;
  capacity: number;
  currentCount?: number;
  managerId?: number;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Stable extends Model<StableAttributes> implements StableAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public location?: string;
  public capacity!: number;
  public currentCount?: number;
  public managerId?: number;
  public status!: 'active' | 'inactive';
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Stable.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '马舍名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '马舍编号'
    },
    location: {
      type: DataTypes.STRING(200),
      comment: '位置'
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '容量'
    },
    currentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '当前数量'
    },
    managerId: {
      type: DataTypes.INTEGER,
      comment: '管理员ID'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: '状态'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'Stable',
    tableName: 'stables',
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['status'] }
    ]
  }
);

export default Stable;

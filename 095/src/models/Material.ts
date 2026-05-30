import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { MaterialStatus, MaterialType } from '../types';

class Material extends Model {
  public id!: number;
  public batchNo!: string;
  public name!: string;
  public type!: MaterialType;
  public specification!: string;
  public unit!: string;
  public stockQuantity!: number;
  public lockedQuantity!: number;
  public availableQuantity!: number;
  public warningThreshold!: number;
  public unitPrice!: number;
  public supplier!: string;
  public supplierPhone!: string;
  public supplierAddress!: string;
  public purchaseDate!: Date | null;
  public storageDate!: Date | null;
  public origin!: string;
  public color!: string;
  public weight!: string;
  public width!: string;
  public usage!: string;
  public status!: MaterialStatus;
  public remarks!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Material.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    batchNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(MaterialType)),
      allowNull: false,
    },
    specification: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    stockQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    lockedQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '已锁定的库存数量',
    },
    availableQuantity: {
      type: DataTypes.VIRTUAL,
      get(this: Material) {
        return Number(this.stockQuantity) - Number(this.lockedQuantity);
      },
      comment: '可用库存数量（虚拟字段）',
    },
    warningThreshold: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 10,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    supplier: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    supplierPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    supplierAddress: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    storageDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    origin: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    weight: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    width: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    usage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MaterialStatus)),
      allowNull: false,
      defaultValue: MaterialStatus.IN_STOCK,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Material',
    tableName: 'materials',
  }
);

export default Material;

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { MaterialStatus, MaterialType } from '../types';

interface MaterialAttributes {
  id: number;
  batchNumber: string;
  name: string;
  type: MaterialType;
  specification: string;
  quantity: number;
  lockedQuantity: number;
  availableQuantity: number;
  unit: string;
  status: MaterialStatus;
  unitCost: number;
  supplier?: string;
  receivedDate: Date;
  expirationDate?: Date;
  location?: string;
  remarks?: string;
  lowStockAlert: boolean;
}

interface MaterialCreationAttributes extends Optional<MaterialAttributes, 'id' | 'status' | 'lowStockAlert'> {}

class Material extends Model<MaterialAttributes, MaterialCreationAttributes> implements MaterialAttributes {
  public id!: number;
  public batchNumber!: string;
  public name!: string;
  public type!: MaterialType;
  public specification!: string;
  public quantity!: number;
  public lockedQuantity!: number;
  public availableQuantity!: number;
  public unit!: string;
  public status!: MaterialStatus;
  public unitCost!: number;
  public supplier?: string;
  public receivedDate!: Date;
  public expirationDate?: Date;
  public location?: string;
  public remarks?: string;
  public lowStockAlert!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Material.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    batchNumber: {
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
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    lockedQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    availableQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'kg',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MaterialStatus)),
      allowNull: false,
      defaultValue: MaterialStatus.AVAILABLE,
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    supplier: {
      type: DataTypes.STRING(100),
    },
    receivedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATE,
    },
    location: {
      type: DataTypes.STRING(100),
    },
    remarks: {
      type: DataTypes.TEXT,
    },
    lowStockAlert: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Material',
    tableName: 'materials',
  }
);

export default Material;

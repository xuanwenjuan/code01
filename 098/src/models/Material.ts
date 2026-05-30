import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { MaterialType } from '../types';

interface MaterialAttributes {
  id: number;
  name: string;
  code: string;
  type: MaterialType;
  specification?: string;
  unit: string;
  quantity: number;
  unitPrice?: number;
  totalValue?: number;
  threshold: number;
  location?: string;
  remarks?: string;
  isActive: boolean;
}

interface MaterialCreationAttributes extends Optional<MaterialAttributes, 'id' | 'quantity' | 'threshold' | 'isActive'> {}

class Material extends Model<MaterialAttributes, MaterialCreationAttributes> implements MaterialAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public type!: MaterialType;
  public specification?: string;
  public unit!: string;
  public quantity!: number;
  public unitPrice?: number;
  public totalValue?: number;
  public threshold!: number;
  public location?: string;
  public remarks?: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Material.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM(...Object.values(MaterialType)),
      allowNull: false
    },
    specification: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'unit_price'
    },
    totalValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'total_value'
    },
    threshold: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 10
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  },
  {
    sequelize,
    modelName: 'Material',
    tableName: 'materials',
    timestamps: true
  }
);

export default Material;

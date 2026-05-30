import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderType } from '../types';

interface CategoryAttributes {
  id: number;
  name: string;
  type: OrderType;
  description?: string;
  basePrice: number;
  pricePerKm: number;
  pricePerKg: number;
  startTime?: string;
  endTime?: string;
  nightSurcharge: number;
  weightSurcharge: number;
  status: number;
  sort: number;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'description' | 'startTime' | 'endTime' | 'nightSurcharge' | 'weightSurcharge' | 'status' | 'sort'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public type!: OrderType;
  public description?: string;
  public basePrice!: number;
  public pricePerKm!: number;
  public pricePerKg!: number;
  public startTime?: string;
  public endTime?: string;
  public nightSurcharge!: number;
  public weightSurcharge!: number;
  public status!: number;
  public sort!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(...Object.values(OrderType)),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    pricePerKm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    pricePerKg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    startTime: {
      type: DataTypes.STRING(10)
    },
    endTime: {
      type: DataTypes.STRING(10)
    },
    nightSurcharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    weightSurcharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'category',
    modelName: 'Category'
  }
);

export default Category;

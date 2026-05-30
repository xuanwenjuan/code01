import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import ReagentCategory from './ReagentCategory';
import Supplier from './Supplier';

interface ReagentAttributes {
  id: number;
  name: string;
  code: string;
  casNo: string;
  molecularFormula: string;
  specification: string;
  unit: string;
  categoryId: number;
  supplierId: number;
  price: number;
  safetyLevel: string;
  storageCondition: string;
  description: string;
  status: boolean;
}

interface ReagentCreationAttributes extends Optional<ReagentAttributes, 'id' | 'status' | 'description'> {}

class Reagent extends Model<ReagentAttributes, ReagentCreationAttributes> implements ReagentAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public casNo!: string;
  public molecularFormula!: string;
  public specification!: string;
  public unit!: string;
  public categoryId!: number;
  public supplierId!: number;
  public price!: number;
  public safetyLevel!: string;
  public storageCondition!: string;
  public description!: string;
  public status!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly category?: ReagentCategory;
  public readonly supplier?: Supplier;
}

Reagent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    casNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'CAS号'
    },
    molecularFormula: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '分子式'
    },
    specification: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '规格型号'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '计量单位'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'supplier_id'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    safetyLevel: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '安全等级'
    },
    storageCondition: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '存储条件'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'reagents',
    modelName: 'Reagent'
  }
);

Reagent.belongsTo(ReagentCategory, { as: 'category', foreignKey: 'categoryId' });
Reagent.belongsTo(Supplier, { as: 'supplier', foreignKey: 'supplierId' });

export default Reagent;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { MotherStrainStatus } from '../types';
import StrainCategory from './StrainCategory';

class MotherStrain extends Model {
  public id!: number;
  public strainCode!: string;
  public strainName!: string;
  public categoryId!: number;
  public generation!: number;
  public mediumFormula!: string;
  public storageTemperature!: number;
  public viabilityDate!: Date;
  public status!: MotherStrainStatus;
  public originSource!: string | null;
  public description!: string | null;
  public warningSent!: boolean;
  public readonly category?: StrainCategory;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MotherStrain.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    strainCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'strain_code'
    },
    strainName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'strain_name'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
      references: {
        model: StrainCategory,
        key: 'id'
      }
    },
    generation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    mediumFormula: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'medium_formula'
    },
    storageTemperature: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'storage_temperature'
    },
    viabilityDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'viability_date'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MotherStrainStatus)),
      allowNull: false,
      defaultValue: MotherStrainStatus.BREEDING
    },
    originSource: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'origin_source'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    warningSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'warning_sent'
    }
  },
  {
    sequelize,
    modelName: 'MotherStrain',
    tableName: 'mother_strains'
  }
);

MotherStrain.belongsTo(StrainCategory, {
  as: 'category',
  foreignKey: 'categoryId'
});

export default MotherStrain;
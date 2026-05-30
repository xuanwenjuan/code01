import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ExhibitionCollection extends Model {
  public id!: number;
  public exhibitionId!: number;
  public collectionId!: number;
  public position?: string;
  public displayOrder!: number;
  public inDate?: Date;
  public outDate?: Date;
  public maintenanceCost?: number;
  public rotationCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ExhibitionCollection.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    exhibitionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    collectionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    position: {
      type: DataTypes.STRING(200)
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    inDate: {
      type: DataTypes.DATE
    },
    outDate: {
      type: DataTypes.DATE
    },
    maintenanceCost: {
      type: DataTypes.DECIMAL(10, 2)
    },
    rotationCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: 'ExhibitionCollection',
    tableName: 'exhibition_collections'
  }
);

export default ExhibitionCollection;

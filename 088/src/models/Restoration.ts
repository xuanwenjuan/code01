import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { RestorationStatus } from '../types';

class Restoration extends Model {
  public id!: number;
  public collectionId!: number;
  public submittedBy!: number;
  public submissionDate!: Date;
  public status!: RestorationStatus;
  public damageDescription?: string;
  public restorationPlan?: string;
  public planApprovedBy?: number;
  public planApprovedDate?: Date;
  public technicianId?: number;
  public startDate?: Date;
  public endDate?: Date;
  public restorationNotes?: string;
  public cost?: number;
  public验收人Id?: number;
  public验收Date?: Date;
  public验收Notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Restoration.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    collectionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    submittedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    submissionDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RestorationStatus)),
      allowNull: false,
      defaultValue: RestorationStatus.SUBMITTED
    },
    damageDescription: {
      type: DataTypes.TEXT
    },
    restorationPlan: {
      type: DataTypes.TEXT
    },
    planApprovedBy: {
      type: DataTypes.INTEGER.UNSIGNED
    },
    planApprovedDate: {
      type: DataTypes.DATE
    },
    technicianId: {
      type: DataTypes.INTEGER.UNSIGNED
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE
    },
    restorationNotes: {
      type: DataTypes.TEXT
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2)
    },
    验收人Id: {
      type: DataTypes.INTEGER.UNSIGNED
    },
    验收Date: {
      type: DataTypes.DATE
    },
    验收Notes: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    modelName: 'Restoration',
    tableName: 'restorations'
  }
);

export default Restoration;

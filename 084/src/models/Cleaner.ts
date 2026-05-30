import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import WorkArea from './WorkArea';
import User from './User';

export enum CleanerStatus {
  ON_DUTY = 'on_duty',
  LEAVE = 'leave',
  RESIGNED = 'resigned'
}

export enum WorkType {
  STREET_SWEEPER = 'street_sweeper',
  GARBAGE_COLLECTOR = 'garbage_collector',
  GENERAL_CLEANER = 'general_cleaner'
}

export enum ShiftType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night',
  FULL_DAY = 'full_day'
}

interface CleanerAttributes {
  id: number;
  employeeNo: string;
  name: string;
  idCard: string;
  phone: string;
  workAreaId: number;
  workType: WorkType;
  shiftType: ShiftType;
  status: CleanerStatus;
  qualifications?: string;
  hireDate: Date;
  contractExpiryDate: Date;
  contractReminded?: boolean;
  userId?: number;
}

class Cleaner extends Model<CleanerAttributes> implements CleanerAttributes {
  public id!: number;
  public employeeNo!: string;
  public name!: string;
  public idCard!: string;
  public phone!: string;
  public workAreaId!: number;
  public workType!: WorkType;
  public shiftType!: ShiftType;
  public status!: CleanerStatus;
  public qualifications?: string;
  public hireDate!: Date;
  public contractExpiryDate!: Date;
  public contractReminded!: boolean;
  public userId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cleaner.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    idCard: {
      type: DataTypes.STRING(18),
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    workAreaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: WorkArea,
        key: 'id'
      }
    },
    workType: {
      type: DataTypes.ENUM(...Object.values(WorkType)),
      allowNull: false
    },
    shiftType: {
      type: DataTypes.ENUM(...Object.values(ShiftType)),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CleanerStatus)),
      allowNull: false,
      defaultValue: CleanerStatus.ON_DUTY
    },
    qualifications: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    contractExpiryDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    contractReminded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'Cleaner',
    tableName: 'cleaners',
    timestamps: true
  }
);

Cleaner.belongsTo(WorkArea, { foreignKey: 'workAreaId', as: 'workArea' });
Cleaner.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Cleaner;
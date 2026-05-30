import sequelize from '../config/database';
import User from './User';
import StrainCategory from './StrainCategory';
import MotherStrain from './MotherStrain';
import CultivationBatch from './CultivationBatch';
import TraceabilityRecord from './TraceabilityRecord';
import OperationLog from './OperationLog';

const db = {
  sequelize,
  User,
  StrainCategory,
  MotherStrain,
  CultivationBatch,
  TraceabilityRecord,
  OperationLog
};

export default db;
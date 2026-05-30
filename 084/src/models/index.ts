import sequelize from '../config/database';
import User from './User';
import WorkArea from './WorkArea';
import Cleaner from './Cleaner';
import WorkOrder from './WorkOrder';
import WorkOrderLog from './WorkOrderLog';
import Performance from './Performance';
import OperationLog from './OperationLog';

const db = {
  sequelize,
  User,
  WorkArea,
  Cleaner,
  WorkOrder,
  WorkOrderLog,
  Performance,
  OperationLog
};

export default db;
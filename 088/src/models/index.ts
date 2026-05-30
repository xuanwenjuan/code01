import sequelize from '../config/database';
import User from './User';
import Category from './Category';
import Collection from './Collection';
import Restoration from './Restoration';
import Exhibition from './Exhibition';
import ExhibitionCollection from './ExhibitionCollection';
import OperationLog from './OperationLog';
import MaintenanceRecord from './MaintenanceRecord';

Collection.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

Category.hasMany(Collection, {
  foreignKey: 'categoryId',
  as: 'collections'
});

Restoration.belongsTo(Collection, {
  foreignKey: 'collectionId',
  as: 'collection'
});

Collection.hasMany(Restoration, {
  foreignKey: 'collectionId',
  as: 'restorations'
});

Restoration.belongsTo(User, {
  foreignKey: 'submittedBy',
  as: 'submitter'
});

Restoration.belongsTo(User, {
  foreignKey: 'technicianId',
  as: 'technician'
});

Exhibition.belongsToMany(Collection, {
  through: ExhibitionCollection,
  foreignKey: 'exhibitionId',
  otherKey: 'collectionId',
  as: 'collections'
});

Collection.belongsToMany(Exhibition, {
  through: ExhibitionCollection,
  foreignKey: 'collectionId',
  otherKey: 'exhibitionId',
  as: 'exhibitions'
});

ExhibitionCollection.belongsTo(Exhibition, {
  foreignKey: 'exhibitionId',
  as: 'exhibition'
});

ExhibitionCollection.belongsTo(Collection, {
  foreignKey: 'collectionId',
  as: 'collection'
});

MaintenanceRecord.belongsTo(Collection, {
  foreignKey: 'collectionId',
  as: 'collection'
});

MaintenanceRecord.belongsTo(User, {
  foreignKey: 'performedBy',
  as: 'performer'
});

Collection.hasMany(MaintenanceRecord, {
  foreignKey: 'collectionId',
  as: 'maintenanceRecords'
});

export {
  sequelize,
  User,
  Category,
  Collection,
  Restoration,
  Exhibition,
  ExhibitionCollection,
  OperationLog,
  MaintenanceRecord
};

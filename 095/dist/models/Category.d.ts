import { Model } from 'sequelize';
import { CategoryStatus } from '../types';
declare class Category extends Model {
    id: number;
    name: string;
    parentId: number | null;
    level: number;
    sortOrder: number;
    description: string;
    status: CategoryStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly children?: Category[];
}
export default Category;

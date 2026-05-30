import { Model } from 'sequelize';
declare class Product extends Model {
    id: number;
    categoryId: number;
    name: string;
    code: string;
    description: string;
    basePrice: number;
    customFee: number;
    images: string;
    isActive: boolean;
    sortOrder: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Product;

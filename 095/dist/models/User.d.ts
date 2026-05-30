import { Model } from 'sequelize';
import { UserRole } from '../types';
declare class User extends Model {
    id: number;
    username: string;
    password: string;
    realName: string;
    phone: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}
export default User;

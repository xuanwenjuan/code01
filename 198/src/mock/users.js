import { USER_ROLES } from '@/types';

export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: USER_ROLES.ADMIN,
    name: '张管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    email: 'admin@guji.com',
    phone: '13800138001',
    department: '档案管理部'
  },
  {
    id: 2,
    username: 'restorer',
    password: 'restorer123',
    role: USER_ROLES.RESTORER,
    name: '李修复师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=restorer',
    email: 'restorer@guji.com',
    phone: '13800138002',
    department: '古籍修复中心',
    title: '高级修复师',
    experience: 15,
    specialty: ['宋代刻本', '书画修复'],
    certification: ['国家级古籍修复师', '文物修复资质证书']
  },
  {
    id: 3,
    username: 'restorer2',
    password: 'restorer456',
    role: USER_ROLES.RESTORER,
    name: '王修复师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=restorer2',
    email: 'restorer2@guji.com',
    phone: '13800138003',
    department: '古籍修复中心',
    title: '资深修复师',
    experience: 10,
    specialty: ['清代古籍', '手抄本修复'],
    certification: ['国家级古籍修复师']
  }
];

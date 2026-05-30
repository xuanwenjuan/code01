export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  role: 'user' | 'technician';
  gender?: 'male' | 'female';
  address?: Address[];
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export interface Technician {
  id: string;
  name: string;
  avatar: string;
  title: string;
  rating: number;
  orderCount: number;
  experience: number;
  price: number;
  distance: number;
  tags: string[];
  description: string;
  services: string[];
}

export interface Service {
  id: string;
  name: string;
  category: 'nail' | 'eyelash' | 'care';
  price: number;
  originalPrice: number;
  duration: number;
  description: string;
  images: string[];
  technicianId: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  tags: string[];
  process: ServiceStep[];
}

export interface ServiceStep {
  step: number;
  title: string;
  desc: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  images: string[];
  createTime: string;
  serviceName: string;
}

export interface Order {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceImage: string;
  technicianId: string;
  technicianName: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  appointmentTime: string;
  address: Address;
  createTime: string;
  remark?: string;
}

export interface Coupon {
  id: string;
  name: string;
  discount: number;
  minAmount: number;
  expireTime: string;
  used: boolean;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  link?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'nail' | 'eyelash' | 'care';
}

export interface Activity {
  id: string;
  title: string;
  image: string;
  discount: string;
  endTime: string;
}

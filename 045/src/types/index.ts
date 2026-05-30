export type DepartmentStatus = 'active' | 'inactive';
export type ProjectStatus = 'active' | 'inactive';
export type CustomerGender = 'male' | 'female';
export type DoctorStatus = 'active' | 'inactive';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PackageStatus = 'active' | 'inactive';
export type OrderStatus = 'pending' | 'verified' | 'expired';

export interface Department {
  id: string;
  name: string;
  description: string;
  status: DepartmentStatus;
  createdAt: string;
}

export interface Project {
  id: string;
  departmentId: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  status: ProjectStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  age: number;
  gender: CustomerGender;
  skinType: string;
  constitution: string;
  medicalHistory: string;
  contraindications: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  specialty: string;
  phone: string;
  status: DoctorStatus;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Schedule {
  id: string;
  doctorId: string;
  date: string;
  timeSlots: TimeSlot[];
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  doctorId: string;
  doctorName: string;
  projectId: string;
  projectName: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  projects: string[];
  originalPrice: number;
  discountPrice: number;
  validityDays: number;
  status: PackageStatus;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  packageId: string;
  packageName: string;
  totalAmount: number;
  status: OrderStatus;
  purchaseDate: string;
  expiryDate: string;
  verifiedDate?: string;
}

export interface AppState {
  departments: Department[];
  projects: Project[];
  customers: Customer[];
  doctors: Doctor[];
  schedules: Schedule[];
  appointments: Appointment[];
  packages: Package[];
  orders: Order[];
  currentModule: string;
}

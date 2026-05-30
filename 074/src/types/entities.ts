import {
  UserRole,
  CourseCategoryStatus,
  TeacherStatus,
  StudentStatus,
  EnrollmentStatus,
  PaymentStatus,
  AttendanceStatus,
  ClassStatus
} from './enums';

export interface IUser {
  id: number;
  username: string;
  realName: string;
  role: UserRole;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseCategory {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  sortOrder: number;
  status: CourseCategoryStatus;
  icon?: string;
  hasChildren?: boolean;
  children?: ICourseCategory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacher {
  id: number;
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  birthDate?: Date;
  avatar?: string;
  qualifications?: string;
  qualificationExpiryDate?: Date;
  availableTimeSlots?: ITimeSlot[];
  status: TeacherStatus;
  rating: number;
  ratingCount: number;
  remark?: string;
  courses?: ICourseCategory[];
  classes?: IClass[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent {
  id: number;
  name: string;
  parentPhone: string;
  parentName?: string;
  gender?: string;
  birthDate?: Date;
  address?: string;
  status: StudentStatus;
  remark?: string;
  enrollments?: IEnrollment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IClass {
  id: number;
  name: string;
  courseId: number;
  teacherId: number;
  maxStudents: number;
  currentStudents: number;
  totalHours: number;
  tuition: number;
  startDate?: Date;
  endDate?: Date;
  status: ClassStatus;
  description?: string;
  course?: ICourseCategory;
  teacher?: ITeacher;
  schedules?: ISchedule[];
  enrollments?: IEnrollment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollment {
  id: number;
  studentId: number;
  classId: number;
  amount: number;
  paidAmount: number;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  usedHours: number;
  totalHours: number;
  enrollmentDate: Date;
  isTrial: boolean;
  remark?: string;
  student?: IStudent;
  class?: IClass;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISchedule {
  id: number;
  classId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  id: number;
  studentId: number;
  classId: number;
  attendanceDate: string;
  status: AttendanceStatus;
  hoursConsumed: number;
  checkInTime?: string;
  remark?: string;
  student?: IStudent;
  class?: IClass;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacherCourse {
  teacherId: number;
  courseId: number;
}

export interface ITimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface IOperationLog {
  id: number;
  module: string;
  action: string;
  operatorId: number;
  operatorName?: string;
  targetId?: number;
  targetType?: string;
  oldData?: any;
  newData?: any;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

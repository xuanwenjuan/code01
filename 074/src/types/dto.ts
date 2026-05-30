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

export interface ILoginDto {
  username: string;
  password: string;
}

export interface IChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface ICreateUserDto {
  username: string;
  password: string;
  realName: string;
  role: UserRole;
  phone?: string;
  email?: string;
}

export interface IUpdateUserDto {
  realName?: string;
  role?: UserRole;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface ICreateCourseCategoryDto {
  name: string;
  description?: string;
  parentId?: number;
  sortOrder?: number;
  icon?: string;
}

export interface IUpdateCourseCategoryDto {
  name?: string;
  description?: string;
  parentId?: number;
  sortOrder?: number;
  status?: CourseCategoryStatus;
  icon?: string;
}

export interface IGetCourseCategoryQueryDto {
  status?: CourseCategoryStatus;
  parentId?: number;
}

export interface ICreateTeacherDto {
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  birthDate?: Date;
  avatar?: string;
  qualifications?: string;
  qualificationExpiryDate?: Date;
  availableTimeSlots?: any;
  status?: TeacherStatus;
  courseIds?: number[];
  remark?: string;
}

export interface IUpdateTeacherDto {
  name?: string;
  phone?: string;
  email?: string;
  gender?: string;
  birthDate?: Date;
  avatar?: string;
  qualifications?: string;
  qualificationExpiryDate?: Date;
  availableTimeSlots?: any;
  status?: TeacherStatus;
  courseIds?: number[];
  remark?: string;
}

export interface IGetTeacherQueryDto {
  status?: TeacherStatus;
  courseId?: number;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface ICreateStudentDto {
  name: string;
  parentPhone: string;
  parentName?: string;
  gender?: string;
  birthDate?: Date;
  address?: string;
  remark?: string;
}

export interface IUpdateStudentDto {
  name?: string;
  parentPhone?: string;
  parentName?: string;
  gender?: string;
  birthDate?: Date;
  address?: string;
  status?: StudentStatus;
  remark?: string;
}

export interface IGetStudentQueryDto {
  status?: StudentStatus;
  keyword?: string;
  classId?: number;
  page?: number;
  pageSize?: number;
}

export interface IEnrollStudentDto {
  studentId: number;
  classId: number;
  amount: number;
  paidAmount?: number;
  isTrial?: boolean;
  remark?: string;
}

export interface IApproveEnrollmentDto {
  amount?: number;
  paidAmount?: number;
  remark?: string;
}

export interface IRejectEnrollmentDto {
  reason: string;
}

export interface IUpdatePaymentDto {
  paidAmount: number;
  paymentStatus: PaymentStatus;
  remark?: string;
}

export interface ICreateClassDto {
  name: string;
  courseId: number;
  teacherId: number;
  maxStudents: number;
  totalHours: number;
  tuition: number;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  scheduleData?: any[];
}

export interface IUpdateClassDto {
  name?: string;
  courseId?: number;
  teacherId?: number;
  maxStudents?: number;
  currentStudents?: number;
  totalHours?: number;
  tuition?: number;
  startDate?: Date;
  endDate?: Date;
  status?: ClassStatus;
  description?: string;
  scheduleData?: any[];
}

export interface IGetClassQueryDto {
  status?: ClassStatus;
  courseId?: number;
  teacherId?: number;
  page?: number;
  pageSize?: number;
}

export interface IRecordAttendanceDto {
  classId: number;
  attendanceDate: string;
  records: Array<{
    studentId: number;
    status: AttendanceStatus;
    hoursConsumed?: number;
    checkInTime?: string;
    remark?: string;
  }>;
}

export interface IUpdateAttendanceDto {
  status?: AttendanceStatus;
  hoursConsumed?: number;
  checkInTime?: string;
  remark?: string;
}

export interface IGetAttendanceQueryDto {
  classId?: number;
  studentId?: number;
  attendanceDate?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

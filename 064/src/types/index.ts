export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ACADEMIC_ADMIN = 'academic_admin',
  FINANCE_ADMIN = 'finance_admin',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export enum MajorCategoryType {
  VOCATIONAL_CERT = 'vocational_cert',
  SKILL_PRACTICE = 'skill_practice',
  DEGREE_PROMOTION = 'degree_promotion',
  INTEREST_STUDY = 'interest_study'
}

export enum TeacherStatus {
  ON_DUTY = 'on_duty',
  ON_LEAVE = 'on_leave',
  RESIGNED = 'resigned'
}

export enum TeacherType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time'
}

export enum StudentStatus {
  REGISTERED = 'registered',
  ENROLLED = 'enrolled',
  AUDITING = 'auditing',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended'
}

export enum PaymentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REFUNDED = 'refunded'
}

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ClassStatus {
  PREPARING = 'preparing',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  LEAVE_EARLY = 'leave_early',
  LEAVE = 'leave'
}

export enum OperationModule {
  AUTH = 'auth',
  MAJOR = '专业管理',
  TEACHER = '讲师管理',
  STUDENT = '学员管理',
  ENROLLMENT = '报名管理',
  CLASS = '班级管理',
  LESSON = '课时管理',
  ATTENDANCE = '考勤管理',
  PAYMENT = '缴费管理'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  QUERY = 'query',
  EXPORT = 'export',
  IMPORT = 'import'
}

export interface PaginatedParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  realName?: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface IUser {
  id: number;
  username: string;
  password?: string;
  realName: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMajorCategory {
  id: number;
  name: string;
  type: MajorCategoryType;
  parentId?: number;
  level: number;
  sort: number;
  hours: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  children?: IMajorCategory[];
  parent?: IMajorCategory;
}

export interface ITeacher {
  id: number;
  userId?: number;
  name: string;
  phone: string;
  idCard?: string;
  type: TeacherType;
  status: TeacherStatus;
  teachingMajorIds?: string;
  qualifications?: string;
  experience?: string;
  avatar?: string;
  email?: string;
  address?: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: IUser;
}

export interface IStudent {
  id: number;
  userId?: number;
  name: string;
  phone: string;
  idCard?: string;
  gender?: 'male' | 'female';
  birthday?: Date;
  status: StudentStatus;
  avatar?: string;
  email?: string;
  address?: string;
  education?: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: IUser;
}

export interface IClass {
  id: number;
  name: string;
  majorId: number;
  teacherId: number;
  maxStudents: number;
  currentStudents: number;
  status: ClassStatus;
  startDate?: Date;
  endDate?: Date;
  totalHours: number;
  completedHours: number;
  classroom?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  major?: IMajorCategory;
  teacher?: ITeacher;
}

export interface IEnrollment {
  id: number;
  studentId: number;
  majorId: number;
  classId?: number;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  paidAt?: Date;
  auditorId?: number;
  auditRemark?: string;
  auditTime?: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  student?: IStudent;
  major?: IMajorCategory;
  classInfo?: IClass;
}

export interface ILesson {
  id: number;
  classId: number;
  teacherId: number;
  majorId: number;
  title: string;
  content?: string;
  lessonDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  classroom?: string;
  isCompleted: boolean;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  classInfo?: IClass;
  teacher?: ITeacher;
  major?: IMajorCategory;
}

export interface IAttendance {
  id: number;
  lessonId: number;
  studentId: number;
  classId: number;
  status: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;
  leaveReason?: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  lesson?: ILesson;
  student?: IStudent;
  classInfo?: IClass;
}

export interface IOperationLog {
  id: number;
  userId?: number;
  username?: string;
  module: OperationModule;
  operation: string;
  method: string;
  url: string;
  ip?: string;
  params?: string;
  result?: string;
  status: boolean;
  duration: number;
  createdAt: Date;
}

export interface IAttendanceStatistics {
  [AttendanceStatus.PRESENT]: number;
  [AttendanceStatus.ABSENT]: number;
  [AttendanceStatus.LATE]: number;
  [AttendanceStatus.LEAVE_EARLY]: number;
  [AttendanceStatus.LEAVE]: number;
  total: number;
  attendanceRate: number;
}

export interface ICreateUserDto {
  username: string;
  password: string;
  realName: string;
  phone: string;
  email?: string;
  role: UserRole;
}

export interface ICreateTeacherDto {
  name: string;
  phone: string;
  idCard?: string;
  type: TeacherType;
  teachingMajorIds?: string;
  qualifications?: string;
  experience?: string;
  email?: string;
  address?: string;
  remark?: string;
}

export interface ICreateStudentDto {
  name: string;
  phone: string;
  idCard?: string;
  gender?: 'male' | 'female';
  birthday?: Date;
  email?: string;
  address?: string;
  education?: string;
  remark?: string;
}

export interface ICreateEnrollmentDto {
  studentId: number;
  majorId: number;
  amount?: number;
  remark?: string;
}

export interface ICreateClassDto {
  name: string;
  majorId: number;
  teacherId: number;
  maxStudents?: number;
  startDate?: Date;
  endDate?: Date;
  totalHours?: number;
  classroom?: string;
  description?: string;
}

export interface ICreateLessonDto {
  classId: number;
  teacherId: number;
  title: string;
  content?: string;
  lessonDate: Date;
  startTime: string;
  endTime: string;
  duration?: number;
  classroom?: string;
  remark?: string;
}

export interface ITeacherQueryParams extends PaginatedParams {
  status?: TeacherStatus;
  type?: TeacherType;
  majorId?: number;
  keyword?: string;
}

export interface IStudentQueryParams extends PaginatedParams {
  status?: StudentStatus;
  keyword?: string;
}

export interface IEnrollmentQueryParams extends PaginatedParams {
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  studentId?: number;
  majorId?: number;
  classId?: number;
}

export interface IClassQueryParams extends PaginatedParams {
  status?: ClassStatus;
  majorId?: number;
  teacherId?: number;
  keyword?: string;
}

export interface ILessonQueryParams extends PaginatedParams {
  classId?: number;
  teacherId?: number;
  startDate?: string;
  endDate?: string;
  isCompleted?: boolean;
}

export interface IAttendanceQueryParams extends PaginatedParams {
  lessonId?: number;
  studentId?: number;
  classId?: number;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
}

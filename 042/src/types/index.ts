export type DepartmentType = '技术研发' | '市场营销' | '职能管理' | '产品运营';

export type JobStatusType = '招聘中' | '已暂停' | '已关闭';

export type ResumeStatusType = '初筛' | '面试中' | '已录用' | '已淘汰';

export type EducationType = '博士' | '硕士' | '本科' | '大专' | '高中及以下';

export type ExperienceType = '应届毕业生' | '1-3年' | '3-5年' | '5-10年' | '10年以上';

export type GenderType = '男' | '女';

export type InterviewResultType = '通过' | '未通过' | '待定';

export type TableMode = 'job' | 'resume';

export interface JobPosition {
  id: string;
  name: string;
  department: DepartmentType;
  salaryRange: string;
  quota: number;
  hiredCount: number;
  status: JobStatusType;
  description: string;
  requirements: string;
  educationRequirement?: EducationType;
  experienceRequirement?: ExperienceType;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewRecord {
  id: string;
  resumeId: string;
  round: number;
  interviewer: string;
  interviewTime: string;
  location: string;
  score?: number;
  comment?: string;
  result?: InterviewResultType;
  createdAt: string;
}

export interface Resume {
  id: string;
  name: string;
  gender: GenderType;
  age: number;
  phone: string;
  email: string;
  education: EducationType;
  school: string;
  major: string;
  experience: ExperienceType;
  jobId: string;
  status: ResumeStatusType;
  isHighPotential: boolean;
  lastFollowUpDate: string;
  expectedSalary?: string;
  currentLocation?: string;
  skills: string[];
  workHistory: string[];
  selfIntroduction: string;
  interviews: InterviewRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentStat {
  department: DepartmentType;
  totalResumes: number;
  interviews: number;
  hired: number;
  passRate: number;
}

export interface FunnelDataItem {
  stage: string;
  value: number;
  percentage: number;
}

export interface RecruitmentStats {
  totalResumes: number;
  totalInterviews: number;
  totalHired: number;
  interviewPassRate: number;
  fillRate: number;
  totalPositions: number;
  activePositions: number;
  departmentStats: DepartmentStat[];
  funnelData: FunnelDataItem[];
}

export interface FilterCriteria {
  department?: DepartmentType;
  jobId?: string;
  status?: ResumeStatusType | JobStatusType;
  education?: EducationType;
  experience?: ExperienceType;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  isHighPotential?: boolean;
}

export interface JobFormValues {
  name: string;
  department: DepartmentType;
  salaryRange: string;
  quota: number;
  status: JobStatusType;
  description: string;
  requirements: string;
}

export interface EvaluationFormValues {
  score: number;
  result: InterviewResultType;
  comment: string;
}

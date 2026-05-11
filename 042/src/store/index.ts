import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { memoize } from 'proxy-memoize';
import type { JobPosition, Resume, FilterCriteria, RecruitmentStats, DepartmentStat, FunnelDataItem, InterviewRecord, ResumeStatusType, InterviewResultType } from '@/types';
import { mockJobs, mockResumes } from '@/mock';

interface AppState {
  jobs: JobPosition[];
  resumes: Resume[];
  filterCriteria: FilterCriteria;
  loading: boolean;
  uiState: {
    submitting: boolean;
    lastUpdated: number;
  };
  
  setJobs: (jobs: JobPosition[]) => void;
  setResumes: (resumes: Resume[]) => void;
  addJob: (job: Omit<JobPosition, 'id' | 'hiredCount' | 'createdAt' | 'updatedAt'>) => void;
  updateJob: (id: string, updates: Partial<JobPosition>) => void;
  deleteJob: (id: string) => void;
  
  addResume: (resume: Omit<Resume, 'id' | 'interviews' | 'createdAt' | 'updatedAt'>) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  updateResumeStatus: (id: string, status: ResumeStatusType) => void;
  addInterview: (resumeId: string, interview: Omit<InterviewRecord, 'id' | 'resumeId' | 'createdAt'>) => void;
  updateInterview: (resumeId: string, interviewId: string, updates: Partial<InterviewRecord>) => void;
  submitInterviewEvaluation: (resumeId: string, interviewId: string, score: number, result: InterviewResultType, comment: string) => void;
  
  setFilterCriteria: (criteria: Partial<FilterCriteria>) => void;
  resetFilter: () => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  resetAllData: () => void;
  
  selectors: {
    getFilteredJobs: () => JobPosition[];
    getFilteredResumes: () => Resume[];
    getStats: () => RecruitmentStats;
    getJobFillRate: (job: JobPosition) => number;
    getTotalFillRate: () => number;
    getResumesByJobId: (jobId: string) => Resume[];
    getWarningResumes: () => Resume[];
  };
}

const generateId = (prefix: string, existing: string[]): string => {
  let id: string;
  do {
    id = `${prefix}_${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
  } while (existing.includes(id));
  return id;
};

const getTodayStr = (): string => {
  return new Date().toISOString().split('T')[0];
};

const shouldAutoUpdateStatus = (currentStatus: ResumeStatusType, result: InterviewResultType): ResumeStatusType | null => {
  if (result === '未通过') {
    return '已淘汰';
  }
  if (result === '通过' && currentStatus === '面试中') {
    return '面试中';
  }
  return null;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const selectors = {
        getFilteredJobs: memoize((): JobPosition[] => {
          const state = get();
          const { jobs, filterCriteria } = state;
          return jobs.filter(job => {
            if (filterCriteria.department && job.department !== filterCriteria.department) return false;
            if (filterCriteria.status && job.status !== filterCriteria.status) return false;
            if (filterCriteria.keyword) {
              const keyword = filterCriteria.keyword.toLowerCase();
              if (!job.name.toLowerCase().includes(keyword) && 
                  !job.description.toLowerCase().includes(keyword)) {
                return false;
              }
            }
            return true;
          });
        }),

        getFilteredResumes: memoize((): Resume[] => {
          const state = get();
          const { resumes, filterCriteria, jobs } = state;
          return resumes.filter(resume => {
            if (filterCriteria.department) {
              const job = jobs.find(j => j.id === resume.jobId);
              if (!job || job.department !== filterCriteria.department) return false;
            }
            if (filterCriteria.jobId && resume.jobId !== filterCriteria.jobId) return false;
            if (filterCriteria.status && resume.status !== filterCriteria.status) return false;
            if (filterCriteria.education && resume.education !== filterCriteria.education) return false;
            if (filterCriteria.experience && resume.experience !== filterCriteria.experience) return false;
            if (filterCriteria.isHighPotential !== undefined && resume.isHighPotential !== filterCriteria.isHighPotential) return false;
            if (filterCriteria.keyword) {
              const keyword = filterCriteria.keyword.toLowerCase();
              if (!resume.name.toLowerCase().includes(keyword) &&
                  !resume.school.toLowerCase().includes(keyword) &&
                  !resume.major.toLowerCase().includes(keyword) &&
                  !resume.skills.some(s => s.toLowerCase().includes(keyword))) {
                return false;
              }
            }
            return true;
          });
        }),

        getStats: memoize((): RecruitmentStats => {
          const state = get();
          const { jobs, resumes } = state;
          
          const totalResumes = resumes.length;
          const totalInterviews = resumes.filter(r => r.interviews.length > 0).length;
          const totalHired = resumes.filter(r => r.status === '已录用').length;
          const interviewPassRate = totalInterviews > 0 
            ? Math.round((totalHired / totalInterviews) * 100) 
            : 0;

          const activeJobs = jobs.filter(j => j.status !== '已关闭');
          const totalPositions = jobs.length;
          const totalQuota = activeJobs.reduce((sum, job) => sum + job.quota, 0);
          const totalHiredCount = activeJobs.reduce((sum, job) => sum + job.hiredCount, 0);
          const fillRate = totalQuota > 0 ? Math.round((totalHiredCount / totalQuota) * 100) : 0;

          const departments: Array<'技术研发' | '市场营销' | '职能管理' | '产品运营'> = 
            ['技术研发', '市场营销', '职能管理', '产品运营'];
          
          const departmentStats: DepartmentStat[] = departments.map(dept => {
            const deptJobs = jobs.filter(j => j.department === dept);
            const deptJobIds = deptJobs.map(j => j.id);
            const deptResumes = resumes.filter(r => deptJobIds.includes(r.jobId));
            const deptInterviews = deptResumes.filter(r => r.interviews.length > 0).length;
            const deptHired = deptResumes.filter(r => r.status === '已录用').length;
            return {
              department: dept,
              totalResumes: deptResumes.length,
              interviews: deptInterviews,
              hired: deptHired,
              passRate: deptInterviews > 0 ? Math.round((deptHired / deptInterviews) * 100) : 0
            };
          });

          const funnelSteps = [
            { name: '简历投递', filter: () => totalResumes },
            { name: '初筛通过', filter: () => resumes.filter(r => r.status !== '初筛' || r.interviews.length > 0).length },
            { name: '面试阶段', filter: () => totalInterviews },
            { name: '终面通过', filter: () => resumes.filter(r => r.status === '已录用' || (r.interviews.length > 0 && r.interviews.every(i => i.result === '通过'))).length },
            { name: '正式录用', filter: () => totalHired }
          ];

          const funnelData: FunnelDataItem[] = funnelSteps.map((step, index) => {
            const value = step.filter();
            const prevValue = index === 0 ? totalResumes : funnelSteps[index - 1].filter();
            return {
              stage: step.name,
              value,
              percentage: prevValue > 0 ? Math.round((value / prevValue) * 100) : 0
            };
          });

          return {
            totalResumes,
            totalInterviews,
            totalHired,
            interviewPassRate,
            fillRate,
            totalPositions,
            activePositions: activeJobs.length,
            departmentStats,
            funnelData
          };
        }),

        getJobFillRate: (job: JobPosition): number => {
          if (job.quota === 0) return 0;
          return Math.round((job.hiredCount / job.quota) * 100);
        },

        getTotalFillRate: (): number => {
          const { jobs } = get();
          const activeJobs = jobs.filter(j => j.status !== '已关闭');
          const totalQuota = activeJobs.reduce((sum, job) => sum + job.quota, 0);
          const totalHired = activeJobs.reduce((sum, job) => sum + job.hiredCount, 0);
          return totalQuota > 0 ? Math.round((totalHired / totalQuota) * 100) : 0;
        },

        getResumesByJobId: (jobId: string): Resume[] => {
          const { resumes } = get();
          return resumes.filter(r => r.jobId === jobId);
        },

        getWarningResumes: (): Resume[] => {
          const { resumes } = get();
          const today = new Date();
          return resumes.filter(resume => {
            if (!resume.isHighPotential) return false;
            if (resume.status !== '初筛' && resume.status !== '面试中') return false;
            const lastFollowUp = new Date(resume.lastFollowUpDate);
            const daysDiff = Math.floor((today.getTime() - lastFollowUp.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff >= 7;
          });
        }
      };

      return {
        jobs: [...mockJobs],
        resumes: [...mockResumes],
        filterCriteria: {},
        loading: false,
        uiState: {
          submitting: false,
          lastUpdated: Date.now()
        },

        setJobs: (jobs) => set({ jobs }),
        setResumes: (resumes) => set({ resumes }),

        addJob: (jobData) => {
          const state = get();
          const newJob: JobPosition = {
            ...jobData,
            id: generateId('job', state.jobs.map(j => j.id)),
            hiredCount: 0,
            createdAt: getTodayStr(),
            updatedAt: getTodayStr()
          };
          set({ 
            jobs: [...state.jobs, newJob],
            uiState: { ...state.uiState, lastUpdated: Date.now() }
          });
        },

        updateJob: (id, updates) => {
          const state = get();
          set({
            jobs: state.jobs.map(job => 
              job.id === id 
                ? { ...job, ...updates, updatedAt: getTodayStr() }
                : job
            ),
            uiState: { ...state.uiState, lastUpdated: Date.now() }
          });
        },

        deleteJob: (id) => {
          const state = get();
          set({ 
            jobs: state.jobs.filter(job => job.id !== id),
            uiState: { ...state.uiState, lastUpdated: Date.now() }
          });
        },

        addResume: (resumeData) => {
          const state = get();
          const newResume: Resume = {
            ...resumeData,
            id: generateId('resume', state.resumes.map(r => r.id)),
            interviews: [],
            createdAt: getTodayStr(),
            updatedAt: getTodayStr()
          };
          set({ 
            resumes: [...state.resumes, newResume],
            uiState: { ...state.uiState, lastUpdated: Date.now() }
          });
        },

        updateResume: (id, updates) => {
          const state = get();
          set({
            resumes: state.resumes.map(resume =>
              resume.id === id
                ? { ...resume, ...updates, updatedAt: getTodayStr() }
                : resume
            ),
            uiState: { ...state.uiState, lastUpdated: Date.now() }
          });
        },

        updateResumeStatus: (id, status) => {
          const state = get();
          const resume = state.resumes.find(r => r.id === id);
          if (!resume) return;
          
          let jobs = [...state.jobs];
          
          if (status === '已录用' && resume.status !== '已录用') {
            const jobIndex = jobs.findIndex(j => j.id === resume.jobId);
            if (jobIndex !== -1) {
              const job = jobs[jobIndex];
              if (job.hiredCount < job.quota) {
                jobs[jobIndex] = {
                  ...job,
                  hiredCount: job.hiredCount + 1,
                  updatedAt: getTodayStr()
                };
              }
            }
          }
          
          if (resume.status === '已录用' && status !== '已录用') {
            const jobIndex = jobs.findIndex(j => j.id === resume.jobId);
            if (jobIndex !== -1) {
              const job = jobs[jobIndex];
              if (job.hiredCount > 0) {
                jobs[jobIndex] = {
                  ...job,
                  hiredCount: job.hiredCount - 1,
                  updatedAt: getTodayStr()
                };
              }
            }
          }
          
          set({
            jobs,
            resumes: state.resumes.map(r =>
              r.id === id
                ? { ...r, status, updatedAt: getTodayStr() }
                : r
            ),
            uiState: { ...state.uiState, lastUpdated: Date.now() }
          });
        },

        addInterview: (resumeId, interviewData) => {
          const state = get();
          const newInterview: InterviewRecord = {
            ...interviewData,
            id: generateId('interview', []),
            resumeId,
            createdAt: getTodayStr()
          };
          set({
            resumes: state.resumes.map(resume =>
              resume.id === resumeId
                ? {
                    ...resume,
                    interviews: [...resume.interviews, newInterview],
                    lastFollowUpDate: getTodayStr(),
                    updatedAt: getTodayStr(),
                    status: resume.status === '初筛' ? '面试中' : resume.status
                  }
                : resume
            ),
            uiState: { ...state.uiState, lastUpdated: Date.now() }
          });
        },

        updateInterview: (resumeId, interviewId, updates) => {
          const state = get();
          set({
            resumes: state.resumes.map(resume =>
              resume.id === resumeId
                ? {
                    ...resume,
                    interviews: resume.interviews.map(interview =>
                      interview.id === interviewId
                        ? { ...interview, ...updates }
                        : interview
                    ),
                    updatedAt: getTodayStr()
                  }
                : resume
            ),
            uiState: { ...state.uiState, lastUpdated: Date.now() }
          });
        },

        submitInterviewEvaluation: (resumeId, interviewId, score, result, comment) => {
          const state = get();
          const resume = state.resumes.find(r => r.id === resumeId);
          if (!resume) return;
          
          const updates: Partial<InterviewRecord> = {
            score,
            result,
            comment
          };
          
          let newStatus = resume.status;
          const autoStatus = shouldAutoUpdateStatus(resume.status, result);
          if (autoStatus) {
            newStatus = autoStatus;
          }
          
          let jobs = [...state.jobs];
          
          if (result === '通过' && newStatus === '面试中') {
            const allInterviews = resume.interviews.map(i => 
              i.id === interviewId ? { ...i, ...updates } : i
            );
            const allPassed = allInterviews.length > 0 && 
              allInterviews.every(i => i.result === '通过');
            
            if (allPassed) {
              const jobIndex = jobs.findIndex(j => j.id === resume.jobId);
              if (jobIndex !== -1) {
                const job = jobs[jobIndex];
                if (job.hiredCount < job.quota && resume.status !== '已录用') {
                  newStatus = '已录用';
                  jobs[jobIndex] = {
                    ...job,
                    hiredCount: job.hiredCount + 1,
                    updatedAt: getTodayStr()
                  };
                }
              }
            }
          }
          
          set({
            jobs,
            resumes: state.resumes.map(r =>
              r.id === resumeId
                ? {
                    ...r,
                    status: newStatus,
                    interviews: r.interviews.map(interview =>
                      interview.id === interviewId
                        ? { ...interview, ...updates }
                        : interview
                    ),
                    lastFollowUpDate: getTodayStr(),
                    updatedAt: getTodayStr()
                  }
                : r
            ),
            uiState: { ...state.uiState, lastUpdated: Date.now() }
          });
        },

        setFilterCriteria: (criteria) => {
          const state = get();
          set({ filterCriteria: { ...state.filterCriteria, ...criteria } });
        },

        resetFilter: () => {
          set({ filterCriteria: {} });
        },

        setLoading: (loading) => {
          set({ loading });
        },

        setSubmitting: (submitting) => {
          const state = get();
          set({ uiState: { ...state.uiState, submitting } });
        },

        resetAllData: () => {
          set({
            jobs: [...mockJobs],
            resumes: [...mockResumes],
            filterCriteria: {},
            loading: false,
            uiState: {
              submitting: false,
              lastUpdated: Date.now()
            }
          });
        },

        selectors
      };
    },
    {
      name: 'recruitment-system-storage',
      partialize: (state) => ({
        jobs: state.jobs,
        resumes: state.resumes,
        filterCriteria: state.filterCriteria
      })
    }
  )
);

export const useStoreSelectors = () => {
  return useAppStore.getState().selectors;
};

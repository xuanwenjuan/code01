import Mock from 'mockjs';
import type { JobPosition, Resume, DepartmentType, JobStatusType, EducationType, ExperienceType, ResumeStatusType } from '@/types';

const departments: DepartmentType[] = ['技术研发', '市场营销', '职能管理', '产品运营'];
const jobStatuses: JobStatusType[] = ['招聘中', '已暂停', '已关闭'];
const educations: EducationType[] = ['博士', '硕士', '本科', '大专', '高中及以下'];
const experiences: ExperienceType[] = ['应届毕业生', '1-3年', '3-5年', '5-10年', '10年以上'];
const resumeStatuses: ResumeStatusType[] = ['初筛', '面试中', '已录用', '已淘汰'];
const schools = ['清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学', '南京大学', '武汉大学', '中山大学', '华中科技大学', '西安交通大学'];
const majors = ['计算机科学与技术', '软件工程', '电子信息工程', '市场营销', '人力资源管理', '财务管理', '工商管理', '产品设计', '新闻学', '统计学'];
const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林'];
const lastNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明'];
const skillSets = [
  ['JavaScript', 'TypeScript', 'React', 'Node.js'],
  ['Java', 'Spring Boot', 'MySQL', 'Redis'],
  ['Python', 'Django', '数据分析', '机器学习'],
  ['UI设计', 'Figma', 'Sketch', '交互设计'],
  ['市场营销', '品牌推广', 'SEO', 'SEM'],
  ['产品经理', '需求分析', '原型设计', '数据分析']
];
const interviewers = ['王经理', '李总监', '张主管', '陈HR', '刘组长'];
const locations = ['一号会议室', '二号会议室', '线上视频', '三号会议室'];

const generateRandomDate = (start: Date, end: Date): string => {
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
};

const generateJobs = (): JobPosition[] => {
  const jobTemplates: Array<{ name: string; dept: DepartmentType; salaries: string[]; desc: string; reqs: string }> = [
    { name: '高级前端工程师', dept: '技术研发', salaries: ['20-35K', '25-40K', '30-50K'], desc: '负责公司核心产品的前端架构设计与开发', reqs: '5年以上前端开发经验，精通React/Vue框架' },
    { name: 'Java后端工程师', dept: '技术研发', salaries: ['18-30K', '22-35K', '28-45K'], desc: '负责后端服务的设计与开发', reqs: '3年以上Java开发经验，熟悉Spring Boot' },
    { name: '数据分析师', dept: '技术研发', salaries: ['15-25K', '20-35K', '25-40K'], desc: '负责业务数据分析与报表开发', reqs: '熟悉SQL和Python，有数据分析经验' },
    { name: '市场营销专员', dept: '市场营销', salaries: ['8-15K', '10-18K', '12-20K'], desc: '负责市场推广和品牌建设', reqs: '市场营销相关专业，有活动策划经验' },
    { name: '品牌经理', dept: '市场营销', salaries: ['15-25K', '18-30K', '20-35K'], desc: '负责品牌战略规划和执行', reqs: '5年以上品牌管理经验' },
    { name: 'HR专员', dept: '职能管理', salaries: ['6-10K', '8-12K', '10-15K'], desc: '负责招聘、培训等人力资源工作', reqs: '人力资源相关专业，熟悉劳动法' },
    { name: '财务主管', dept: '职能管理', salaries: ['12-20K', '15-25K', '18-30K'], desc: '负责公司财务管理工作', reqs: '会计相关专业，中级会计师优先' },
    { name: '产品经理', dept: '产品运营', salaries: ['15-25K', '20-35K', '25-45K'], desc: '负责产品规划和需求管理', reqs: '3年以上产品经理经验' },
    { name: '运营专员', dept: '产品运营', salaries: ['7-12K', '9-15K', '11-18K'], desc: '负责产品运营和用户增长', reqs: '熟悉互联网产品运营，有数据敏感性' }
  ];

  const jobs: JobPosition[] = [];
  jobTemplates.forEach((template, index) => {
    const statusIndex = Math.floor(Math.random() * jobStatuses.length);
    const quota = Mock.Random.integer(2, 10);
    const hiredCount = statusIndex === 2 ? quota : Mock.Random.integer(0, quota - 1);
    
    jobs.push({
      id: `job_${String(index + 1).padStart(4, '0')}`,
      name: template.name,
      department: template.dept,
      salaryRange: template.salaries[Math.floor(Math.random() * template.salaries.length)],
      quota,
      hiredCount,
      status: jobStatuses[statusIndex],
      description: template.desc,
      requirements: template.reqs,
      createdAt: generateRandomDate(new Date('2024-01-01'), new Date('2024-06-30')),
      updatedAt: generateRandomDate(new Date('2024-07-01'), new Date())
    });
  });
  return jobs;
};

const generateResumes = (jobs: JobPosition[]): Resume[] => {
  const resumes: Resume[] = [];
  const activeJobs = jobs.filter(j => j.status !== '已关闭');
  
  for (let i = 0; i < 80; i++) {
    const job = activeJobs[Math.floor(Math.random() * activeJobs.length)];
    const status = resumeStatuses[Math.floor(Math.random() * resumeStatuses.length)];
    const isHighPotential = Math.random() > 0.7;
    const skillSet = skillSets[Math.floor(Math.random() * skillSets.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    
    const interviews = status === '面试中' || status === '已录用' || status === '已淘汰'
      ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, idx) => ({
          id: `interview_${i}_${idx}`,
          resumeId: `resume_${String(i + 1).padStart(5, '0')}`,
          round: idx + 1,
          interviewer: interviewers[Math.floor(Math.random() * interviewers.length)],
          interviewTime: generateRandomDate(new Date('2024-09-01'), new Date()),
          location: locations[Math.floor(Math.random() * locations.length)],
          score: status !== '面试中' ? Mock.Random.integer(60, 100) : undefined,
          comment: status !== '面试中' ? Mock.Random.paragraph(1, 3) : undefined,
          result: status === '已录用' ? '通过' : status === '已淘汰' ? '未通过' : '待定'
        }))
      : [];

    const lastFollowUpDays = isHighPotential && (status === '初筛' || status === '面试中')
      ? Mock.Random.integer(8, 30)
      : Mock.Random.integer(0, 7);
    const lastFollowUpDate = new Date();
    lastFollowUpDate.setDate(lastFollowUpDate.getDate() - lastFollowUpDays);

    resumes.push({
      id: `resume_${String(i + 1).padStart(5, '0')}`,
      name: `${firstName}${lastName}`,
      gender: Math.random() > 0.5 ? '男' : '女',
      age: Mock.Random.integer(22, 45),
      phone: Mock.mock(/^1[3-9]\d{9}$/),
      email: Mock.mock('@email'),
      education: educations[Math.floor(Math.random() * educations.length)],
      school: schools[Math.floor(Math.random() * schools.length)],
      major: majors[Math.floor(Math.random() * majors.length)],
      experience: experiences[Math.floor(Math.random() * experiences.length)],
      jobId: job.id,
      status,
      isHighPotential,
      lastFollowUpDate: lastFollowUpDate.toISOString().split('T')[0],
      skills: skillSet.slice(0, Math.floor(Math.random() * 3) + 2),
      workHistory: [
        `${Mock.Random.ctitle(3, 5)}公司 - ${Mock.Random.ctitle(2, 4)} (${Mock.Random.integer(1, 5)}年)`,
        `${Mock.Random.ctitle(3, 5)}公司 - ${Mock.Random.ctitle(2, 4)} (${Mock.Random.integer(1, 3)}年)`
      ],
      selfIntroduction: Mock.Random.cparagraph(2, 4),
      interviews,
      createdAt: generateRandomDate(new Date('2024-09-01'), new Date()),
      updatedAt: generateRandomDate(new Date('2024-10-01'), new Date())
    });
  }
  return resumes;
};

export const mockJobs: JobPosition[] = generateJobs();
export const mockResumes: Resume[] = generateResumes(mockJobs);

export const api = {
  getJobs: () => new Promise<JobPosition[]>(resolve => setTimeout(() => resolve([...mockJobs]), 300)),
  getResumes: () => new Promise<Resume[]>(resolve => setTimeout(() => resolve([...mockResumes]), 300)),
  getJobById: (id: string) => new Promise<JobPosition | undefined>(resolve => 
    setTimeout(() => resolve(mockJobs.find(j => j.id === id)), 200)
  ),
  getResumeById: (id: string) => new Promise<Resume | undefined>(resolve => 
    setTimeout(() => resolve(mockResumes.find(r => r.id === id)), 200)
  )
};

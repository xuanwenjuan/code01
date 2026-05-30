import Mock from 'mockjs';
import type { Department, Project, Customer, Doctor, Schedule, Appointment, Package, Order } from '@/types';

const Random = Mock.Random;

const generateDepartments = (): Department[] => {
  const names = ['皮肤美容', '微整塑形', '养生护理', '激光治疗', '口腔美容'];
  return Mock.mock({
    'list|3-5': [{
      'id|+1': 1,
      'name': names,
      'description': '@cparagraph(1, 2)',
      'status': 'active',
      'createdAt': '@datetime'
    }]
  }).list;
};

const departments = generateDepartments();

const generateProjectName = (departmentId: number): string => {
  const dept = departments.find(d => Number(d.id) === departmentId);
  if (dept?.name === '皮肤美容') {
    return ['水光针', '光子嫩肤', '果酸换肤', '热玛吉', '皮秒激光'][Random.integer(0, 4)];
  } else if (dept?.name === '微整塑形') {
    return ['玻尿酸填充', '肉毒素除皱', '线雕提升', '瘦脸针', '隆鼻'][Random.integer(0, 4)];
  } else {
    return ['SPA护理', '艾灸养生', '拔罐', '经络按摩', '面部刮痧'][Random.integer(0, 4)];
  }
};

const projects: Project[] = Mock.mock({
  'list|15-25': [{
    'id|+1': 1,
    'departmentId|+1': departments.map(d => d.id),
    'name': function() {
      return generateProjectName(Number((this as { departmentId: string }).departmentId));
    },
    'description': '@cparagraph(1, 2)',
    'price|500-10000': 1,
    'duration|30-120': 1,
    'status': '@pick(["active", "inactive"])',
    'createdAt': '@datetime'
  }]
}).list;

const customers: Customer[] = Mock.mock({
  'list|30-50': [{
    'id|+1': 1,
    'name': '@cname',
    'phone': /^1[3-9]\d{9}$/,
    'idCard': /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
    'age|20-60': 1,
    'gender': '@pick(["male", "female"])',
    'skinType': '@pick(["干性", "油性", "混合性", "敏感性", "中性"])',
    'constitution': '@pick(["平和质", "气虚质", "阳虚质", "阴虚质", "痰湿质"])',
    'medicalHistory': '@cparagraph(1, 2)',
    'contraindications': '@pick(["无", "青霉素过敏", "海鲜过敏", "妊娠期", "高血压"])',
    'createdAt': '@datetime'
  }]
}).list;

const generateDoctorSpecialty = (departmentId: number): string => {
  const dept = departments.find(d => Number(d.id) === departmentId);
  return `${dept?.name || '医疗'}专家`;
};

const doctors: Doctor[] = Mock.mock({
  'list|8-15': [{
    'id|+1': 1,
    'name': '@cname',
    'departmentId|+1': departments.map(d => d.id),
    'specialty': function() {
      return generateDoctorSpecialty(Number((this as { departmentId: string }).departmentId));
    },
    'phone': /^1[3-9]\d{9}$/,
    'status': 'active'
  }]
}).list;

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 18; hour++) {
    slots.push({
      id: Random.id(),
      startTime: `${hour}:00`,
      endTime: `${hour + 1}:00`,
      isAvailable: Random.boolean()
    });
  }
  return slots;
};

const schedules: Schedule[] = Mock.mock({
  'list|20-30': [{
    'id|+1': 1,
    'doctorId|+1': doctors.map(d => d.id),
    'date': function() {
      const date = new Date();
      date.setDate(date.getDate() + Random.integer(0, 14));
      return date.toISOString().split('T')[0];
    },
    'timeSlots': generateTimeSlots()
  }]
}).list;

const getCustomerName = (customerId: number): string => {
  return customers.find(c => Number(c.id) === customerId)?.name || '';
};

const getDoctorName = (doctorId: number): string => {
  return doctors.find(d => Number(d.id) === doctorId)?.name || '';
};

const getProjectName = (projectId: number): string => {
  return projects.find(p => Number(p.id) === projectId)?.name || '';
};

const appointments: Appointment[] = Mock.mock({
  'list|40-60': [{
    'id|+1': 1,
    'customerId|+1': customers.map(c => c.id),
    'customerName': function() {
      return getCustomerName(Number((this as { customerId: string }).customerId));
    },
    'doctorId|+1': doctors.map(d => d.id),
    'doctorName': function() {
      return getDoctorName(Number((this as { doctorId: string }).doctorId));
    },
    'projectId|+1': projects.map(p => p.id),
    'projectName': function() {
      return getProjectName(Number((this as { projectId: string }).projectId));
    },
    'date': function() {
      const date = new Date();
      date.setDate(date.getDate() + Random.integer(-7, 7));
      return date.toISOString().split('T')[0];
    },
    'timeSlot': '@pick(["09:00-10:00", "10:00-11:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"])',
    'status': '@pick(["pending", "confirmed", "completed", "cancelled"])',
    'notes': '@cparagraph(1)',
    'createdAt': '@datetime'
  }]
}).list;

const packages: Package[] = Mock.mock({
  'list|8-12': [{
    'id|+1': 1,
    'name': ['焕肤套餐', '抗衰套餐', '塑形套餐', '美白套餐', '补水套餐', '养生套餐'],
    'description': '@cparagraph(2, 3)',
    'projects|2-4': projects.map(p => p.id),
    'originalPrice|2000-20000': 1,
    'discountPrice|1500-15000': 1,
    'validityDays|30-365': 1,
    'status': '@pick(["active", "inactive"])',
    'createdAt': '@datetime'
  }]
}).list;

const getPackagePrice = (packageId: number): number => {
  return packages.find(p => Number(p.id) === packageId)?.discountPrice || 0;
};

const getPackageValidity = (packageId: number): number => {
  return packages.find(p => Number(p.id) === packageId)?.validityDays || 30;
};

const getPackageName = (packageId: number): string => {
  return packages.find(p => Number(p.id) === packageId)?.name || '';
};

const orders: Order[] = Mock.mock({
  'list|50-80': [{
    'id|+1': 1,
    'orderNo': /^ORD\d{10}$/,
    'customerId|+1': customers.map(c => c.id),
    'customerName': function() {
      return getCustomerName(Number((this as { customerId: string }).customerId));
    },
    'packageId|+1': packages.map(p => p.id),
    'packageName': function() {
      return getPackageName(Number((this as { packageId: string }).packageId));
    },
    'totalAmount': function() {
      return getPackagePrice(Number((this as { packageId: string }).packageId));
    },
    'status': '@pick(["pending", "verified", "expired"])',
    'purchaseDate': '@datetime',
    'expiryDate': function() {
      const purchaseDate = (this as { purchaseDate: string }).purchaseDate;
      const packageId = Number((this as { packageId: string }).packageId);
      const date = new Date(purchaseDate);
      date.setDate(date.getDate() + getPackageValidity(packageId));
      return date.toISOString().split('T')[0];
    },
    'verifiedDate?': function() {
      const status = (this as { status: string }).status;
      if (status === 'verified') {
        const purchaseDate = (this as { purchaseDate: string }).purchaseDate;
        const date = new Date(purchaseDate);
        date.setDate(date.getDate() + Random.integer(1, 30));
        return date.toISOString().split('T')[0];
      }
      return undefined;
    }
  }]
}).list;

const mockApi = {
  getDepartments: () => ({ code: 200, data: departments, message: 'success' }),
  getProjects: () => ({ code: 200, data: projects, message: 'success' }),
  getCustomers: () => ({ code: 200, data: customers, message: 'success' }),
  getDoctors: () => ({ code: 200, data: doctors, message: 'success' }),
  getSchedules: () => ({ code: 200, data: schedules, message: 'success' }),
  getAppointments: () => ({ code: 200, data: appointments, message: 'success' }),
  getPackages: () => ({ code: 200, data: packages, message: 'success' }),
  getOrders: () => ({ code: 200, data: orders, message: 'success' })
};

Mock.mock(/\/api\/departments/, 'get', mockApi.getDepartments);
Mock.mock(/\/api\/projects/, 'get', mockApi.getProjects);
Mock.mock(/\/api\/customers/, 'get', mockApi.getCustomers);
Mock.mock(/\/api\/doctors/, 'get', mockApi.getDoctors);
Mock.mock(/\/api\/schedules/, 'get', mockApi.getSchedules);
Mock.mock(/\/api\/appointments/, 'get', mockApi.getAppointments);
Mock.mock(/\/api\/packages/, 'get', mockApi.getPackages);
Mock.mock(/\/api\/orders/, 'get', mockApi.getOrders);

export default mockApi;

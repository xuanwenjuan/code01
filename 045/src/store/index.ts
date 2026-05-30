import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Department,
  Project,
  Customer,
  Doctor,
  Schedule,
  Appointment,
  Package,
  Order,
  AppState,
  DepartmentStatus,
  ProjectStatus,
  AppointmentStatus,
  OrderStatus
} from '@/types';

interface AppStore extends AppState {
  setDepartments: (departments: Department[]) => void;
  setProjects: (projects: Project[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setDoctors: (doctors: Doctor[]) => void;
  setSchedules: (schedules: Schedule[]) => void;
  setAppointments: (appointments: Appointment[]) => void;
  setPackages: (packages: Package[]) => void;
  setOrders: (orders: Order[]) => void;
  setCurrentModule: (module: string) => void;
  addDepartment: (department: Department) => void;
  updateDepartment: (id: string, department: Partial<Department>) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      departments: [],
      projects: [],
      customers: [],
      doctors: [],
      schedules: [],
      appointments: [],
      packages: [],
      orders: [],
      currentModule: 'projects',

      setDepartments: (departments) => set({ departments }),
      setProjects: (projects) => set({ projects }),
      setCustomers: (customers) => set({ customers }),
      setDoctors: (doctors) => set({ doctors }),
      setSchedules: (schedules) => set({ schedules }),
      setAppointments: (appointments) => set({ appointments }),
      setPackages: (packages) => set({ packages }),
      setOrders: (orders) => set({ orders }),
      setCurrentModule: (module) => set({ currentModule: module }),

      addDepartment: (department) =>
        set((state) => ({ departments: [...state.departments, department] })),
      updateDepartment: (id, department) =>
        set((state) => ({
          departments: state.departments.map((d) =>
            d.id === id ? { ...d, ...department } : d
          )
        })),

      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, project) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...project } : p
          )
        })),

      addCustomer: (customer) =>
        set((state) => ({ customers: [...state.customers, customer] })),
      updateCustomer: (id, customer) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...customer } : c
          )
        })),

      addAppointment: (appointment) =>
        set((state) => ({ appointments: [...state.appointments, appointment] })),
      updateAppointment: (id, appointment) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, ...appointment } : a
          )
        })),

      addOrder: (order) =>
        set((state) => ({ orders: [...state.orders, order] })),
      updateOrder: (id, order) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, ...order } : o
          )
        }))
    }),
    {
      name: 'medical-aesthetic-storage'
    }
  )
);

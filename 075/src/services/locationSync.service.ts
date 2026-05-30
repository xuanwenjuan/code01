
import { DepartmentStorageMapping } from '../types';

const departmentLocationMapping: DepartmentStorageMapping = {
  '研发部': '研发楼A座',
  '市场部': '市场楼B座',
  '人事部': '行政楼C座',
  '财务部': '行政楼C座',
  '行政部': '行政楼C座',
  '销售部': '销售楼D座',
  '生产部': '生产车间E区',
  '质量部': '质检楼F座',
  '采购部': '行政楼C座',
  '物流部': '物流中心G区',
  'IT部': '研发楼A座',
  '客服部': '客服中心H座'
};

export class LocationSyncService {
  private static getDefaultLocation(department: string): string {
    return departmentLocationMapping[department] || '综合仓库';
  }

  static syncLocationByDepartment(
    department?: string,
    currentLocation?: string
  ): { location: string; isChanged: boolean } {
    if (!department) {
      return {
        location: currentLocation || '综合仓库',
        isChanged: false
      };
    }

    const defaultLocation = this.getDefaultLocation(department);
    
    if (currentLocation && currentLocation !== defaultLocation) {
      return {
        location: defaultLocation,
        isChanged: true
      };
    }

    if (!currentLocation) {
      return {
        location: defaultLocation,
        isChanged: true
      };
    }

    return {
      location: currentLocation,
      isChanged: false
    };
  }

  static getLocationForDepartment(department: string): string {
    return this.getDefaultLocation(department);
  }

  static getAllDepartmentMappings(): DepartmentStorageMapping {
    return { ...departmentLocationMapping };
  }

  static addDepartmentMapping(department: string, location: string): void {
    departmentLocationMapping[department] = location;
  }

  static updateDepartmentMapping(department: string, location: string): boolean {
    if (departmentLocationMapping[department]) {
      departmentLocationMapping[department] = location;
      return true;
    }
    return false;
  }

  static removeDepartmentMapping(department: string): boolean {
    if (departmentLocationMapping[department]) {
      delete departmentLocationMapping[department];
      return true;
    }
    return false;
  }
}

export default LocationSyncService;

import dayjs from 'dayjs';

export class CodeGenerator {
  private static counters: Record<string, number> = {};

  static generate(prefix: string): string {
    const dateStr = dayjs().format('YYYYMMDD');
    const key = `${prefix}_${dateStr}`;

    if (!this.counters[key]) {
      this.counters[key] = 1;
    } else {
      this.counters[key]++;
    }

    const sequence = this.counters[key].toString().padStart(4, '0');
    return `${prefix}${dateStr}${sequence}`;
  }

  static generateEquipmentCode(): string {
    return this.generate('EQ');
  }

  static generateTaskNo(): string {
    return this.generate('IT');
  }

  static generateOrderNo(): string {
    return this.generate('WO');
  }

  static generatePlanNo(): string {
    return this.generate('IP');
  }
}

export default CodeGenerator;

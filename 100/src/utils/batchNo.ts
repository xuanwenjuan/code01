import dayjs from 'dayjs';

export function generateBatchNo(prefix: string = 'BATCH'): string {
  const timestamp = dayjs().format('YYYYMMDDHHmmss');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateOrderNo(prefix: string = 'WO'): string {
  const timestamp = dayjs().format('YYYYMMDDHHmmss');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateLedgerNo(prefix: string = 'LEDGER'): string {
  const timestamp = dayjs().format('YYYYMMDD');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

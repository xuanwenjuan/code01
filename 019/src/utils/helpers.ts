import { Material } from '../types';
import type { OperationType } from '../types';

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatDateOnly(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysRemaining(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(material: Material): 'normal' | 'warning' | 'expired' {
  const days = getDaysRemaining(material.expiryDate);
  if (days < 0) return 'expired';
  if (days <= 30) return 'warning';
  return 'normal';
}

export function getExpiryBadgeClass(material: Material): string {
  const status = getExpiryStatus(material);
  switch (status) {
    case 'expired':
      return 'badge badge-danger';
    case 'warning':
      return 'badge badge-warning';
    default:
      return 'badge badge-success';
  }
}

export function getExpiryText(material: Material): string {
  const days = getDaysRemaining(material.expiryDate);
  if (days < 0) return `已过期 ${Math.abs(days)} 天`;
  if (days === 0) return '今天到期';
  return `剩余 ${days} 天`;
}

export function getOperationTypeColor(type: OperationType): string {
  switch (type) {
    case '入库':
      return 'badge badge-success';
    case '领用':
      return 'badge badge-info';
    case '临期丢弃':
      return 'badge badge-danger';
    case '添加':
      return 'badge badge-success';
    case '编辑':
      return 'badge badge-warning';
    case '删除':
      return 'badge badge-danger';
    case '纯度调整':
      return 'badge badge-info';
    default:
      return 'badge';
  }
}

export function validateNumber(value: string, min: number = 0, max?: number): string | null {
  const num = parseFloat(value);
  if (isNaN(num)) return '请输入有效的数字';
  if (num < min) return `数值不能小于 ${min}`;
  if (max !== undefined && num > max) return `数值不能大于 ${max}`;
  return null;
}

export function validateRequired(value: string): string | null {
  if (!value || value.trim() === '') return '此项为必填';
  return null;
}

export function validatePurity(value: string): string | null {
  const num = parseFloat(value);
  if (isNaN(num)) return '请输入有效的纯度值';
  if (num < 0 || num > 100) return '纯度应在 0-100 之间';
  return null;
}

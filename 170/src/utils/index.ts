export const formatPrice = (price: number): string => {
  return `¥${price.toFixed(0)}`;
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const generateOrderId = (): string => {
  const now = new Date();
  const timestamp = now.getTime().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
};

export const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6 && password.length <= 20;
};

export const validateIdCard = (idCard: string): boolean => {
  return /(^\d{15}$)|(^\d{17}(\d|X|x)$)/.test(idCard);
};

export const validateName = (name: string): boolean => {
  return /^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/.test(name);
};

export const validateAddress = (address: string): boolean => {
  return address.length >= 5 && address.length <= 200;
};

export const validateDetailAddress = (detail: string): boolean => {
  return detail.length >= 5 && detail.length <= 100;
};

export const validateDistrict = (district: string): boolean => {
  return /^[\u4e00-\u9fa5]{2,20}$/.test(district);
};

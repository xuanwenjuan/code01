import moment from 'moment';

let counter = 0;

export const generateOrderNo = (prefix = 'ORD'): string => {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  counter = (counter + 1) % 1000;
  const sequence = counter.toString().padStart(3, '0');
  return `${prefix}${timestamp}${sequence}`;
};

export const generatePaymentNo = (): string => {
  return generateOrderNo('PAY');
};

export const generateCustomerNo = (): string => {
  return generateOrderNo('CUS');
};

export const generateEquipmentNo = (): string => {
  return generateOrderNo('EQU');
};

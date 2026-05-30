export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

export const maskIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 8) return idCard;
  if (idCard.length === 18) {
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
  }
  return idCard.replace(/(\d{6})\d{6}(\d{3})/, '$1******$2');
};

export const maskName = (name: string): string => {
  if (!name || name.length <= 1) return name;
  if (name.length === 2) {
    return `${name[0]}*`;
  }
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
};

export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  const [username, domain] = email.split('@');
  if (username.length <= 3) {
    return `${'*'.repeat(username.length)}@${domain}`;
  }
  return `${username.slice(0, 3)}${'*'.repeat(username.length - 3)}@${domain}`;
};

export const maskBankCard = (cardNo: string): string => {
  if (!cardNo || cardNo.length < 16) return cardNo;
  const last4 = cardNo.slice(-4);
  return `**** **** **** ${last4}`;
};

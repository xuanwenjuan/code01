export const validateUsername = (_, value) => {
  if (!value) {
    return Promise.reject('请输入用户名');
  }
  if (value.length < 3) {
    return Promise.reject('用户名长度不能少于3位');
  }
  if (value.length > 20) {
    return Promise.reject('用户名长度不能超过20位');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    return Promise.reject('用户名只能包含字母、数字和下划线');
  }
  return Promise.resolve();
};

export const validatePassword = (_, value) => {
  if (!value) {
    return Promise.reject('请输入密码');
  }
  if (value.length < 6) {
    return Promise.reject('密码长度不能少于6位');
  }
  if (value.length > 20) {
    return Promise.reject('密码长度不能超过20位');
  }
  return Promise.resolve();
};

export const validateRequired = (message = '此项为必填项') => (_, value) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return Promise.reject(message);
  }
  return Promise.resolve();
};

export const validateEmail = (_, value) => {
  if (!value) {
    return Promise.resolve();
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return Promise.reject('请输入有效的邮箱地址');
  }
  return Promise.resolve();
};

export const validatePhone = (_, value) => {
  if (!value) {
    return Promise.resolve();
  }
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(value)) {
    return Promise.reject('请输入有效的手机号码');
  }
  return Promise.resolve();
};

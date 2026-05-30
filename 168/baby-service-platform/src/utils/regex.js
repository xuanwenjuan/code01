export const regexPatterns = {
  phone: /^1[3-9]\d{9}$/,
  password: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/,
  idCard: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  name: /^[\u4e00-\u9fa5]{2,10}$/,
  price: /^\d+(\.\d{1,2})?$/
}

export const validatePhone = (phone) => regexPatterns.phone.test(phone)
export const validatePassword = (password) => regexPatterns.password.test(password)
export const validateIdCard = (idCard) => regexPatterns.idCard.test(idCard)
export const validateEmail = (email) => regexPatterns.email.test(email)
export const validateName = (name) => regexPatterns.name.test(name)

export const formRules = {
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: regexPatterns.phone, message: '请输入正确的手机号' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 20, message: '密码长度6-20位' },
    { pattern: regexPatterns.password, message: '密码需包含字母和数字' }
  ],
  confirmPassword: (getFieldValue) => [
    { required: true, message: '请确认密码' },
    {
      validator: (_, value) => {
        if (!value || getFieldValue('password') === value) {
          return Promise.resolve()
        }
        return Promise.reject(new Error('两次密码输入不一致'))
      }
    }
  ],
  name: [
    { required: true, message: '请输入姓名' },
    { pattern: regexPatterns.name, message: '请输入2-10个中文姓名' }
  ],
  required: (message = '请填写该项') => [
    { required: true, message }
  ]
}

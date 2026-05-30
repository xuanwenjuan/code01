import { Form, FormInstance } from 'antd'
import type { FormProps } from 'antd'

interface CommonFormProps<T = any> extends Omit<FormProps<T>> {
  form: FormInstance<T>
  children: React.ReactNode
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelCol?: { span: number }
  wrapperCol?: { span: number }
}

const CommonForm = <T extends Record<string, any>>({
  form,
  children,
  layout = 'vertical',
  labelCol = { span: 6 },
  wrapperCol = { span: 18 },
  ...rest
}: CommonFormProps<T>) => {
  return (
    <Form
      form={form}
      layout={layout}
      labelCol={layout === 'horizontal' ? labelCol : undefined}
      wrapperCol={layout === 'horizontal' ? wrapperCol : undefined}
      {...rest}
    >
      {children}
    </Form>
  )
}

export default CommonForm

import { Modal, Form, type FormProps, type FormInstance } from 'antd';
import type { ModalProps } from 'antd/es/modal/interface';

interface ModalFormProps<T = Record<string, unknown>> extends Omit<ModalProps, 'onOk'> {
  title: string;
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: T) => void;
  initialValues?: Partial<T>;
  children: React.ReactNode;
  formProps?: Omit<FormProps<T>, 'form' | 'initialValues' | 'onFinish'>;
  form?: FormInstance<T>;
  width?: number | string;
}

const ModalForm = <T extends Record<string, unknown> = Record<string, unknown>>({
  title,
  open,
  onCancel,
  onSubmit,
  initialValues,
  children,
  formProps,
  form: externalForm,
  width = 600,
  ...modalProps
}: ModalFormProps<T>) => {
  const [internalForm] = Form.useForm<T>();
  const form = externalForm || internalForm;

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={width}
      destroyOnClose
      {...modalProps}
    >
      <Form<T>
        form={form}
        layout="vertical"
        initialValues={initialValues}
        {...formProps}
      >
        {children}
      </Form>
    </Modal>
  );
};

export default ModalForm;

import React from 'react';

interface FormItemProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

const FormItem: React.FC<FormItemProps> = ({ label, required, error, children }) => {
  return (
    <div className="form-item">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="form-control">{children}</div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default FormItem;
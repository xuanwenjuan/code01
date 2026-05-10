import React from 'react';

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

const Textarea: React.FC<TextareaProps> = ({ value, onChange, placeholder, className = '', rows = 3 }) => {
  return (
    <textarea
      className={`textarea ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
};

export default Textarea;
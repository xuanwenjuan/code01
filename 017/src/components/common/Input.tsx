import React from 'react';

interface InputProps {
  type?: 'text' | 'number' | 'password';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
}

const Input: React.FC<InputProps> = ({ type = 'text', value, onChange, placeholder, className = '', min, max }) => {
  return (
    <input
      type={type}
      className={`input ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
    />
  );
};

export default Input;
import React from 'react'

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
}

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  error, 
  children, 
  required 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input: React.FC<InputProps> = ({ error, className = '', ...props }) => {
  return (
    <input
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        error ? 'border-red-500' : 'border-gray-300'
      } ${className}`}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select: React.FC<SelectProps> = ({ error, className = '', ...props }) => {
  return (
    <select
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        error ? 'border-red-500' : 'border-gray-300'
      } ${className}`}
      {...props}
    />
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const TextArea: React.FC<TextAreaProps> = ({ error, className = '', ...props }) => {
  return (
    <textarea
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        error ? 'border-red-500' : 'border-gray-300'
      } ${className}`}
      {...props}
    />
  )
}

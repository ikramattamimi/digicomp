import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = ({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  className = '',
  size = 'md',
  leftIcon,
  rightIcon,
  onRightIconClick,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  const baseClasses = `
    w-full border rounded-md shadow-sm transition-colors duration-200 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400
  `;

  const errorClasses = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 dark:border-gray-600';

  const paddingClasses = (() => {
    const baseSize = sizeClasses[size];
    if (leftIcon && rightIcon) {
      return baseSize.replace('px-3', 'pl-10 pr-10').replace('px-4', 'pl-12 pr-12');
    }
    if (leftIcon) {
      return baseSize.replace('px-3', 'pl-10 pr-3').replace('px-4', 'pl-12 pr-4');
    }
    if (rightIcon || error) {
      return baseSize.replace('px-3', 'pl-3 pr-10').replace('px-4', 'pl-4 pr-12');
    }
    return baseSize;
  })();

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${baseClasses} ${errorClasses} ${paddingClasses} ${className}`}
          {...props}
        />

        {(rightIcon || error) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : rightIcon ? (
              <button
                type="button"
                onClick={onRightIconClick}
                className="text-gray-400 hover:text-gray-600"
              >
                {rightIcon}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
import React, { InputHTMLAttributes, useState } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  name,
  error,
  className,
  type,
  ...rest
}) => {
  const hasError = !!error;
  const [isShowPassword, setIsShowPassword] = useState(false);

  return (
    <div className={`input-field ${hasError ? 'error' : null}`}>
      <div className="input-wrap">
        <input
          id={id}
          name={name}
          type={
            type === 'password' ? (isShowPassword ? 'text' : 'password') : type
          }
          placeholder={label}
          className={`input ${hasError ? 'error' : null} ${className}`}
          {...rest}
        />
        <label className={`label ${hasError ? 'error' : null}`} htmlFor={id}>
          {label}
        </label>
        {type === 'password' && (
          <i
            className={`input-icon icon ${
              isShowPassword ? 'icon-show' : 'icon-hide'
            }`}
            onClick={() => setIsShowPassword(!isShowPassword)}
          ></i>
        )}
      </div>
      <p className="error-message">{error}</p>
    </div>
  );
};
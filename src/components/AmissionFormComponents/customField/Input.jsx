import React from "react";

export default function Input({
  name,
  label,
  value,
  type = "text",
  placeholder,
  min,
  max,
  required = false,
  disabled = false,

  error,
  helperText,

  onChange,
  onBlur,
  onFocus,
  onKeyDown,

  className = "",
  inputClassName = "",
}) {
  const isInvalid = Boolean(error);

  // ?? Prevent React controlled/uncontrolled errors
  const safeValue =
    value === null || value === undefined ? "" : value;

  

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={safeValue}
        placeholder={placeholder}
        min={min}
        max={max}
        disabled={disabled}
        aria-invalid={isInvalid}
        aria-required={required}
        className={`form-control ${isInvalid ? "is-invalid" : ""} ${inputClassName}`}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      />

      {isInvalid && (
        <div className="invalid-feedback">{error}</div>
      )}

      {!isInvalid && helperText && (
        <small className="form-text text-muted">
          {helperText}
        </small>
      )}
    </div>
  );
}

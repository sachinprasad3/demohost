import React from "react";

const RhfInput = React.forwardRef(function RhfInput(
  {
    name,
    label,
    type = "text",
    placeholder,
    min,
    max,
    required = false,
    disabled = false,
    isLoading = false, 
    suffix,
    error,
    helperText,

    className = "",
    inputClassName = "",
    ...rest // 👈 register() props
  },
  ref
) {
  const isInvalid = Boolean(error);

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
  <div className="position-relative">
      <input
        ref={ref}              // ✅ RHF ref
        id={name}
        name={name}            // ✅ required for RHF
        type={type}
        placeholder={placeholder}
        min={min}
        max={max}
        disabled={disabled}
        aria-invalid={isInvalid}
        aria-required={required}
        className={`form-control ${isInvalid ? "is-invalid" : ""} ${inputClassName} ${suffix ? "pe-5" : ""}`}
        {...rest}              // ✅ register props (onChange, onBlur, etc.)
      />
      {isLoading && !suffix && (
          <div
            className="position-absolute"
            style={{
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)"
            }}
          >
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            />
          </div>
        )}

        {/* Suffix Button */}
        {suffix && (
          <div
            className="position-absolute"
            style={{
              right: "6px",
              top: "50%",
              transform: "translateY(-50%)"
            }}
          >
            {suffix}
          </div>
        )}
      {isInvalid && (
        <div className="invalid-feedback">{error}</div>
      )}
</div>

      {!isInvalid && helperText && (
        <small className="form-text text-muted">
          {helperText}
        </small>
      )}
    </div>
  );
});

export default RhfInput;

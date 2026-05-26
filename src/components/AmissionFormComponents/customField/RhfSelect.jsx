import React from "react";

const RhfSelect = React.forwardRef(function RhfSelect(
  {
    name,
    label,
    options = [],
    placeholder = "Select",
    required = false,
    disabled = false,
    className = "",
    error,
    mappingField,
    ...rest
  },
  ref
) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={name}
        name={name}
        disabled={disabled}
        className={`form-control ${error ? "is-invalid" : ""} ${className}`}
        {...rest}
      >
        <option value="">{placeholder}</option>

        {options.map((opt) => (
          <option
            key={opt.value ?? opt[mappingField?.id]}
            value={opt.value ?? opt[mappingField?.id]}
          >
            {opt.label ?? opt[mappingField?.name]}
          </option>
        ))}
      </select>

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
});

export default RhfSelect;

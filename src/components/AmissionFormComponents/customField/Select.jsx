export default function Select({
  label,
  options = [],
  placeholder = "Select",
  required = false,
  disabled = false,
  className = "",
  error,
  mappingField,
  ...rest
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      <select
      {...rest}
        disabled={disabled}
        className={`form-control ${error ? "is-invalid" : ""} ${className}`}
      >
        <option value="" disabled>{placeholder}</option>

        {options.map((opt) => (
          <option key={opt.value || opt[mappingField?.id]} value={opt.value || opt[mappingField?.id]}>
            {opt.label || opt[mappingField?.name]}
          </option>
        ))}
      </select>

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

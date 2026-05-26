export function RadioButton({
  name,
  label,
  required = false,
  options = [],
  value,
  error,
  onChange,
}) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>

      <div className="d-flex">
        {options.map((opt) => (
          <label className="me-3" key={opt.value}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={String(value) === String(opt.value)}
              onChange={(e) => onChange(e)}
              className={`me-1 ${error ? "is-invalid" : ""}`}
            />
            {opt.label}
          </label>
        ))}
      </div>

      {error && (
        <div className="invalid-feedback d-block">{error}</div>
      )}
    </div>
  );
}

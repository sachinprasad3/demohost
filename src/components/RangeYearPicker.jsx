import { forwardRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RangeYearPickerSelectsRange = ({
  className,
  value,
  onChange,
  ...rest
}) => {
  // Parse initial value if coming from form (like "2026-2027")
  const [startDate, setStartDate] = useState(
    value ? new Date(`${value.split("-")[0]}/01/01`) : null,
  );
  const [endDate, setEndDate] = useState(
    value ? new Date(`${value.split("-")[1]}/01/01`) : null,
  );

  const handleChange = ([newStartDate, newEndDate]) => {
    if (rest?.disabled) return;
    setStartDate(newStartDate);
    setEndDate(newEndDate);

    if (newStartDate && newEndDate) {
      const yearValue = `${newStartDate.getFullYear()}-${newEndDate.getFullYear()}`;
      onChange(yearValue);
    }
  };

  return (
    <DatePicker
      className={`form-control ${className}`}
      {...rest}
      selected={startDate}
      onChange={handleChange}
      selectsRange
      startDate={startDate}
      endDate={endDate}
      dateFormat="yyyy"
      showYearPicker
    />
  );
};

/* ================= CUSTOM INPUT ================= */

const AcademicYearInput = forwardRef(
  ({ academicYear, onClick, placeholder, disabled }, ref) => {
    return (
      <input
        ref={ref}
        className="form-control"
        onClick={onClick}
        value={academicYear || ""}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
      />
    );
  },
);

/* ================= COMPONENT ================= */

export const SelectAcademicYear = ({ className, value, onChange, ...rest }) => {
  const [startDate, setStartDate] = useState(
    value ? new Date(`${value.split("-")[0]}-04-01`) : null,
  );

  const handleChange = (date) => {
    if (rest?.disabled) return;

    setStartDate(date);

    if (date) {
      const startYear = date.getFullYear();
      const academicYear = `${startYear}-${startYear + 1}`;
      onChange(academicYear);
    }
  };

  return (
    <DatePicker
      {...rest}
      selected={startDate}
      showYearPicker
      dateFormat="yyyy"
      onChange={handleChange}
      className={`form-control  ${className}`}
      customInput={
        <AcademicYearInput
          academicYear={value}
          placeholder="YYYY-YYYY"
          disabled={rest.disabled}
        />
      }
    />
  );
};

export default RangeYearPickerSelectsRange;

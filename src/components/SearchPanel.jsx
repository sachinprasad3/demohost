// components/SearchPanel.jsx
import React from "react";
import { X, Search, RotateCcw } from "lucide-react";

export default function SearchPanel(props) {
  const { type = "advanced" } = props;

  return (
    <div className="formbox searchsec">
      <ul>
        {type === "advanced" ? (
          <AdvancedSearch {...props} />
        ) : (
          <SimpleSearch {...props} />
        )}
      </ul>
    </div>
  );
}

function AdvancedSearch({
  activeTab,
  searchText,
  admittedSearchText,
  setSearchText,
  setAdmittedSearchText,
  filters,
  admittedFilters,
  handleFilterChange,
  handleAdmittedFilterChange,
  availableClasses,
  sortBy,
  admittedSortBy,
  handleSortChange,
  handleAdmittedSortChange,
  sortDir,
  admittedSortDir,
  setSortDir,
  setAdmittedSortDir,
  clearFilters,
  academicYearList = [], // Added: fetched from Students.js
}) {
  const non = activeTab === "nonAdmitted";

  // Check if a year is selected for the current active tab
  const isYearSelected = non ? filters.admissionYear : admittedFilters.academicYear;

  return (
    <>
      <li>
        <div className="form-group">
          <label className="form-label">Search by Name/Phone</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or phone..."
            value={non ? searchText : admittedSearchText}
            onChange={(e) =>
              non
                ? setSearchText(e.target.value)
                : setAdmittedSearchText(e.target.value)
            }
          />
        </div>
      </li>

      <li>
        <div className="form-group">
          <label className="form-label">
            {non ? "Admission Year" : "Academic Year"}
          </label>
          <select
            className="form-control"
            value={non ? filters.admissionYear : admittedFilters.academicYear}
            onChange={(e) =>
              non
                ? handleFilterChange("admissionYear", e.target.value)
                : handleAdmittedFilterChange("academicYear", e.target.value)
            }
          >
            <option value="ALL">All Years</option>
            {academicYearList.map((y) => (
              <option key={y.academicYear} value={y.academicYear}>
                {y.academicYear}
              </option>
            ))}
          </select>
        </div>
      </li>

      <li>
        <div className="form-group">
          <label className="form-label">Class</label>
          <select
            className="form-control"
            value={non ? filters.className : admittedFilters.className}
            disabled={!isYearSelected}
            onChange={(e) =>
              non
                ? handleFilterChange("className", e.target.value)
                : handleAdmittedFilterChange("className", e.target.value)
            }
          >
            <option value="">
              {isYearSelected ? "All Classes" : "Select Year First"}
            </option>
            {availableClasses.map((cls) => (
              <option key={cls.classId} value={cls.className}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>
      </li>


      <li>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-control"
            value={non ? filters.admissionStatus : admittedFilters.status}
            onChange={(e) =>
              non
                ? handleFilterChange("admissionStatus", e.target.value)
                : handleAdmittedFilterChange("status", e.target.value)
            }
          >
            <option value="">All Status</option>
            {(non
              ? [
                  "ENQUIRY",
                  "FORM_REQUEST",
                  "REGISTERED",
                  "FEE_PAID",
                  "PENDING",
                  "ADMITTED",
                  "REJECTED",
                  "INVOICE_GENERATED",
                  "APPLICATION_APPROVED",
                ]
              : [
                  "ACTIVE",
                  "INACTIVE",
                  "UPGRADED",
                  "SHIFTED",
                  "WITHDRAWN",
                  "PASSED_OUT",
                ]
            ).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </li>
      <li>
        <div className="form-group">
          <label className="form-label">Sort By</label>
          <select
            className="form-control"
            value={non ? sortBy : admittedSortBy}
            onChange={(e) =>
              non
                ? handleSortChange(e.target.value)
                : handleAdmittedSortChange(e.target.value)
            }
          >
            {(non
              ? [
                  ["studentFirstName", "Name"],
                  ["admissionYear", "Admission Year"],
                  ["appliedOn", "Applied On"],
                ]
              : [
                  ["joiningDate", "Joining Date"],
                  ["enrollmentDate", "Enrollment Date"],
                  ["appliedOn", "Applied On"],
                  ["firstName", "First Name"],
                  ["lastName", "Last Name"],
                  ["registrationNo", "Registration No"],
                  ["className", "Class"],
                  ["academicYear", "Academic Year"],
                  ["phonePrimary", "Phone"],
                ]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </li>

      <li>
        <div className="form-group">
          <label className="form-label">Order</label>
          <select
            className="form-control"
            value={non ? sortDir : admittedSortDir}
            onChange={(e) =>
              non ? setSortDir(e.target.value) : setAdmittedSortDir(e.target.value)
            }
          >
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </select>
        </div>
      </li>
      <li>
        <div className="form-group">
          <button
            className="searchbtn btn btn-primary"
            type="button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </li>
    </>
  );
}

function SimpleSearch({
  inputValue,
  setInputValue,
  handleKeyDown,
  handleSearch,
  handleClearSearch,
  classList,
  academicYear,
  setAcademicYear,
  academicYearList = [],
  handleClassSelect,
  selectedClass, // New prop
}) {
  return (
    <>
      <li>
        <div className="form-group">
          <label>Search by Name/Phone</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Name or Phone..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </li>

      <li>
        <div className="form-group">
          <label>By Year</label>
          <select
            className="form-control"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="ALL">All Years</option>
            {academicYearList.map((y) => (
              <option key={y.academicYear} value={y.academicYear}>
                {y.academicYear}
              </option>
            ))}
          </select>
        </div>
      </li>

      <li>
        <div className="form-group">
          <label>By Class</label>
          <select
            className="form-control"
            disabled={!academicYear}
            value={selectedClass} // Tracks the dropdown state only
            onChange={handleClassSelect}
          >
            <option value="">
              {academicYear ? "Filter by Class" : "Select Year First"}
            </option>
            {classList.map((cls) => (
              <option key={cls.classId} value={cls.classId}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>
      </li>

      <li className="d-flex">
        <button
          className="searchbtn btn btn-primary me-2"
          type="button"
          onClick={handleSearch}
        >
          <Search size={16} /> <span>Search</span>
        </button>
        <button
          className="searchbtn btn btn-primary"
          type="button"
          onClick={handleClearSearch}
        >
          <RotateCcw size={16} /> <span>Reset</span>
        </button>
      </li>
    </>
  );
}

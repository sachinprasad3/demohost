import React, { useState, useEffect } from "react";
import useAcademicYears from "../../hooks/useAcademicYears";
import { getCurrentAcademicYear } from "../../utils";

const MONTHS = [
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
];

export default function MonthlySyllabus() {
  const { academicYears } = useAcademicYears();

  const [academicYear, setAcademicYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [className, setClassName] = useState("");

  useEffect(() => {
    setAcademicYear(getCurrentAcademicYear());
  }, []);

  // Dummy syllabus data (Replace with API later)
  const syllabusData = [
    {
      subject: "English",
      topics: ["Alphabets A-Z", "3 Letter Words", "Phonics Sounds"],
    },
    {
      subject: "Maths",
      topics: ["Numbers 1-50", "Shapes", "Counting Objects"],
    },
    {
      subject: "EVS",
      topics: ["My Family", "Fruits & Vegetables", "Good Habits"],
    },
  ];

  return (
    <div className="mainpro">
      <div className="container">
        <div className="whitebox">

          {/* Header */}
          <div className="heading">
            <h3>Monthly Syllabus</h3>
          </div>

          {/* Filters */}
          <div className="filtersec" style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            
            <div>
              <label>Academic Year</label>
             <select
  value={academicYear}
  onChange={(e) => setAcademicYear(e.target.value)}
>
  {academicYears?.map((yearObj) => (
    <option
      key={yearObj.academicYear}
      value={yearObj.academicYear}
    >
      {yearObj.academicYear}
    </option>
  ))}
</select>

            </div>

            <div>
              <label>Class</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              >
                <option value="">Select Class</option>
                <option value="Nursery">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
              </select>
            </div>

            <div>
              <label>Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Display Section */}
          <div style={{ marginTop: "20px" }}>
            {syllabusData.map((item, index) => (
              <div
                key={index}
                className="listbox"
                style={{
                  marginBottom: "15px",
                  padding: "15px",
                  borderRadius: "10px",
                }}
              >
                <h4>{item.subject}</h4>
                <ul style={{ paddingLeft: "20px" }}>
                  {item.topics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

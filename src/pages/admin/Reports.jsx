// src/pages/Reports.jsx

import React, { useState } from "react";
export default function ReportPage() {
  const [filters, setFilters] = useState({
    class: "",
    month: "",
    from: "",
    to: "",
    search: "",
    type: "fees"
  });

  const data = [
    {
      id: 1,
      student: "Aarav Kumar",
      class: "Nursery",
      amount: 1500,
      mode: "Cash",
      date: "2025-01-05",
      status: "Paid",
      attendance: "92%"
    },
  ];

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    
       <div className="mainpro">
      <div className="container">
      
      <h2>School Reports</h2>

      {/* FILTERS */}
      <div className="filter-box">
        <input name="search" placeholder="Search student..." value={filters.search} onChange={handleChange} />

        <select name="class" value={filters.class} onChange={handleChange}>
          <option value="">All Classes</option>
          <option value="Nursery">Nursery</option>
          <option value="LKG">LKG</option>
          <option value="UKG">UKG</option>
        </select>

        <select name="month" value={filters.month} onChange={handleChange}>
          <option value="">Select Month</option>
          <option>January</option>
          <option>February</option>
          <option>March</option>
        </select>

        <input type="date" name="from" value={filters.from} onChange={handleChange} />
        <input type="date" name="to" value={filters.to} onChange={handleChange} />

        <select name="type" value={filters.type} onChange={handleChange}>
          <option value="fees">Fee Report</option>
          <option value="attendance">Attendance Report</option>
          <option value="transport">Transport Report</option>
          <option value="all">Complete Student Report</option>
        </select>

        <button className="btn-primary">Apply</button>
        <button className="btn-light" onClick={() => setFilters({ class:"", month:"", search:"", from:"", to:"", type:"fees" })}>Reset</button>
      </div>

      {/* SUMMARY BOXES */}
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Students</h3>
          <p>120</p>
        </div>
        <div className="summary-card">
          <h3>Fees Collected</h3>
          <p>₹ 98,500</p>
        </div>
        <div className="summary-card">
          <h3>Pending Fees</h3>
          <p>₹ 12,300</p>
        </div>
        <div className="summary-card">
          <h3>Transport Collection</h3>
          <p>₹ 18,000</p>
        </div>
      </div>

      {/* REPORT TABLE */}
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Date</th>
              <th>Status</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id}>
                <td>{d.student}</td>
                <td>{d.class}</td>
                <td>₹{d.amount}</td>
                <td>{d.mode}</td>
                <td>{d.date}</td>
                <td>{d.status}</td>
                <td>{d.attendance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EXPORT BUTTONS */}
      <div className="export-row">
        <button className="btn-primary">Export CSV</button>
        <button className="btn-secondary">Export PDF</button>
        <button className="btn-light">Print</button>
      </div>
</div>
    </div>
  );
}

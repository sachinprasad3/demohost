import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function StudentPaymentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentPaymentList();
  }, []);

  const fetchStudentPaymentList = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payments/student-list`);
      const json = await res.json(); 
      if (Array.isArray(json)) {
        setStudents(json);
      } else {
        console.error("Invalid backend response", json);
        setStudents([]);
      }
    } catch (e) {
      console.error("Error loading data:", e);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h3 style={{ textAlign: "center" }}>⏳ Loading...</h3>;

  return (
    <div className="container">
      <h2 style={{ marginBottom: "20px" }}>Student Payment Details</h2>

      {students.length === 0 && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          No student payment records found.
        </p>
      )}

      {students.map((stu) => (
        <div key={stu.id} className="student-box">

          <h3>
            {stu.firstName} {stu.surname}
          </h3>

          <p>
            <strong>Admission No:</strong> {stu.admissionNumber} <br />
            <strong>Class:</strong> {stu.className} <br />
            <strong>Mobile:</strong> {stu.mobile}
          </p>

          <h4 style={{ marginTop: "15px" }}>Payment Details</h4>

          {!stu.payments || stu.payments.length === 0 ? (
            <p style={{ color: "red" }}>No payments found.</p>
          ) : (
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Mode</th>
                </tr>
              </thead>

              <tbody>
                {stu.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.monthName}</td>
                    <td>₹{p.totalAmount || 0}</td>
                    <td>₹{p.paidAmount || 0}</td>
                    <td>₹{p.remainingAmount || 0}</td>

                    <td
                      style={{
                        color:
                          p.paymentStatus === "Paid"
                            ? "green"
                            : p.paymentStatus === "Unpaid"
                            ? "red"
                            : "orange",
                      }}
                    >
                      {p.paymentStatus}
                    </td>

                    <td>{p.paymentDate || "-"}</td>
                    <td>{p.paymentMode || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <hr />
        </div>
      ))}
    </div>
  );
}

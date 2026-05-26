import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";

export default function AdmissionFormView({ student }) {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Get Student ID from props OR localStorage
  const studentId =
    student?.id ||
    JSON.parse(localStorage.getItem("student"))?.id ||
    JSON.parse(localStorage.getItem("user"))?.id ||
    null;

  // 🚨 If still no ID found
  useEffect(() => {
    if (!studentId) {
      setError("Student ID not found. Please login again.");
      setLoading(false);
    }
  }, [studentId]);

  // ✅ Fetch student info
  useEffect(() => {
    if (!studentId) return;

    const fetchForm = async () => {
      try {
        const res = await fetch(`${API_URL}/api/students/${studentId}`);

        if (!res.ok) {
          throw new Error("No admission form found for this student");
        }

        const data = await res.json();
        setFormData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [studentId]);

  // -------- UI ---------

  if (loading) return <p>Loading form...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!formData) return <p>No form submitted yet.</p>;

  return (
    <div className="mainpro">
      <div className="container">
      <h4>Admission Form Details</h4>

      <p><strong>Admission No:</strong> {formData.admissionNumber}</p>
      <p><strong>Date of Admission:</strong> {formData.admissionDate}</p>
      <p><strong>Date of Birth:</strong> {formData.dob}</p>
      <p><strong>Gender:</strong> {formData.gender}</p>
      <p><strong>Blood Group:</strong> {formData.bloodGroup}</p>

      <h5 className="mt-3">Parents Info</h5>
      <p><strong>Father Name:</strong> {formData.fatherName}</p>
      <p><strong>Mother Name:</strong> {formData.motherName}</p>

      <h5 className="mt-3">Contact</h5>
      <p><strong>Mobile:</strong> {formData.mobile}</p>
      <p><strong>Email:</strong> {formData.email}</p>

      <p><strong>Address:</strong> {formData.address}</p>
    </div>
    </div>
  );
}

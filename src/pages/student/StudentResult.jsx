import React, { useEffect, useState } from "react";
import { useStudent } from "../../context/StudentContext";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../utills/axiosInstance";
import { extractStudentDetails } from "../../utills/constants";
import useClassSection from "../../hooks/useClassSection";

/* ---------- helpers ---------- */
const gradeEmoji = (grade) => {
  switch (grade) {
    case "A": return "";
    case "B": return "";
    case "C": return "";
    default:  return "";
  }
};

export default function StudentResultPage() {
  const { activeStudent } = useStudent();
  const { getClassNameById } = useClassSection();
  const [searchParams] = useSearchParams();

  /* ✅ CORRECT studentId source */
  const studentId =
    searchParams.get("studentId") ||
    activeStudent?.studentId ||
    null;

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);

  /* ---------- fetch student profile ---------- */
  useEffect(() => {
    if (!studentId) return;

    const fetchStudent = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/students/data?studentId=${studentId}`
        );

        if (!res?.data || Object.keys(res.data).length === 0) {
          setStudent(null);
          return;
        }

        const extracted = extractStudentDetails(res.data);
        setStudent(extracted);
      } catch (err) {
        console.error("Failed to load student", err);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  /* ---------- DEMO RESULT (STATIC) ---------- */
  const resultData = {
    academicYear: "2025–26",
    term: "Final",
    resultStatus: "PASS",
    promotedTo: "UKG",
    remarks:
      "The student shows excellent curiosity and positive classroom behavior.",
    subjects: [
      { subjectName: "English", grade: "A" },
      { subjectName: "Mathematics", grade: "B" },
      { subjectName: "EVS", grade: "A" },
      { subjectName: "Art & Craft", grade: "A" },
    ],
  };

  /* ---------- states ---------- */
  if (!studentId) {
    return (
      <div className="container py-4 text-center text-muted">
        Student not found. Please login again.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="whitebox text-center mt-3">
        Loading result...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="whitebox text-center text-muted mt-3">
        Student data not available.
      </div>
    );
  }

  /* ---------- view ---------- */
  return (
    <div className="mainpro">
      <div className="container">
        <div className="whitebox mt-3">

          <h4 className="mb-3 text-center">Final Result</h4>

          {/* ✅ STUDENT INFO (100% CORRECT DATA) */}
          <div className="info-card mb-3">
            <div>
              <strong>Name:</strong>{" "}
              {student.personalDetails.studentName}
            </div>
            <div>
              <strong>Class:</strong>{" "}
              {getClassNameById(
                student.personalDetails.classId
              )}
            </div>
            <div>
              <strong>Roll No:</strong>{" "}
              {student.personalDetails.rollNumber}
            </div>
            <div>
              <strong>Admission No:</strong>{" "}
              {student.personalDetails.admissionRegistrationNo}
            </div>
            <div>
              <strong>Section:</strong>{" "}
              {student.personalDetails.sectionName}
            </div>
          </div>

          {/* SUMMARY */}
          <div className="row mb-3 text-center">
            <div className="col-md-4">
              <strong>Academic Year</strong>
              <div>{resultData.academicYear}</div>
            </div>
            <div className="col-md-4">
              <strong>Term</strong>
              <div>{resultData.term}</div>
            </div>
            <div className="col-md-4">
              <strong>Status</strong>
              <div>
                <span className="badge bg-success">
                  {resultData.resultStatus}
                </span>
              </div>
            </div>
          </div>

          {/* SUBJECTS */}
          <div className="border rounded p-3 mb-3">
            <h6>Subject-wise Performance</h6>
            {resultData.subjects.map((sub, i) => (
              <div
                key={i}
                className="d-flex justify-content-between border-bottom py-1"
              >
                <span>{sub.subjectName}</span>
                <span className="fw-semibold">
                  {sub.grade} {gradeEmoji(sub.grade)}
                </span>
              </div>
            ))}
          </div>

          {/* REMARK */}
          <div className="mb-3">
            <strong>Teacher’s Remark</strong>
            <p className="mb-1">{resultData.remarks}</p>
          </div>

          {/* PROMOTION */}
          <div className="alert alert-info text-center">
            🎓 Promoted To: <strong>{resultData.promotedTo}</strong>
          </div>

          {/* PRINT */}
          <div className="text-center">
            <button
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              Print Result
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStudent } from "../../context/StudentContext";
import axiosInstance from "../../utills/axiosInstance";
import { extractStudentDetails } from "../../utills/constants";
import useClassSection from "../../hooks/useClassSection";
// import "../../css/exam.css";

/* ---------- STATIC EXAM DATA ---------- */
const examData = {
  assessmentName: "Mid Term Assessment",
  assessmentDate: "15 Jan 2026",
  result: "Pass",
  subjects: [
    { name: "English (Rhymes & Alphabet)", grade: "Excellent" },
    { name: "Mathematics (Numbers & Shapes)", grade: "Good" },
    { name: "EVS (My Family & Nature)", grade: "Excellent" },
    { name: "Art & Craft", grade: "Good" },
    { name: "Physical Activity", grade: "Excellent" },
    { name: "Behavior & Discipline", grade: "Good" },
  ],
  remarks:
    "Aarav is a cheerful and active child. He participates well in class activities and shows good learning progress.",
};

/* ---------- GRADE ICON ---------- */
const gradeEmoji = (grade) => {
  switch (grade) {
    case "Excellent": return "";
    case "Good": return "";
    case "Average": return "";
    default: return "";
  }
};

export default function StudentExamPage() {
  const { activeStudent } = useStudent();
  const { getClassNameById } = useClassSection();
  const [searchParams] = useSearchParams();

  const studentId =
    searchParams.get("studentId") ||
    activeStudent?.studentId ||
    null;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH STUDENT PROFILE ---------- */
  useEffect(() => {
    if (!studentId) return;

    setLoading(true);

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
        console.error("Failed to load student details", err);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  /* ---------- STATES ---------- */
  if (!studentId) {
    return (
      <div className="container text-center py-4 text-muted">
        Student not found. Please login again.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="whitebox text-center mt-3">
        Loading assessment...
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

  /* ---------- VIEW ---------- */
  return (
    <div className="mainpro">
      <div className="container">
        <h2 className="title">Assessment Report</h2>

        {/* STUDENT INFO (FROM API) */}
        <div className="info-card">
          <div>
            <strong>Name:</strong>{" "}
            {student.personalDetails?.studentName}
          </div>

          <div>
            <strong>Class:</strong>{" "}
            {getClassNameById(
              student.personalDetails?.classId
            )}
          </div>

          <div>
            <strong>Roll No:</strong>{" "}
            {student.personalDetails?.rollNumber}
          </div>

          <div>
            <strong>Assessment:</strong>{" "}
            {examData.assessmentName}
          </div>

          <div>
            <strong>Date:</strong>{" "}
            {examData.assessmentDate}
          </div>
        </div>

        {/* SUBJECT PERFORMANCE (STATIC) */}
        <div className="card">
          <h4>Subject-wise Performance</h4>

          {examData.subjects.map((sub, index) => (
            <div className="subject-row" key={index}>
              <span>{sub.name}</span>
              <span className="grade">
                {sub.grade} <small>{gradeEmoji(sub.grade)}</small>
              </span>
            </div>
          ))}
        </div>

        {/* REMARKS */}
        <div className="card">
          <h4>Teacher's Remarks</h4>
          <p className="remarks">{examData.remarks}</p>
        </div>

        {/* RESULT */}
        <div
          className={`result-box ${
            examData.result === "Pass" ? "pass" : "improve"
          }`}
        >
          Overall Result: {examData.result}
        </div>

        {/* PRINT */}
        <div className="print-sec">
          <button onClick={() => window.print()}>
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}

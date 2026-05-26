import React, { useState, useEffect } from "react";

import axiosInstance from "../../utills/axiosInstance";
import useClassSection from "../../hooks/useClassSection";
import useAcademicYears from "../../hooks/useAcademicYears";
import useSyllabusByClassAndAcademic from "../../hooks/useSyllabusByClassAndAcademic";
import { useNotification } from "../../context/NotificationContext";
import AddSyllabusTopics from "./AddSyllabusTopics"; 


export default function AddSyllabus() {
  const { showNotification } = useNotification();

  const [academicYear, setAcademicYear] = useState(null);
  const [classId, setClassId] = useState(null);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTextbook, setSelectedTextbook] = useState(null);
  const [errors, setErrors] = useState({});

  const { academicYears } = useAcademicYears();
  const { classes } = useClassSection(classId, academicYear);
  const { syllabuses } = useSyllabusByClassAndAcademic(classId, academicYear);

  const [allSubjects, setAllSubjects] = useState([]);
  const [textbook, setTextbook] = useState([]);

  /* ---------- SYLLABUS TEMPLATE ---------- */
  const emptySyllabusTemplate = [
    {
      chapterName: "",
      topics: [
        {
          topicName: "",
          referencePages: "",
          weekNumber: "",
          estimatedDays: "",
          topicSequence: "",
        },
      ],
    },
  ];

  const [syllabus, setSyllabus] = useState(emptySyllabusTemplate);

  /* ---------- FETCH MASTER DATA ---------- */
  useEffect(() => {
    axiosInstance.get("/api/v1/share/all-subject-id-with-name")
      .then(res => setAllSubjects(res.data?.data || []));

    axiosInstance.get("/api/v1/share/all-book-id-with-name")
      .then(res => setTextbook(res.data?.data || []));
  }, []);

  /* ---------- HANDLERS ---------- */
  const addChapter = () =>
    setSyllabus([...syllabus, ...emptySyllabusTemplate]);

  const deleteChapter = (cIndex) =>
    setSyllabus(syllabus.filter((_, i) => i !== cIndex));

  const updateChapter = (cIndex, value) => {
    const updated = [...syllabus];
    updated[cIndex].chapterName = value;
    setSyllabus(updated);
  };

  const updateTopic = (cIndex, tIndex, field, value) => {
    const updated = [...syllabus];
    updated[cIndex].topics[tIndex][field] = value;
    setSyllabus(updated);
  };

  const validateSequenceNo = async (weekNumber, sequence) => {
    const res = await axiosInstance.get(
      "/api/v1/syllabus-topics/all/topic-sequence",
      {
        params: {
          syllabusId: selectedSyllabusId,
          subjectId: selectedSubject,
          weekNumber,
        },
      }
    );

    if (res.data?.data?.includes(Number(sequence))) {
      showNotification({
        message: "Sequence already exists for this week",
        type: "warning",
      });
      return { valid: false };
    }

    return { valid: true };
  };


  return (
    <div className="container">
      <h3>Add Syllabus Topics</h3>

      <AddSyllabusTopics
        mode="create"
        activeTab="form"
        syllabus={syllabus}
        allSubjects={allSubjects}
        textbook={textbook}
        classId={classId}
        academicYear={academicYear}
        syllabuses={syllabuses}
        selectedSyllabusId={selectedSyllabusId}
        selectedSubject={selectedSubject}
        selectedTextbook={selectedTextbook}
        setSelectedAcademicYear={setAcademicYear}
        setSelectedClassId={setClassId}
        setSelectedSyllabusId={setSelectedSyllabusId}
        setSelectedSubject={setSelectedSubject}
        setSelectedTextbook={setSelectedTextbook}
        updateChapter={updateChapter}
        updateTopic={updateTopic}
        deleteChapter={deleteChapter}
        addChapter={addChapter}
        validateSequenceNo={validateSequenceNo}
        saveAllTopics={saveAllTopics}
        errors={errors}
      />
    </div>
  );
}

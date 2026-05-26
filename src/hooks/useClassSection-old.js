import { useEffect, useState } from "react";
import axiosInstance from "../utills/axiosInstance";

export default function useClassSection(classId, sectionId,academicYear) {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [syllabusList, setSyllabusList] = useState([]);
  const [syllabusListHavingActivities, setSyllabusListHavingActivities] = useState([]);
  const [syllabusByClsAca, setSyllabusByClsAca] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);

  /* ================= FETCH CLASSES ================= */
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const res = await axiosInstance.get("/api/v1/class/getAllClasses");
      setClasses(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error fetching classes", err);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  /* ================= FETCH SECTIONS BY CLASS ================= */
  const fetchSectionsByClass = async (classId) => {
    if (!classId) {
      setSections([]);
      return;
    }

    try {
      setLoadingSections(true);
      const res = await axiosInstance.get(
        `/api/v1/share/class-id/${classId}`
      );
      setSections(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching sections", err);
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  /* ================= FETCH SYLLABUS BY CLASS ================= */
  const fetchSyllabusByClass = async (classId) => {
    if (!classId) {
      setSyllabusList([]);
      return;
    }

    try {
      setLoadingSyllabus(true);
      const res = await axiosInstance.get(
        `/api/v1/syllabus/class-id/${classId}`
      );
      setSyllabusList(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch syllabus", err);
      setSyllabusList([]);
    } finally {
      setLoadingSyllabus(false);
    }
  };

  

  /* ================= FETCH SYLLABUS HAVING ACTIVITIES ================= */
  const fetchSyllabusByClassHavingActivities = async (classId, sectionId) => {
    if (!classId || !sectionId) {
      setSyllabusListHavingActivities([]);
      return;
    }

    try {
      setLoadingSyllabus(true);

      const res = await axiosInstance.get(
        `/api/v1/daily-activities/syllabus-info`,
        {
          params: { classId, sectionId },
        }
      );

      setSyllabusListHavingActivities(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch syllabus having activities", err);
      setSyllabusListHavingActivities([]);
    } finally {
      setLoadingSyllabus(false);
    }
  };
const getClassNameById = (id) => {
    return classes.find(cls => cls.classId === id)?.className;
  };
  /* ================= AUTO LOAD ================= */
  useEffect(() => {
    fetchClasses();
  }, []);
  

  useEffect(() => {
    fetchSectionsByClass(classId);
    fetchSyllabusByClass(classId);
  }, [classId]);

  // useEffect(() => {
  //   fetchSyllabusByClassHavingActivities(classId, sectionId);
  // }, [classId, sectionId]);

  return {
    classes,
    sections,
    
    syllabusList,
    syllabusListHavingActivities,
    getClassNameById,
    loadingClasses,
    loadingSections,
    loadingSyllabus,
  };
}

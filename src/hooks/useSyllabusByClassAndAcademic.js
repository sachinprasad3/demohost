import { useEffect, useState } from "react";
import axiosInstance from "../utills/axiosInstance";

export default function useSyllabusByClassAndAcademic(classId, academicYear) {
  const [syllabuses, setSyllabuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (!classId || !academicYear) {
      setSyllabuses([]);
      return;
    }

    const fetchSyllabus = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get(
          "/api/v1/syllabus/academic-year/class-id",
          {
            params: { classId, academicYear }
          }
        );
// console.log("res from useSyllabusByClassAndAcademic",res)
        setSyllabuses(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch syllabus", err);
        setError(err);
        setSyllabuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabus();
  }, [classId, academicYear]); 

  return { syllabuses, loading, error };
}

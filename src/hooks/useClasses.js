import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../utills/axiosInstance";
import { getCurrentAcademicYear } from "../utils";

const useClasses = (academicYear) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolvedAcademicYear = academicYear || getCurrentAcademicYear();


  useEffect(() => {
    let isMounted = true;

    const fetchClasses = async () => {
      
      try {
        setLoading(true);
        // const res = await axiosInstance.get("/api/v1/class/getAllClasses");
        const res = await axiosInstance.get(`/api/v1/class/getAllClassesByAcademicYear?academicYear=${resolvedAcademicYear}`);

        if (isMounted) {
          setClasses(res.data?.data || res.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClasses();

    return () => {
      isMounted = false;
    };
  }, [resolvedAcademicYear]);

  const getClassNameByClassId = (classId) =>{
    // console.log("classId from useClassess",classes?.find((cls) =>cls?.classId === classId))
    const className = classes?.find((cls) =>cls?.classId === classId)?.className
    return className
  }
   //  Derived data
  const classesOptions = useMemo(() => {
    return classes.map((cls) => ({
      label: cls.className,
      value: cls.classId,
    }));
  }, [classes]);

  return { classes, classesOptions, loading, error,getClassNameByClassId };
};

export default useClasses;

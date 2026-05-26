
import { useEffect, useState } from "react";
import axiosInstance from "../utills/axiosInstance";

export default function useAcademicYears() {
  const [academicYears, setAcademicYears] = useState([]);

  useEffect(() => {
    const getAcademicYear = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/share/all-academic-years");

        if (res?.data?.data) {
          const sorted = [...res.data.data].sort((a, b) => {
            const startYearA = Number(a.academicYear.split("-")[0]);
            const startYearB = Number(b.academicYear.split("-")[0]);

            return startYearA - startYearB;
          });

          setAcademicYears(sorted);
        }
      } catch (error) {
        console.error("error in fetching academic years", error);
      }
    };

    getAcademicYear();
  }, []);
  const activeAcademicYear = academicYears?.filter((year) => year?.isCurrentActive === "Y") || [];

  return { academicYears,activeAcademicYear };
}

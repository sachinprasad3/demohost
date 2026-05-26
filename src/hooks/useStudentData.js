import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utills/axiosInstance";

export default function useStudentsData() {
  const { user } = useAuth();

  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (user?.role !== "ADMIN") return;

      setLoading(true);
      setError(null);

      try {
        const res = await axiosInstance.get("/api/students");
        const data = res.data;
        // console.log("res from StudentsData hook",res)

        setStudentsData(Array.isArray(data) ? data : []);
      } catch (err) {
        setStudentsData([]);
        setError("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  return { studentsData, loading, error };
}

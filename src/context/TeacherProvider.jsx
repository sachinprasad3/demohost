import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useTeacherAssignedClasses } from "../services/teacherMaster.services";

const TeacherContext = createContext(null);

export const useTeacher = () => useContext(TeacherContext);

export const TeacherProvider = ({ children }) => {
  const { user } = useAuth();

  const teacherId = user?.teacherInfo?.teacherId;
  const role = user?.role;

  const [activeClassId, setActiveClassId] = useState(null);

  const {
    data: assignedClasses = [],
    isLoading: teacherProviderLoading,
    refetch: refreshTeacherProfile,
  } = useTeacherAssignedClasses({ teacherId, role });

  /**
   *  Decide activeClassId when assignedClasses change
   */
  useEffect(() => {
    if (!assignedClasses.length) return;

    const storedId = Number(localStorage.getItem("activeClassId"));

    //  Prefer stored class IF it still exists
    const storedClass = assignedClasses.find(
      (cls) => cls.classId === storedId
    );

    //  Else prefer Permanent class
    const permanentClass = assignedClasses.find(
      (cls) => cls.assignmentStatus === "Permanent"
    );

    //  Else fallback to first class
    const nextActiveClass =
      storedClass || permanentClass || assignedClasses[0];

    setActiveClassId(nextActiveClass.classId);
  }, [assignedClasses]);

  /**
   *  Persist activeClassId
   */
  useEffect(() => {
    if (activeClassId !== null) {
      localStorage.setItem("activeClassId", activeClassId);
    }
  }, [activeClassId]);

  return (
    <TeacherContext.Provider
      value={{
        assignedClasses,
        activeClassId,
        setActiveClassId,
        teacherProviderLoading,
        refreshTeacherProfile,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
};

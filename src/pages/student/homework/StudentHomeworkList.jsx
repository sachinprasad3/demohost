import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { InfinitePagination } from "../../../components/homework/Pagination";
import { formatDate, getCurrentAcademicYear } from "../../../utils";
import { useStudent } from "../../../context/StudentContext";
import {
  useGetStudentHomeworkListV2,
  useGetDailyTeachingPlanHwById,
  useGetStudentHomeworkListV2Parent,
} from "../../../services/homework.services";
import { HomeworkViewSkeleton } from "../../../components/homework/HomeworkSkeleton";
import { DAY_SLOTS } from "../../admin/AcademicPlanForm";



/* ===============================
   🔹 SUBJECT COMPONENT (PER ROW)
================================= */
function HomeworkSubjects({ dailyTeachingPlanId }) {
  const { data: planData } =
    useGetDailyTeachingPlanHwById(dailyTeachingPlanId);

  if (!planData) return null;

  const hwSlot = planData?.plans?.["H.W"];

  if (!hwSlot?.subjects?.length) return null;

  return (
    
      <small>
      {hwSlot.subjects.map((s, i) => s.subject).join(", ")}
      </small>
    
  );
}


/* ===============================
   🔹 MAIN COMPONENT
================================= */
export default function StudentHomeworkList() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentAcademicYear = getCurrentAcademicYear();
  const { activeStudent } = useStudent();

  const {
    classId = activeStudent?.data?.classId || "",
    subjectId = "",
    topicId = "",
    activityId = "",
  } = location.state || {};

  const filterInitialState = useMemo(
    () => ({
      academicYear: currentAcademicYear,
      classId,
      syllabusId: "",
      activityId,
      subjectId,
      topicId,
    }),
    [currentAcademicYear, classId, activityId, subjectId, topicId]
  );

  const [filters, setFilters] = useState(filterInitialState);

  const {
    list: homeworks,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetStudentHomeworkListV2Parent({
    filters,
    studentId: activeStudent?.studentId,
    homeworkAllotmentStatus: "ASSIGNED",
  });

  const handleNavigate = (hw) => {
    const kababCase = hw?.day?.split(" ").join("-");
    navigate(`/student/homework-list/view/${kababCase}`, {
      state: {
        dailyTeachingPlanId: hw.dailyTeachingPlanId,
        assignmentId: hw.assignmentId,
        allotmentId: hw?.allotmentId,
      },
    });
  };

  return (
    <div className="container">
      <h3>Homework Records - {homeworks?.[0]?.className || ""}</h3>

      <div className="listsec syllabus-master">
        <div className="listbox studentlist theading">
          <div>Sl.</div>
          <div>Alloted Date</div>
          <div>Due Date</div> 
          <div>H.W. Subjects</div>
          <div>Actions</div>
        </div>

        <ul>
          {isLoading && (
            <li>
              <div className="listbox studentlist">Loading...</div>
            </li>
          )}

          {!isLoading && !homeworks?.length && (
            <li>
              <div className="listbox">No homework found</div>
            </li>
          )}

          {homeworks?.map((hw, index) => (
            <li key={hw.assignmentId}>
              <div className="listbox studentlist">
                <div>{index + 1}</div>

                <div data-head="Alloted Date">
                  {formatDate(hw.allotedDate)}
                </div>

                <div data-head="Due Date">
                  {formatDate(hw.dueDate) || "-"}
                </div>

                

                {/* 🔹 Subjects Column */}
                <div data-head="H.W. Subjects">
                  <HomeworkSubjects
                    dailyTeachingPlanId={hw.dailyTeachingPlanId}
                  />
                </div>

                {/* 🔹 Action */}
                <div>
                  <button
                    onClick={() => handleNavigate(hw)}
                    className="viewbtn"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 🔹 PAGINATION */}
      <InfinitePagination
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}

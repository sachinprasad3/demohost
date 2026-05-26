import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { InfinitePagination } from "../../../components/homework/Pagination";
import { formatDate, getCurrentAcademicYear } from "../../../utils";
import { useStudent } from "../../../context/StudentContext";
import {
  useGetDailyTeachingPlanHwById,
  useGetForwardedHomeworkListV2,
  useGetStudentHomeworkListV2Parent,
} from "../../../services/homework.services";

/* ===============================
   🔹 SUBJECT COMPONENT (PER ROW)
================================= */
function ClassHomeworkSubjects({ dailyTeachingPlanId }) {
  const { data: planData } =
    useGetDailyTeachingPlanHwById(dailyTeachingPlanId);

  if (!planData) return null;

  const hwSlot = planData?.plans?.["C.W"];

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
export default function StudentClassActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentAcademicYear = getCurrentAcademicYear();
  const { activeStudent } = useStudent();

  const {
    classId = activeStudent?.data?.classId || ""
  } = location.state || {};

  const filterInitialState = useMemo(
    () => ({
      academicYear: currentAcademicYear,
      classId,
      sortBy: "allotedDate",
      homeworkAllotmentStatusForParent: "COMPLETED",
      isDistinct: true
    }),
    [currentAcademicYear, classId]
  );

  const {
    list: homeworks,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetForwardedHomeworkListV2({
    status: "ASSIGNED",
    filters: filterInitialState,
  });

  const handleNavigate = (hw) => {
    const kababCase = formatDate(hw.allotedDate)?.split(" ").join("-");
    navigate(`/student/class-activity/view/${kababCase}`, {
      state: {
        dailyTeachingPlanId: hw.dailyTeachingPlanId,
        assignmentId: hw.assignmentId,
      },
    });
  };

  return (
    <div className="container">
      <h3>Class Activity Records - {homeworks?.[0]?.className || ""}</h3>

      <div className="listsec syllabus-master">
        <div className="listbox studentlist theading">
          <div>Sl.</div>
          <div>Class Activity Date</div>
          <div>C.W. Subjects</div>
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
              <div className="listbox">No activity found</div>
            </li>
          )}

          {homeworks?.map((hw, index) => (
            <li key={hw.assignmentId}>
              <div className="listbox studentlist">
                <div>{index + 1}</div>

                <div data-head="Alloted Date">
                  {formatDate(hw.allotedDate)}
                </div>

                {/* 🔹 Subjects Column */}
                <div data-head="H.W. Subjects">
                  <ClassHomeworkSubjects
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

      {/* PAGINATION */}
      <InfinitePagination
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}

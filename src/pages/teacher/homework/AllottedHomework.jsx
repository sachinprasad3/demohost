import { useCallback, useMemo, useState } from "react";
import {
  useGetForwardedHomeworkListV2,
} from "../../../services/homework.services";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import {
  InfinitePagination,
} from "../../../components/homework/Pagination";
import { getCurrentAcademicYear } from "../../../utils";
import { useAuth } from "../../../context/AuthContext";
import HomeworkFilter, {
  getUpdatedFilters,
} from "../../../components/homework/HomeworkFilter";
import { useDebounce } from "../../../hooks/useDebounce";
import { getassignmentStatus } from "../../admin/homework/ForwardedHomeworkList";
import Loader from "../../../components/Loader";

const AllottedHomework = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentAcademicYear = getCurrentAcademicYear();
  const [activeTab, setActiveTab] = useState("FORWARDED");
  
  const activeClass = user?.teacherInfo?.assignedClasses.find(cls => cls.assignmentStatus === "Permanent") || null

  const filterInitialState = useMemo(
    () => ({
      academicYear: currentAcademicYear,
      classId: activeClass?.classId || "",
      date: new Date().toISOString().split("T")[0],
    }),
    [currentAcademicYear, activeClass],
  );

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(filterInitialState);

  /** ========== Calling Homework List Api =========== */
  const {
    list: homeworks,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetForwardedHomeworkListV2({ filters, status: activeTab });

  const handleResetFilters = useCallback(() => {
    setFilters(filterInitialState);
    setSearch("");
  }, [filterInitialState]);

  const handleChangeFilter = useCallback(
    (e) => {
      const { name, value } = e.target;

      setFilters((prev) => getUpdatedFilters(prev, name, value));
    },
    [setFilters],
  );

  const handleDebouncedSearchChange = useDebounce(setSearch, 500);

  const handleNavigate = (hw) => {
    const assignmentStatus = getassignmentStatus(hw.allotmentStatus);
    const kababCase = hw.day?.split(" ").join("-");
    navigate(`/teacher/allotted-homework/view/${kababCase}`, {
      state: {
        id: hw.dailyTeachingPlanId,
        allotmentId: hw.allotmentId,
        assignmentStatus,
        homeworkAllotmentStatus: hw.allotmentStatus,
      },
    });
  };

  return (
    <div className="container ">
      <div className="whitebox">
        <HomeworkFilter
          resetFilters={handleResetFilters}
          changeFilter={handleChangeFilter}
          changeSearch={handleDebouncedSearchChange}
          filters={filters}
          search={search}
          isForTeacher={true}
        />
      </div>
      {/* TABLE */}
      <h3>Homework Records</h3>
      <div className="tabs">
        <button
          className={`tab ${activeTab === "FORWARDED" ? "activeTab" : ""}`}
          onClick={() => setActiveTab("FORWARDED")}
        >
          Forwarded Homework
        </button>
        <button
          className={`tab ${activeTab === "ASSIGNED" ? "activeTab" : ""}`}
          onClick={() => setActiveTab("ASSIGNED")}
        >
          Approved Homework
        </button>
        <button
          className={`tab ${activeTab === "CANCELLED" ? "activeTab" : ""}`}
          onClick={() => setActiveTab("CANCELLED")}
        >
          Cancelled Homework
        </button>
        <button
          className={`tab ${activeTab === "COMPLETED" ? "activeTab" : ""}`}
          onClick={() => setActiveTab("COMPLETED")}
        >
          Completed Homework
        </button>
      </div>
      <div className="listsec syllabus-master">
        <div className="listbox studentlist theading">
          <div>Sl.</div>
          <div>Class</div>
          <div>Syllabus Name</div>
          <div>Day</div>
          <div>Actions</div>
        </div>

        <ul>
          {isLoading && (
            <li>
              <Loader />
            </li>
          )}
          {!isLoading && !homeworks?.length && (
            <li>
              <div className="listbox ">No homework found</div>
            </li>
          )}
          {homeworks?.map((hw, index) => (
            <li key={index}>
              <div className="listbox studentlist">
                <div>{index + 1}</div>
                <div data-head="Class">{hw.className}</div>
                <div data-head="Syllabus Name">{hw.syllabusName || "-"}</div>
                <div data-head="Marks">{hw.day || "-"}</div>
                <div className="actionbtns">
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
};

export default AllottedHomework;

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGetForwardedHomeworkListV2,
} from "../../../services/homework.services";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import {
  InfinitePagination,
} from "../../../components/homework/Pagination";
import HomeworkFilter, {
  getUpdatedFilters,
} from "../../../components/homework/HomeworkFilter";
import { useDebounce } from "../../../hooks/useDebounce";
import { useGetSingleCurrentAcademicYear } from "../../../services/academicYear.services";
import Loader from "../../../components/Loader";

export const getassignmentStatus = (allotmentStatus) => {
  switch (allotmentStatus) {
    case "FORWARDED":
      return "PENDING";
    case "ASSIGNED":
      return "ASSIGNED";
    case "CANCELLED":
      return "CANCELLED";
  }
};

export default function ForwardedHomeworkList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("FORWARDED");
  // const currentAcademicYear = getCurrentAcademicYear();
  const { data: currentAcademicYear } = useGetSingleCurrentAcademicYear();

  const filterInitialState = useMemo(
    () => ({
      academicYear: currentAcademicYear,
      classId: "",
      syllabusId: "",
      activityId: "",
      subjectId: "",
      topicId: "",
      date: new Date().toISOString().split("T")[0],
    }),
    [currentAcademicYear],
  );

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(filterInitialState);
  useEffect(() => {
    setFilters(filterInitialState);
  }, [filterInitialState]);

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

  const handleNavigateToView = (hw) => {
    const assignmentStatus = getassignmentStatus(hw.allotmentStatus);
    navigate(`/admin/forwarded-homework/view/${hw.day.split(" ").join("-")}`, {
      state: {
        id: hw.dailyTeachingPlanId,
        allotmentId: hw.allotmentId,
        assignmentStatus,
        homeworkAllotmentStatus: hw.allotmentStatus,
        forwardVisibility: activeTab === "FORWARDED",
        studentVisibility: true,
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
            <li key={hw.allotmentId}>
              <div className="listbox studentlist">
                <div>{index + 1}</div>
                <div data-head="Class">{hw.className}</div>
                <div data-head="Syllabus Name">{hw.syllabusName || "-"}</div>
                <div data-head="Day">{hw.day || "-"}</div>
                <div>
                  <button
                    onClick={() => handleNavigateToView(hw)}
                    className="viewbtn"
                  >
                    <Eye size={18} />
                  </button>
                  {/* <button
                    onClick={() =>
                      navigate(`/admin/homework/edit/${hw.homeworkTitle}`, {
                        state: { id: hw.homeworkId },
                      })
                    }
                    className="editbtn"
                  >
                    <Pencil size={18} />
                  </button> */}
                  {/* <button
                    // onClick={() => handleDeleteHomework(hw.homeworkId)}
                    className="crossbtn"
                  >
                    <X size={18} />
                  </button> */}
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

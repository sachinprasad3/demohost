import { useCallback, useEffect, useMemo, useState } from "react";
import { limit, useGetHomeworkList, useUpdateHomeworkStatus } from "../../../services/homework.services";
import { useNavigate } from "react-router-dom";
import {
  Eye
} from "lucide-react";
import Pagination from "../../../components/homework/Pagination";
import HomeworkFilter, {
  getUpdatedFilters,
} from "../../../components/homework/HomeworkFilter";
import { getCurrentAcademicYear } from "../../../utils";
import { useDebounce } from "../../../hooks/useDebounce";

export default function HomeworkList() {
  const navigate = useNavigate();
  const currentAcademicYear = getCurrentAcademicYear();

  const filterInitialState = useMemo(
    () => ({
      academicYear: currentAcademicYear,
      classId: "",
      syllabusId: "",
      activityId: "",
      subjectId: "",
      topicId: "",
      date: "",
    }),
    [currentAcademicYear],
  );

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(filterInitialState);
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const mutateHwStatus = useUpdateHomeworkStatus()

  const {
    data: homeworks,
    isLoading,
    page,
    hasNextPage,
    hasPreviousPage,
    totalPages,
    nextPage,
    prevPage,
    setPage,
  } = useGetHomeworkList({ search, filters, status: activeTab });

  const handleResetFilters = useCallback(() => {
    setFilters(filterInitialState);
    setSearch("");
    setPage(0);
  }, [filterInitialState, setPage]);

  useEffect(() => {
    setPage(0);
  }, [search, filters, setPage]);

  const handleChangeFilter = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFilters((prev) => getUpdatedFilters(prev, name, value));
    },
    [setFilters],
  );

  const handleDebouncedSearchChange = useDebounce(setSearch, 500);

  const handleToggleStatus = (hw) => {
    if(!hw || mutateHwStatus.isPending) return

    const status =  hw.homeworkStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    mutateHwStatus.mutate({hwId: hw.homeworkId, status})
  }

  const handleNavigateToView = (hw) => {
    navigate(`/admin/homework/view/${hw.homeworkTitle.split(" ").join("-")}`, 
    {state: { id: hw.homeworkId }})
  }

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
          className={`tab ${activeTab === "ACTIVE" ? "activeTab" : ""}`}
          onClick={() => setActiveTab("ACTIVE")}
        >
          Active Homework
        </button>
        <button
          className={`tab ${activeTab === "INACTIVE" ? "activeTab" : ""}`}
          onClick={() => setActiveTab("INACTIVE")}
        >
          In Active Homework
        </button>
      </div>
      <div className="listsec syllabus-master">
        <div className="listbox studentlist theading">
          <div>Sl.</div>
          <div>Class</div>
          <div>Subject</div>
          <div>Topic</div>
          <div>Marks</div>
          <div className="actions-heading">Actions</div>
        </div>

        <ul>
          {isLoading && (
            <li>
              <div className="listbox studentlist">Loading...</div>
            </li>
          )}
          {!isLoading && !homeworks?.data?.length && (
            <li>
              <div className="listbox ">No homework found</div>
            </li>
          )}
          {homeworks?.data?.map((hw, index) => (
            <li key={hw.homeworkId}>
              <div className="listbox studentlist">
                <div>{page * limit + index + 1}</div>
                <div data-head="Class">{hw.className}</div>
                <div data-head="Subject">{hw.subjectName}</div>
                <div data-head="Topic">{hw.topicName}</div>
                <div data-head="Marks">{hw.totalMarks}</div>
                <div className="actionbtns actions-heading">
                  <button
                    onClick={() =>handleNavigateToView(hw)}
                    className="viewbtn"
                  >
                    <Eye size={18} />
                  </button>
                      <div
                        className={`defaultbtn ${
                          hw.homeworkStatus === "ACTIVE" ? "on" : "off"
                        }`}
                        onClick={() => handleToggleStatus(hw)}
                        style={{ cursor: "pointer" }} 
                        title={
                          hw.homeworkStatus === "ACTIVE"
                            ? "Click to Deactivate"
                            : "Click to Activate"
                        }
                      >
                        <div className="toggle-circle">
                          {hw.homeworkStatus === "ACTIVE" ? "✓" : "✕"}
                        </div>
                      </div>
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
      <Pagination
        page={page + 1}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        fetchNextPage={nextPage}
        fetchPreviousPage={prevPage}
        isFetchingNextPage={isLoading}
        isFetchingPreviousPage={isLoading}
      />
    </div>
  );
}

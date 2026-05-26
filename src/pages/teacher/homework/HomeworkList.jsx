import { useCallback, useMemo, useState } from "react";
import {
  useGetDailyTeachingPlanNotAssignedToAll,
} from "../../../services/homework.services";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import HomeworkFilter, {
  getUpdatedFilters,
} from "../../../components/homework/HomeworkFilter";
import {
  InfinitePagination,
} from "../../../components/homework/Pagination";
import { getCurrentAcademicYear } from "../../../utils";
import { useDebounce } from "../../../hooks/useDebounce";
import { useAuth } from "../../../context/AuthContext";
import Loader from "../../../components/Loader";

export default function HomeworkList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentAcademicYear = getCurrentAcademicYear();

  const activeClass = user?.teacherInfo?.assignedClasses.find(cls => cls.assignmentStatus === "Permanent") || null

  const filterInitialState = useMemo(
    () => ({
      academicYear: currentAcademicYear,
      classCode: activeClass?.classCode || "",
      date: new Date().toISOString().split("T")[0],
    }),
    [currentAcademicYear, activeClass],
  );

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(filterInitialState);

  /** ========== Calling Homework List Api =========== */
  // const {
  //   list: homeworks,
  //   isLoading,
  //   hasNextPage,
  //   fetchNextPage,
  //   isFetchingNextPage
  // } = useGetDailyTeachingPlanHomeworkList({ search, filters });

   const {
    list: homeworks,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useGetDailyTeachingPlanNotAssignedToAll({ search, filters });

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

  const handleNavigate = ({ title, id }) => {
    const kababCase = title.split(" ").join("-");
    navigate(`/teacher/homework/view/${kababCase}`, {
      state: { id },
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
      <div className="listsec syllabus-master">
        <div className="listbox studentlist theading">
          <div>Sl.</div>
          <div>Class</div>
          <div>Syllabus Name</div>
          {/* <div>Theme</div> */}
          <div>Day</div>
          {/* <div>themeNumbers</div> */}
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
            <li key={hw.daily_teaching_plan_id}>
              <div className="listbox studentlist">
                <div>{index + 1}</div>
                <div data-head="Class">{hw.className}</div>
                <div data-head="Syllabus Name">{hw.syllabusName}</div>
                {/* <div data-head="Topic">{hw.themeName}</div> */}
                <div data-head="Marks">{hw.day}</div>
                {/* <div data-head="Assigned">
                  {hw.themeNumbers}
                </div> */}
                <div>
                  <button
                    onClick={() =>
                      handleNavigate({
                        title: hw.day,
                        id: hw.daily_teaching_plan_id,
                      })
                    }
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

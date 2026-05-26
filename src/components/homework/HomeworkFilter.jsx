import { memo, useEffect, useRef } from "react";
import { useGetAssignedClasses } from "../../services/homework.services";
import Select from "../AmissionFormComponents/customField/Select";
import { useGetAcademicYearsRoleBased, useGetCurrentAcademicYears } from "../../services/academicYear.services";
export const getUpdatedFilters = (prev, name, value) => {
  const updated = { ...prev, [name]: value };

  if (["academicYear"].includes(name)) {
    updated.classId = "";
  }

  if (["classId", "subjectId", "topicId"].includes(name)) {
    updated.activityId = "";
  }

  if (["classId", "academicYear", "subjectId"].includes(name)) {
    updated.topicId = "";
  }

  if (name === "academicYear") {
    updated.syllabusId = "";
  }

  return updated;
};

const HomeworkFilter = memo(
  ({ resetFilters, changeFilter, filters, isForTeacher = false }) => {
    const { academicYear, classCode, classId, date } = filters;
    const { data: academicYears = [] } = useGetAcademicYearsRoleBased({isTeacher: isForTeacher});
    const searchRef = useRef(null);

    const { data: classes = [] } = useGetAssignedClasses({
      academicYear,
      isForTeacher,
    });

    useEffect(() => {
      if (classes.length) {
        const activeClass = classes.find(
          (cls) => cls.assignmentStatus === "Permanent",
        );

        if (activeClass && activeClass?.classCode) {
          changeFilter({
            target: { name: "classCode", value: activeClass?.classCode },
          });
        }
      }
    }, [classes]);

    const handleReset = () => {
      searchRef.current.value = "";
      resetFilters();
    };

    const today = new Date();

    // 4 days before today
    const minDateObj = new Date(today);
    minDateObj.setDate(today.getDate() - 4);

    // 1 day after today
    const maxDateObj = new Date(today);
    maxDateObj.setDate(today.getDate() + 1);

    // Convert to yyyy-mm-dd (for <input type="date" />)
    const minDate = minDateObj.toISOString().split("T")[0];
    const maxDate = maxDateObj.toISOString().split("T")[0];

    return (
      <div className="formbox searchsec">
        <h3>Search</h3>
        <ul>
          <li>
            <div className="form-group">
              <Select
                options={academicYears}
                value={academicYear}
                name="academicYear"
                onChange={changeFilter}
                placeholder="Academic Year"
                mappingField={{ id: "academicYear", name: "academicYear" }}
              />
            </div>
          </li>
          <li>
            <div className="form-group">
              {isForTeacher ? (
                <Select
                  options={classes}
                  value={classCode}
                  name="classCode"
                  onChange={changeFilter}
                  placeholder="Select Class"
                  mappingField={{ id: "classCode", name: "className" }}
                />
              ) : (
                <Select
                  options={classes}
                  value={classId}
                  name="classId"
                  onChange={changeFilter}
                  placeholder="Select Class"
                  mappingField={{ id: "classId", name: "className" }}
                />
              )}
            </div>
          </li>
          <li>
            <div className="form-group">
              <input
                className="form-control"
                type="date"
                name="date"
                value={date}
                onChange={changeFilter}
                {...(isForTeacher ? {min: minDate, max: maxDate}: {})}
              />
            </div>
          </li>
          <li>
            <div className="form-group">
              <button
                className="searchbtn btn btn-primary"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </li>
        </ul>
      </div>
    );
  },
);

export default HomeworkFilter;

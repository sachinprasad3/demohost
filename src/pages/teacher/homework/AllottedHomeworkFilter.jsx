import { memo, useEffect } from "react";
import {
  useGetActivities,
  useGetSyllabus,
  useGetTopics,
} from "../../../services/homework.services";
import { assignmentStatusList } from "../../../services/homework.services";
import Select from "../../../components/AmissionFormComponents/customField/Select";

export const getUpdatedFiltersForAllotted = (prev, name, value) => {
  const updated = { ...prev, [name]: value };

  if (["classId", "subjectId", "topicId"].includes(name)) {
    updated.activityId = "";
  }

  if (["classId", "subjectId"].includes(name)) {
    updated.topicId = "";
  }

  return updated;
};

const AllottedHomeworkFilter = memo(
  ({ resetFilters, changeFilter, filters }) => {
    const {
      classId,
      subjectId,
      topicId,
      activityId,
      syllabusId,
      assignmentStatus,
      academicYear,
    } = filters;

    const { data: subjects = [] } = useGetActiveSubjects();

    const { data: topics = [] } = useGetTopics(syllabusId, subjectId); // syllabusId

    const { data: activities = [] } = useGetActivities(
      topicId,
      subjectId,
      classId,
    );
    const { data: syllabuses = [] } = useGetSyllabus(classId, academicYear);

    return (
      <div className="formbox searchsec">
        <h3>Search</h3>
        <ul>
          <li>
            <div className="form-group">
              <Select
                options={assignmentStatusList}
                value={assignmentStatus}
                name="assignmentStatus"
                onChange={changeFilter}
                placeholder="Select assignmentStatus"
                mappingField={{ id: "id", name: "value" }}
              />
            </div>
          </li>

          <li>
            <div className="form-group">
              <Select
                options={subjects}
                value={subjectId}
                name="subjectId"
                onChange={changeFilter}
                placeholder="Select Subject"
                mappingField={{ id: "subjectId", name: "subjectName" }}
              />
            </div>
          </li>
          <li>
            <div className="form-group">
              <Select
                options={topics}
                value={topicId}
                name="topicId"
                onChange={changeFilter}
                placeholder="Select Topic"
                mappingField={{ id: "topicId", name: "topicName" }}
              />
            </div>
          </li>
          <li>
            <div className="form-group">
              <Select
                options={activities}
                value={activityId}
                name="activityId"
                onChange={changeFilter}
                placeholder="Select Activity"
                mappingField={{ id: "activityId", name: "activityTitle" }}
              />
            </div>
          </li>
          <li>
            <div className="form-group">
              <button
                className="searchbtn btn btn-primary"
                onClick={resetFilters}
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

export default AllottedHomeworkFilter;

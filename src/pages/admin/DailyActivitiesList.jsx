import React, { useState, useEffect } from "react";
import axiosInstance from "../../utills/axiosInstance";
import useClasses from "../../hooks/useClasses";
import useAcademicYears from "../../hooks/useAcademicYears";
import useSyllabusByClassAndAcademic from "../../hooks/useSyllabusByClassAndAcademic";
import DayAccordion from "../../components/DayAccordion";

export default function DailyActivitiesList() {
  const [classId, setClassId] = useState("");
  const [syllabusId, setSyllabusId] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [academicYear, setAcademicYear] = useState("");
  // const [selectedWeek, setSelectedWeek] = useState("");
  const { academicYears } = useAcademicYears();
  const { syllabuses, loadingSyllabus } = useSyllabusByClassAndAcademic(classId, academicYear);
  const [teacherId, setTeacherId] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const isFilterApplied = academicYear && classId;



  const { classes, loading: loadingClasses, error: classError } = useClasses(academicYear);


  useEffect(() => {
    if (!academicYears || academicYears.length === 0) return;
    if (academicYear) return;

    const today = new Date();

    const current = academicYears.find(y => {
      const [startYear, endYear] = y.academicYear.split("-").map(Number);

      const startDate = new Date(startYear, 3, 1);
      const endDate = new Date(endYear, 2, 31);

      return today >= startDate && today <= endDate;
    });

    if (current) {
      setAcademicYear(current.academicYear);
    }
  }, [academicYears]);


  useEffect(() => {
    if (!isFilterApplied) return;

    const fetchFilteredActivities = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(
          "/api/v1/daily-activities/filter",
          {
            params: {
              academicYear,
              classId,
              ...(syllabusId && { syllabusId }),
            }
          }
        );

        setActivities(res.data?.data || {});
        setHasFiltered(true);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredActivities();
  }, [academicYear, classId, syllabusId]);


  useEffect(() => {
    if (!classId || !academicYear) {
      setTeacherId("");
      setTeacherName("");
      return;
    }

    const fetchTeacherByClass = async () => {
      try {
        setLoadingTeacher(true);

        const res = await axiosInstance.get(
          `/api/v1/share/teacher-info/class-id/${classId}/academic-year/${academicYear}`
        );

        const teacher = res.data?.data;

        if (teacher) {
          setTeacherId(teacher.teacherId);
          setTeacherName(teacher.teacherName);
        } else {
          setTeacherId("");
          setTeacherName("");
        }

      } catch (err) {
        console.error("Failed to fetch teacher", err);
        setTeacherId("");
        setTeacherName("");
      } finally {
        setLoadingTeacher(false);
      }
    };

    fetchTeacherByClass();
  }, [classId, academicYear]);


  // --------------------------------

  const groupActivitiesByDay = (list = []) => {
    const map = {};

    list.forEach(a => {
      const key = `${a.dayNumber}_${a.planDate}`;

      if (!map[key]) {
        map[key] = {
          dayNumber: a.dayNumber,
          planDate: a.planDate,
          activities: []
        };
      }

      map[key].activities.push(a);
    });

    return {
      days: Object.values(map).sort(
        (a, b) => new Date(a.planDate) - new Date(b.planDate)
      )
    };
  };

  useEffect(() => {
    if (!academicYear || isFilterApplied) return;

    const fetchAllActivities = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(
          "/api/v1/daily-activities/all"
        );

        const list = res.data?.data || [];

        const filtered = list.filter(a =>
          a.academicYear === academicYear
        );

        setActivities(groupActivitiesByDay(filtered));
        setHasFiltered(true);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivities();
  }, [academicYear]);



  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="whitebox">

        <div className="formbox stapform acsearch">
          <ul>
            <li className="fullsec">
              <div className="form-group">
                <label>Academic Year</label>
                <select
                  className="form-control"
                  value={academicYear}
                  onChange={e => {
                    setAcademicYear(e.target.value);
                    setClassId("");
                    setSyllabusId("");
                    // setSelectedWeek("");
                    setTeacherId("");
                    setTeacherName("");
                    setActivities([]);
                    setHasFiltered(false);
                  }}
                >

                  <option value="">Select Academic Year</option>
                  {academicYears
                    .filter(y => y.isCurrentActive === "Y")
                    .sort((a, b) => {
                      const startA = Number(a.academicYear.split("-")[0]);
                      const startB = Number(b.academicYear.split("-")[0]);
                      return startA - startB;
                    })
                    .map(y => (
                      <option key={y.academicYear} value={y.academicYear}>
                        {y.academicYear}
                      </option>
                    ))}
                </select>



              </div>
            </li>


            <li className="fullsec">
              <div className="form-group">
                <label>Class</label>
                <select
                  className="form-control"
                  value={classId}
                  disabled={!academicYear || loadingClasses}
                  onChange={e => {
                    setClassId(e.target.value);
                    setSyllabusId("");
                    setTeacherId("");
                    setTeacherName("");
                    setActivities([]);
                    setHasFiltered(false);
                  }}
                >
                  <option value="">
                    {loadingClasses
                      ? "Loading classes..."
                      : !academicYear
                        ? "Select Year First"
                        : "Select Class"}
                  </option>

                  {classes.map(cls => (
                    <option key={cls.classId} value={cls.classId}>
                      {cls.className}
                    </option>
                  ))}
                </select>




                {classError && (
                  <div className="invalid-feedback d-block">
                    Failed to load classes
                  </div>
                )}
              </div>
            </li>



            <li>
              <div className="form-group">
                <label>Syllabus</label>
                <select
                  className="form-control"
                  value={syllabusId}
                  disabled={!classId || loadingSyllabus}
                  onChange={e => {
                    setSyllabusId(e.target.value);
                    // setSelectedWeek("");
                    setActivities([]);
                    setHasFiltered(false);
                  }}
                >
                  <option value="">
                    {loadingSyllabus
                      ? "Loading syllabus..."
                      : !classId
                        ? "Select Class first"
                        : "Select Syllabus"}
                  </option>

                  {syllabuses.map(s => (
                    <option key={s.syllabusId} value={s.syllabusId}>
                      {s.syllabusName}
                    </option>
                  ))}
                </select>

                {/* Message below */}
                {classId && !loadingSyllabus && syllabuses.length === 0 && (
                  <div className="invalid-feedback d-block">
                    No syllabus available
                  </div>
                )}

              </div>
            </li>
            <li>
              <div className="form-group">
                <label>Teacher</label>
                <select className="form-control" value={teacherId}
                  disabled
                >
                  <option value="">
                    {loadingTeacher
                      ? "Loading teacher..."
                      : !classId
                        ? "Select Class first"
                        : "Assigned Teacher"}
                  </option>

                  {teacherId && (
                    <option value={teacherId}>
                      {teacherName}
                    </option>
                  )}
                </select>

                {!loadingTeacher && classId && !teacherId && (
                  <div className="invalid-feedback d-block">
                    teacher not assigned
                  </div>
                )}
              </div>
            </li>
          </ul>

        </div>
      </div>
      {/* ===== NO FILTER APPLIED ===== */}
      {!hasFiltered && (
        <div className="alert alert-info mt-3">
          Please apply filter to view daily activities
        </div>
      )}

      {hasFiltered && !loading && activities?.days?.length === 0 && (
        <div className="alert alert-info mt-3">
          {isFilterApplied
            ? "No daily activities found for selected filter"
            : "No daily activities found for this academic year"}
        </div>
      )}


      {/* ===== DATA VIEW ===== */}
      {activities?.days?.length > 0 && (
        <div className="accordion-wrapper">

          {activities?.days?.length > 0 && (
            <div className="accordion-wrapper">

              {activities.days.map(day => (
                <DayAccordion
                  key={`${day.dayNumber}-${day.planDate}`}
                  day={day}
                  syllabusThemeName={activities.syllabusThemeName}
                />
              ))}


            </div>
          )}
        </div>
      )}
    </div>
  );
}

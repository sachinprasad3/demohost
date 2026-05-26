import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axiosInstance from "../../utills/axiosInstance";
import { useNotification } from "../../context/NotificationContext";
import useAcademicYears from "../../hooks/useAcademicYears";
import useClasses from "../../hooks/useClasses";
import { useGetAllActiveAcademicYear, useGetAllClasses, useGetAllSuperSyllabus, useGetSuperSyllabusByClassId } from "../../services/teachingPlan.services";

const initialForm = {
  syllabusId: "",
  classId: "",
  academicYear: "",
  termId: "",
  syllabusName: "",
  startDate: "",
  endDate: "",
  totalWeeks: "",
  totalWorkingDays: "",
  status: "ACTIVE",
};

export default function SyllabusMaster() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showTerm, setShowTerm] = useState(false);
  const [activeClass, setActiveClass] = useState("ALL");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [academicRange, setAcademicRange] = useState({ startDate: "", endDate: "" });
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // const { classes } = useClasses();



  // const { academicYears } = useAcademicYears();
    const {data: academicYears} = useGetAllActiveAcademicYear()
  //  console.log("all asctive academicyears",academicYears)
  const { data:classes, loading: loadingClasses } = useGetAllClasses();
const {data:superSyllabus} = useGetSuperSyllabusByClassId(formData?.classId);
const {data:allSuperSyllabus} = useGetAllSuperSyllabus()
console.log("superSyllabus",superSyllabus)
const filteredClass = classes?.filter(cls =>
  allSuperSyllabus?.some(syl => syl?.classId === cls?.classId)
);

useEffect(() => {
  if (superSyllabus) {
    setFormData(prev => ({
      ...prev,
      totalWorkingDays: superSyllabus?.totalDays?? "",
      totalWeeks: superSyllabus?.totalWeek?? "",
    }));
  }else if(!formData?.classId){
    setFormData(prev => ({
      ...prev,
      totalWorkingDays:  "",
      totalWeeks:  "",
    }));
  }
}, [superSyllabus,formData?.classId]);



  const handleChange = (e) => {
    const { name, value } = e.target;

    setFieldErrors(prev => ({ ...prev, [name]: "" }));

    // if (name === "academicYear") {
    //   const selectedYear = academicYears.find(
    //     y => y.academicYear === value
    //   );



    //   setAcademicRange({
    //     startDate: selectedYear?.startDate || "",
    //     endDate: selectedYear?.endDate || ""
    //   });

    //   setFormData(prev => ({
    //     ...prev,
    //     academicYear: value,
    //     startDate: selectedYear?.startDate || "",
    //     endDate: selectedYear?.endDate || ""
    //   }));
    //   return;
    // }

    if (name === "academicYear") {
      const selectedYear = academicYears.find(
        y => y.academicYear === value
      );

      setAcademicRange({
        startDate: selectedYear?.startDate || "",
        endDate: selectedYear?.endDate || ""
      });

      setFormData(prev => ({
        ...prev,
        academicYear: value
      }));

      return;
    }



    if (name === "classId") {
      const cls = Number(value);
      setShowTerm(cls >= 3);
      if (cls < 3) {
        setFormData(prev => ({ ...prev, termId: "" }));
      }
    }

    if (name === "totalWeeks") {
      const weeks = Number(value);
      const maxWeeks = getMaxWeeksFromDateRange();
      const workingDays = Number(formData.totalWorkingDays);

      if (maxWeeks && weeks > maxWeeks) {
        setFieldErrors(prev => ({
          ...prev,
          totalWeeks: `Total weeks cannot exceed ${maxWeeks}`
        }));
      } else {
        setFieldErrors(prev => ({ ...prev, totalWeeks: "" }));
      }

      if (workingDays && workingDays > weeks * 7) {
        setFieldErrors(prev => ({
          ...prev,
          totalWorkingDays: `days cannot exceed ${weeks * 7}`
        }));
      } else {
        setFieldErrors(prev => ({ ...prev, totalWorkingDays: "" }));
      }
    }


    if (name === "totalWorkingDays") {
      const days = Number(value);
      const weeks = Number(formData.totalWeeks);

      if (weeks && days > weeks * 7) {
        setFieldErrors(prev => ({
          ...prev,
          totalWorkingDays: `days cannot exceed ${weeks * 7}`
        }));
      } else {
        setFieldErrors(prev => ({ ...prev, totalWorkingDays: "" }));
      }
    }


    if (name === "startDate") {
      const start = new Date(value);
      const end = formData.endDate ? new Date(formData.endDate) : null;

      if (end && end < start) {
        setFormData(prev => ({
          ...prev,
          startDate: value,
          endDate: ""
        }));

        setFieldErrors(prev => ({
          ...prev,
          endDate: "date must be after start date"
        }));
        return;
      }
    }

    if (name === "endDate") {
      const start = new Date(formData.startDate);
      const end = new Date(value);

      if (formData.startDate && end <= start) {
        setFieldErrors(prev => ({
          ...prev,
          endDate: "Choose a later end date"
        }));
        return;
      }
    }


    if (name === "endDate") {
      const start = new Date(formData.startDate);
      const end = new Date(value);

      if (formData.startDate && end <= start) {
        setFieldErrors(prev => ({
          ...prev,
          endDate: "Choose a later end date"
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          endDate: ""
        }));
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchSyllabusById = async (id) => {
    try {
      const res = await axiosInstance.get(`/api/v1/syllabus/${id}`);
      return res?.data?.data;
    } catch (err) {
      console.error("Fetch syllabus by id failed", err);
      return null;
    }
  };


  useEffect(() => {
    if (!id) return;

    const initEdit = async () => {
      setEditMode(true);

      let row = location.state;
      if (!row) {
        row = await fetchSyllabusById(id);
      }

      if (!row) return;

      setFormData({
        syllabusId: row.syllabusId ?? "",
        classId: row.classId?.toString() ?? "",
        academicYear: row.academicYear ?? "",
       termId: row.termId?.toString() ?? "",
        syllabusName: row.syllabusName ?? "",
        // themeName: row.themeName ?? "",
        startDate: row.startDate ?? "",
        endDate: row.endDate ?? "",
        totalWeeks: row.totalWeeks ?? "",
        totalWorkingDays: row.totalWorkingDays ?? "",
        status: row.status ?? "",
      });

      const selectedYear = academicYears.find(
        y => y.academicYear === row.academicYear
      );

      setAcademicRange({
        startDate: selectedYear?.startDate || "",
        endDate: selectedYear?.endDate || "",
      });
    };

    initEdit();
  }, [id, location.state, academicYears]);


  const hasFieldErrors = () => {
    return Object.values(fieldErrors).some(msg => msg);
  };


  // useEffect(() => {
  //   if (!editMode && formData.academicYear && formData.classId) {
  //     checkDuplicateSyllabus(formData.academicYear, formData.classId);
  //   }
  // }, [editMode, formData.academicYear, formData.classId]);

  useEffect(() => {
    if (
      !editMode &&
      formData.academicYear &&
      formData.classId &&
      formData.startDate &&
      formData.endDate
    ) {
      checkDuplicateSyllabus(formData.academicYear, formData.classId);
    }
  }, [
    editMode,
    formData.academicYear,
    formData.classId,
    formData.startDate,
    formData.endDate
  ]);



  // const checkDuplicateSyllabus = async (academicYear, classId) => {
  //   if (!academicYear || !classId) return;

  //   try {

  //     const res = await axiosInstance.get(
  //       "/api/v1/syllabus/academic-year/class-id",
  //       {
  //         params: { academicYear, classId }
  //       }
  //     );

  //     const list = res.data?.data || [];

  //   } catch (err) {
  //     if (err.response?.status !== 404) {
  //       console.error("Duplicate check failed", err);
  //     }
  //   } finally {
  //   }
  // };

  const checkDuplicateSyllabus = async (academicYear, classId) => {
    if (!academicYear || !classId || !formData.startDate || !formData.endDate) {
      return false;
    }

    try {
      const res = await axiosInstance.get(
        "/api/v1/syllabus/academic-year/class-id",
        { params: { academicYear, classId } }
      );

      const existingList = res.data?.data || [];

      const newStart = new Date(formData.startDate);
      const newEnd = new Date(formData.endDate);

      const hasOverlap = existingList.some(s => {
        if (editMode && s.syllabusId === formData.syllabusId) {
        return false;
      }
        const existingStart = new Date(s.startDate);
        const existingEnd = new Date(s.endDate);

        return newStart <= existingEnd && newEnd >= existingStart;
      });

      if (hasOverlap) {
        setFormError(
          "A syllabus already exists for this class in the selected date range."
        );
        return true;
      }

      setFormError("");
      return false;
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Duplicate check failed", err);
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasFieldErrors()) {
      setFormError("Please fix the highlighted validation errors.");
      return;
    }

    const hasConflict = await checkDuplicateSyllabus(
      formData.academicYear,
      formData.classId
    );

    if (hasConflict) return;
    setLoading(true);

    const payload = {
      classId: Number(formData.classId),
      academicYear: formData.academicYear,
      termId: formData.termId ? Number(formData.termId) : null,
      syllabusName: formData.syllabusName,
      // themeName: formData.themeName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalWeeks: formData.totalWeeks ? Number(formData.totalWeeks) : null,
      totalWorkingDays: Number(formData.totalWorkingDays),
      status: formData.status.toUpperCase(),
    };
    try {
      let res;

      if (editMode) {
        res = await axiosInstance.put(
          `/api/v1/syllabus/${formData.syllabusId}`,
          payload
        );
      } else {
        res = await axiosInstance.post(
          "/api/v1/syllabus/create",
          payload
        );
      }
      setFormError("");
      if (editMode) {
        showNotification({
          message: "syllabus Updated successfully",
          type: "success",
        });
      }
      else {
        showNotification({
          message: "syllabus created successfully",
          type: "success",
        });
      }
      navigate("/admin/syllabus-list");
    } catch (err) {
      console.error("Save failed222:", err.response?.data?.data?.errorMessage);

      const apiError =
        err.response?.data?.data?.errorMessage ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again.";
      setFormError(apiError);
    }


    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeClass !== "ALL" &&
      !classes.some(cls => cls.classId === activeClass)
    ) {
      setActiveClass("ALL");
    }
  }, [classes, activeClass]);


  const getMaxWeeksFromDateRange = () => {
    if (!formData.startDate || !formData.endDate) return null;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end < start) return null;

    const diffTime = end - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return Math.ceil(diffDays / 7);
  };


  const renderFormFields = () => (
    <ul>

      <li>
        <div className="form-group">
          <label>
            Academic Year <span className="text-danger">*</span>
          </label>

          <select
            className="form-control"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Academic Year</option>

            {academicYears?.map((y) => {
            
              return (
                <option
                  key={y.academicYear}
                  value={y.academicYear || ""}
                >
                  {y.academicYear}
                </option>
              );
            })}
          </select>
        </div>
      </li>
      <li>
        <div className="form-group">
          <label>Class <span className="text-danger">*</span></label>
          <select
            className="form-control"
            name="classId"
            value={formData.classId || ""}
            onChange={handleChange}
            disabled={ loadingClasses}
            required
          >
            <option value="" disabled>
             Select class
            </option>

            {filteredClass
              ?.map(cls => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </option>
              ))}
          </select>
        </div>
      </li>


      <li>
        <div className="form-group">
          <label>Syllabus Name <span className="text-danger">*</span></label>
          <input
            className={`form-control }`}
            type="text"
            name="syllabusName"
            placeholder="Enter Syllabus"
            value={formData.syllabusName || ""}
            onChange={handleChange}
            required
          />
        </div>
      </li>
      {/* <li>
        <div className="form-group">
          <label>Theme Name </label>
          <input
            className={`form-control`}
            type="text"
            name="themeName"
            placeholder="Enter Theme"
            value={formData.themeName || ""}
            onChange={handleChange}
          />
        </div>
      </li> */}


      {/* {showTerm && (
        <div className="form-group">
          <label>Term ID</label>
          <input
            className="form-control"
            type="number"
            name="termId"
            value={formData.termId}
            onChange={handleChange}
          />
        </div>
      )} */}


      <li>
        <div className="form-group">
          <label>Start Date <span className="text-danger">*</span></label>
          {/* <input
            type="date"
            name="startDate"
            className="form-control"
            value={formData.startDate || ""}
            onChange={handleChange}
            min={academicRange.startDate || undefined}
            max={academicRange.endDate || undefined}
            required
          /> */}

          <input
            type="date"
            name="startDate"
            className="form-control"
            value={formData.startDate || ""}
            onChange={handleChange}
            min={!editMode ? academicRange.startDate : undefined}
            max={!editMode ? academicRange.endDate : undefined}
            required
          />

        </div>
      </li>

      <li>
        <div className="form-group">
          <label>End Date <span className="text-danger">*</span></label>
          {/* <input
            type="date"
            name="endDate"
            className={`form-control ${fieldErrors?.endDate ? "is-invalid" : ""}`}
            value={formData.endDate || ""}
            onChange={handleChange}
            min={academicRange.startDate || undefined}
            max={academicRange.endDate || undefined}
            required

          /> */}

          <input
            type="date"
            name="endDate"
            className={`form-control ${fieldErrors?.endDate ? "is-invalid" : ""}`}
            value={formData.endDate || ""}
            onChange={handleChange}
            min={!editMode ? academicRange.startDate : undefined}
            max={!editMode ? academicRange.endDate : undefined}
            required
          />
          {fieldErrors.endDate && (
            <div className="invalid-feedback d-block">
              {fieldErrors.endDate}
            </div>
          )}
        </div>

      </li>



      <li>
        <div className="form-group">
          <label>Total Weeks <span className="text-danger">*</span></label>
          <input
            className={`form-control ${fieldErrors.totalWeeks ? "is-invalid" : ""}`}
            type="number"
            name="totalWeeks"
            placeholder="Enter Weeks"
            value={formData.totalWeeks || ""}
            readOnly
            disabled
            min={1}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                handleChange(e);
                return;
              }
              if (Number(value) < 1) return;
              handleChange(e);
            }}
            required
          />
          {fieldErrors.totalWeeks && (
            <div className="invalid-feedback">{fieldErrors.totalWeeks}</div>
          )}
        </div>
      </li>

      <li>
        <div className="form-group">
          <label>Total Working Days <span className="text-danger">*</span></label>
          <input
            className={`form-control ${fieldErrors.totalWorkingDays ? "is-invalid" : ""}`}
            type="number"
            name="totalWorkingDays"
            placeholder="Enter Days"
            value={formData.totalWorkingDays || ""}
            min={1}
            readOnly
            disabled
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                handleChange(e);
                return;
              }
              if (Number(value) < 1) return;
              handleChange(e);
            }}
            required
          />
          {fieldErrors.totalWorkingDays && (
            <div className="invalid-feedback">{fieldErrors.totalWorkingDays}</div>
          )}
        </div>
      </li>


      <li>
        <div className="form-group">
          <label>Status *</label>
          <select
            className="form-control"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </li>

      {/* <li>
        <FileUpload
                name="childPhoto"
                label="Child Photo"
                file={studentDocuments.childPhoto}
                uploadStatus={uploadStatus.childPhoto}
                error={errors.childPhoto}
                onChange={(e) => handleFileUpload(e, "childPhoto", "CANDIDATE")}/>
      </li> */}
    </ul>
  );


  /* ---------------- UI ---------------- */
  return (
    <div className="container syllabus-master">

      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/syllabus-list")}
        >
          Syllabus List
        </button>
      </div>


      {formError && (
        <div className="alert alert-danger mb-3">
          {formError}
        </div>
      )}

      <div className="whitebox">
        <form
          id="syllabus-form"
          className="formbox searchsec stapform"
          onSubmit={handleSubmit}
        >
          {renderFormFields()}

          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || hasFieldErrors()}
            >
              {loading
                ? "Saving..."
                : editMode
                  ? "Update Syllabus"
                  : "Create Syllabus"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin/syllabus-list")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

    </div>
  );

}

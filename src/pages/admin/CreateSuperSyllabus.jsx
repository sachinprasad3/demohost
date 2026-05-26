import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useClasses from '../../hooks/useClasses';
import axiosInstance from '../../utills/axiosInstance';
import { useNotification } from '../../context/NotificationContext';
import { useGetAllClasses } from '../../services/teachingPlan.services';
const initialForm = {
  syllabusId: "",
  classId: "",
  syllabusName: "",
  totalWeeks: "",
  totalWorkingDays: "",
  status: "ACTIVE",
};
const CreateSuperSyllabus = () => {
    const navigate = useNavigate();
      const [formData, setFormData] = useState(initialForm);
     const [formError, setFormError] = useState("");
      const [fieldErrors, setFieldErrors] = useState({});
  const { data:classes, loading: loadingClasses } = useGetAllClasses();
const location = useLocation()
  
const {showNotification} = useNotification()
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  
   const fetchSyllabusById = async (id) => {
    try {
      const res = await axiosInstance.get(`/api/v1/supersyllabusmaster/id?id=${id}`);
      console.log("res from fetchsyllabusid",res)
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
        syllabusId: row.id ?? "",
        classId: row.classId?.toString() ?? "",
        
        syllabusName: row.syllabusName ?? "",
        // themeName: row.themeName ?? "",
        
        totalWeeks: row.totalWeek ?? "",
        totalWorkingDays: row.totalDays ?? "",
        status: row.status ?? "",
      });

    };

    initEdit();
  }, []);

  const validateTotals = (weeks, days) => {
  const errors = {};

  if (weeks && days) {
    if (days > weeks * 7) {
      errors.totalWorkingDays = `Working days cannot exceed  ${weeks * 7} days.`;
    }

    if (weeks < Math.ceil(days / 7)) {
      errors.totalWeeks = "Total weeks are too small for given working days.";
    }
  }

  return errors;
};

const handleChange = (e) => {
  const { name, value } = e.target;

  const updatedForm = { ...formData, [name]: value };

  const errors = validateTotals(
    Number(updatedForm.totalWeeks),
    Number(updatedForm.totalWorkingDays)
  );

  setFieldErrors(errors);
  setFormError("");
  setFormData(updatedForm);
};

const hasFieldErrors = () => {
    return Object.values(fieldErrors).some(msg => msg);
  };
const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasFieldErrors()) {
      setFormError("Please fix the highlighted validation errors.");
      return;
    }

    // const hasConflict = await checkDuplicateSyllabus(
    //   formData.academicYear,
    //   formData.classId
    // );

    // if (hasConflict) return;
    setLoading(true);

    const payload = {
      id:formData?.syllabusId?formData?.syllabusId:null,
      classId: Number(formData.classId),
    //   academicYear: formData.academicYear,
    //   termId: formData.termId ? Number(formData.termId) : null,
      syllabusName: formData.syllabusName,
      // themeName: formData.themeName,
    //   startDate: formData.startDate,
    //   endDate: formData.endDate,
      totalWeek: formData.totalWeeks ? Number(formData.totalWeeks) : null,
      totalDays: Number(formData.totalWorkingDays),
      status: formData.status.toUpperCase(),
    };
    try {
      let res;

      // if (editMode) {
        // res = await axiosInstance.post(
        //   `/api/v1/syllabus/${formData.syllabusId}`,
        //   payload
        // );
      // } else {
        res = await axiosInstance.post(
          "/api/v1/supersyllabusmaster/",
          payload
        );
      // }
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
      navigate("/admin/super-syllabus-list");
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

    const renderFormFields = () => (
    <ul>

      
      <li>
        <div className="form-group">
          <label>Class <span className="text-danger">*</span></label>
          <select
            className="form-control"
            name="classId"
            value={formData.classId || ""}
            onChange={handleChange}
            disabled={loadingClasses || editMode}
            required
          >
            <option value="" disabled>Select Class</option>

            {classes
              ?.filter(cls => cls.active === "Y")
              .map(cls => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </option>
              ))}
          </select>
        </div>
      </li>


 {/* <li>
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
      </li> */}

      <li>
        <div className="form-group">
          <label>Total Weeks <span className="text-danger">*</span></label>
          <input
            className={`form-control ${fieldErrors.totalWeeks ? "is-invalid" : ""}`}
            type="number"
            name="totalWeeks"
            placeholder="Enter Weeks"
            value={formData.totalWeeks || ""}
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

      
    </ul>
  );
  return (
     <div className="container syllabus-master">

      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/super-syllabus-list")}
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

          <div className="d-flex gap-2 p-0 mt-1">
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
              onClick={() => navigate("/admin/super-syllabus-list")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}

export default CreateSuperSyllabus

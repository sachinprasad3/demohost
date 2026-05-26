// TeacherMasterForm.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { get, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "../../../../utills/axiosInstance";
import { teacherSchema } from "../../../../validations/teacherMaster.schema";
import Popup from "../../../../components/Popup";
import FileUpload from "../../../../components/AmissionFormComponents/customField/FileUpload";
import { Check, X } from "lucide-react";

/* --- CONSTANTS --- */
const SCHOOL_ID = "SCH001";

/* --- OPTIONS --- */
const TEACHING_DESIGNATIONS = [
  "Principal", "Vice Principal", "Head Mistress/Master", "Class Teacher",
  "Subject Teacher", "Nursery Teacher", "Playgroup Teacher", "Assistant Teacher",
  "Special Educator", "Librarian", "Art & Craft Teacher", "Music/Dance Teacher", "Others"
];

const NON_TEACHING_DESIGNATIONS = [
  "School Manager", "Administrator", "Accountant", "Front Desk Executive",
  "Office Assistant", "Nurse/Medical Attendant", "Caregiver/Nanny", "Security Guard",
  "Driver", "Peon/Multi-task Staff", "Others"
];

const QUALIFICATION_OPTIONS = [
  "B.Ed","D.Ed","NTT (Nursery Teacher Training)","Montessori Training",
  "B.A","B.Sc","M.A","M.Sc","High School","Others"
];

const SPECIALIZATION_OPTIONS = [
  "Child Psychology","Early Childhood Care","Mathematics","Science",
  "Languages","Arts & Crafts","Physical Education","Music","General","Others"
];

const EDUCATIONAL_DOC_TYPES = [
  "10th Certificate",
  "12th Certificate",
  "Graduation Degree",
  "Post Graduation Degree",
  "B.Ed Certificate",
  "M.Ed Certificate",
  "Diploma Certificate",
  "Others"
];

export default function TeacherMasterForm({ onSuccess }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const teacherToEdit = state?.teacher || null;
  const isEdit = Boolean(teacherToEdit);

  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [photo, setPhoto] = useState({ file: null, name: "" });
  const [aadhar, setAadhar] = useState({ file: null, name: "" });
  const [educationalDocs, setEducationalDocs] = useState([
    { type: "", otherType: "", file: null, name: "" }
  ]);
  const [loadingMessage, setLoadingMessage] = useState("");

  const getAvailableOptions = (currentIndex) => {
    const selectedTypes = educationalDocs
      .filter((doc, idx) => idx !== currentIndex && doc.type !== "Others")
      .map((doc) => doc.type);

    return EDUCATIONAL_DOC_TYPES.filter(opt => !selectedTypes.includes(opt));
  };

  const handleAddEduDoc = () => {
    setEducationalDocs([...educationalDocs, { type: "", otherType: "", file: null, name: "" }]);
  };

  const updateEduDoc = (index, field, value) => {
    const updated = [...educationalDocs];
    updated[index][field] = value;
    setEducationalDocs(updated);
  };

  const handleEduFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      updateEduDoc(index, "file", file);
      updateEduDoc(index, "name", file.name);
    }
  };

  const getLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};


  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(teacherSchema),
    context: { isNew: !isEdit },
    defaultValues: {
      joiningDate: getLocalDate(),
      effectiveFrom: getLocalDate(),
      schoolId: SCHOOL_ID,
      active: "Y"
    }
  });

  const selectedDesignation = watch("designation");
  const selectedQualification = watch("qualification");
  const selectedSpecialization = watch("specialization");

  /* --- Populate Form on Edit --- */
  useEffect(() => {
    if (!teacherToEdit) return;
    const allDesignations = [...TEACHING_DESIGNATIONS, ...NON_TEACHING_DESIGNATIONS];

    const des = allDesignations.includes(teacherToEdit.desfileignation) ? teacherToEdit.designation : "Others";
    const qual = QUALIFICATION_OPTIONS.includes(teacherToEdit.qualification) ? teacherToEdit.qualification : "Others";
    const spec = SPECIALIZATION_OPTIONS.includes(teacherToEdit.specialization) ? teacherToEdit.specialization : "Others";

    const existingDocs = teacherToEdit.documents || [];

    const photoDoc = existingDocs.find(d => d.documentName === "TEACHER_PHOTO");
    if (photoDoc) {
      setPhoto({ file: photoDoc.storagePath, name: photoDoc.fileName, url: photoDoc.storagePath });
    }

    const aadharDoc = existingDocs.find(d => d.documentName === "TEACHER_AADHAAR");
    if (aadharDoc) {
      setAadhar({ file: aadharDoc.storagePath, name: aadharDoc.fileName, url: aadharDoc.storagePath });
    }

    const eduDocMapping = {
      "10TH_CERTIFICATE": "10th Certificate",
      "12TH_CERTIFICATE": "12th Certificate",
      "GRADUATION_CERTIFICATE": "Graduation Degree",
      "PG_CERTIFICATE": "Post Graduation Degree",
      "B.ED_CERTIFICATE": "B.Ed Certificate",
      "M.ED_CERTIFCATE": "M.Ed Certificate",
      "DIPLOMA_CERTIFICATE": "Diploma Certificate",
      "OTHER_CERTIFICATE": "Others"
    };

    const formattedEduDocs = existingDocs
      .filter(d => !["TEACHER_PHOTO", "TEACHER_AADHAAR"].includes(d.documentName))
      .map(d => ({
        type: eduDocMapping[d.documentName] || "Others",
        otherType: d.documentName === "OTHER_CERTIFICATE" ? d.remarks : "",
        file: d.storagePath,
        name: d.fileName,
        url: d.storagePath // Store the URL to show a 'View' link
      }));

    if (formattedEduDocs.length > 0) {
      setEducationalDocs([...formattedEduDocs, { type: "", otherType: "", file: null, name: "" }]);
    }

    reset({
      ...teacherToEdit,
      dateOfBirth: teacherToEdit.dateOfBirth?.split("T")[0] || "",
      joiningDate: teacherToEdit.joiningDate?.split("T")[0] || "",
      effectiveFrom: teacherToEdit.effectiveFrom?.split("T")[0] || "",
      effectiveTo: teacherToEdit.effectiveTo?.split("T")[0] || "",
      designation: des,
      designationOther: des === "Others" ? teacherToEdit.designation : "",
      qualification: qual,
      qualificationOther: qual === "Others" ? teacherToEdit.qualification : "",
      specialization: spec,
      specializationOther: spec === "Others" ? teacherToEdit.specialization : "",
    });
  }, [teacherToEdit, reset]);

  useEffect(() => {
    if (!submitError) return;

    const timer = setTimeout(() => {
      setSubmitError(null);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer); // cleanup on re-render/unmount
  }, [submitError]);


  /* --- Submit --- */
  const getApiErrorMessage = (err) => {
    return (
      err?.response?.data?.data?.errorMessage ||
      err?.response?.data?.message ||
      "Something went wrong. Please try again."
    );
  };

  const calculateAcademicYear = () => {
    // 1. Get current time
    const now = new Date();

    // 2. Convert to IST (UTC + 5.30)
    // getTimezoneOffset() is in minutes, so we convert everything to milliseconds
    const ISTOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + ISTOffset);

    const month = istDate.getMonth() + 1;
    const year = istDate.getFullYear();

    // 3. April (4) to March (3) cycle
    if (month >= 4) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoadingMessage("Saving Teacher Information...");

    try {
      // --- STEP 1: SAVE TEACHER ---
      const payload = {
        ...data,
        schoolId: SCHOOL_ID,
        designation: data.designation === "Others" ? data.designationOther : data.designation,
        qualification: data.qualification === "Others" ? data.qualificationOther : data.qualification,
        specialization: data.specialization === "Others" ? data.specializationOther : data.specialization,
      };

      const teacherRes = await axiosInstance.post("/api/teachers", payload);
      const savedTeacher = teacherRes.data.data;
      const teacherId = savedTeacher.teacherId;

      // --- STEP 2: UPLOAD DOCUMENTS ---
      const filesToUpload = [];
      const metadata = [];
      const acYear = calculateAcademicYear();

      // Helper to push to upload arrays
      const prepareDoc = (file, docName, remarks = null) => {
        if (!file || typeof file === 'string') return;
        filesToUpload.push(file);
        metadata.push({
          ownerId: teacherId,
          ownerType: "TEACHER",
          documentStage: "OTHERS",
          academicYear: acYear,
          documentName: docName,
          remarks: remarks // Added remarks to metadata
        });
      };

      // 1. Photo and Aadhar
      prepareDoc(photo.file, "TEACHER_PHOTO", "TEACHER_PHOTO");
      prepareDoc(aadhar.file, "TEACHER_AADHAAR", "TEACHER_AADHAAR");

      // 2. Educational Documents with dynamic Remarks
      educationalDocs.forEach(doc => {
        if (doc.file && doc.type) {
          // This mapping MUST match the 'document_name' column in your SQL exactly
          const mapping = {
            "10th Certificate": "10TH_CERTIFICATE",
            "12th Certificate": "12TH_CERTIFICATE",
            "Graduation Degree": "GRADUATION_CERTIFICATE",
            "Post Graduation Degree": "PG_CERTIFICATE",
            "B.Ed Certificate": "B.ED_CERTIFICATE",
            "M.Ed Certificate": "M.ED_CERTIFCATE", // Matches your SQL typo 'CERTIFCATE'
            "Diploma Certificate": "DIPLOMA_CERTIFICATE",
          };

          let docNameValue = "";
          if (doc.type === "Others") {
            docNameValue = "OTHER_CERTIFICATE"; // Code 13 in your SQL
          } else {
            docNameValue = mapping[doc.type] || "OTHER_CERTIFICATE";
          }

          // IMPORTANT: docNameValue goes into 'documentName' so the backend 
          // can find the storage path in the database.
          prepareDoc(doc.file, docNameValue, doc.type === "Others" ? doc.otherType : docNameValue);
        }
      });

      if (filesToUpload.length > 0) {
        setLoadingMessage("Uploading Documents...");
        const formData = new FormData();

        formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
        filesToUpload.forEach(file => formData.append("files", file));

        await axiosInstance.post("/api/admissions/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setSuccessData({
        isEdit,
        fullName: savedTeacher.fullName,
        username: savedTeacher.userName,
        password: savedTeacher.userPassword
      });

    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handlePopupClose = () => {
    setSuccessData(null);
    if (onSuccess) onSuccess();
    navigate("/admin/teachers");
  };

  


  // const todayDate = new Date().toISOString().split("T")[0];
  const todayDate = getLocalDate();

  const maxDobDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return getLocalDate(d);
  })();

  const handleCancel = () => {
    navigate(-1); // go back to previous screen
  };

  // 1. Get today's date for ADD mode restriction
  const todayStr = getLocalDate();

  // 2. Logic for Joining Date "min" attribute
  const minJoiningDate = isEdit && teacherToEdit?.joiningDate 
    ? teacherToEdit.joiningDate.split("T")[0] 
    : todayStr;

  // 3. Logic for Effective From "min" attribute
  const minEffectiveFrom = isEdit && teacherToEdit?.effectiveFrom 
    ? teacherToEdit.effectiveFrom.split("T")[0] 
    : todayStr;

  const handleNumericInput = (e) => {
    // Replace anything that is not a digit with an empty string
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  };

  const handleSalaryInput = (e) => {
    let val = e.target.value;

    // 1. Remove any character that isn't a digit or a dot
    val = val.replace(/[^0-9.]/g, "");

    // 2. Prevent starting with a dot (e.g., .50 -> 50)
    if (val.startsWith(".")) {
      val = val.substring(1);
    }

    if (val.length > 1 && val.startsWith("0") && val[1] !== ".") {
      val = val.replace(/^0+/, "");
    }

    // 3. Prevent multiple dots (e.g., 10.5.5 -> 10.55)
    const parts = val.split(".");
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }

    // 4. Limit to 2 decimal places (scale = 2)
    if (parts.length === 2 && parts[1].length > 2) {
      val = parts[0] + "." + parts[1].substring(0, 2);
    }

    e.target.value = val;
  };


  return (
    <div className="container">
      <div className="addfee-head">
        <button className="btn btn-primary" onClick={() => navigate("/admin/teachers")}>
          Teacher List
        </button>
      
{submitError && (
          <div className="alert alert-danger">
            {submitError}
          </div> 
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="whitebox">
          <h4>Basic Information</h4>
           <div className="formbox stapform">
            <ul>

              <li className="fullsec">
                <div className="form-group">
                  <label>Full Name *</label>
                <input className="form-control" {...register("fullName")} placeholder="Enter full name" />  
                {errors.fullName &&<div className="invalid-feedback d-block">{errors.fullName?.message}</div>}
                </div>
              </li>
                <li>
                  <div className="form-group"> 
                    <label>Gender <span className="text-danger">*</span></label>
                    <select className="form-control" {...register("gender")}>
                      <option value="">Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select> 
                    {errors.gender && <div className="invalid-feedback d-block">{errors.gender?.message}</div>}
                  </div>
                </li> 
                <li>
                  <div className="form-group">
                    <label>Date of Birth <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      {...register("dateOfBirth")}
                      max={maxDobDate} // Cannot be future
                    />
                    {errors.dateOfBirth && <div className="invalid-feedback d-block" >{errors.dateOfBirth?.message}</div>}
                  </div>
                </li>

                {/* Phone */}
                <li>
                  <div className="form-group">
                    <label>Phone <span className="text-danger">*</span></label>
                  <input className="form-control" {...register("phone")} maxLength={10} placeholder="10 digit mobile no"
                    onInput={handleNumericInput} />
                    {errors.phone &&<div className="invalid-feedback d-block" >{errors.phone?.message}</div>}
                  </div>
                </li>

                {/* Email */}
                <li>
                  <div className="form-group">
                    <label>Email <span className="text-danger">*</span></label>
                    <input className="form-control" {...register("email")} placeholder="example@email.com" />
                    {errors.email && <div className="invalid-feedback d-block" >{errors.email?.message}</div>}
                  </div>
                </li>
              
                
                {/* Staff Type */}
                <li>
                  <div className="form-group">
                    <label>Staff Type <span className="text-danger">*</span></label>
                    <select className="form-control" {...register("staffType")}>
                      <option value="">Select</option>
                      <option value="TEACHING">Teaching</option>
                      <option value="NON_TEACHING">Non-Teaching</option>
                    </select>
                   {errors.staffType && <div className="invalid-feedback d-block" >{errors.staffType?.message}</div>}
                  </div>
                </li>

              {/* Designation */}
              <li>
                <div className="form-group">
                  <label>Designation <span className="text-danger">*</span></label>
                  <select className="form-control" {...register("designation")} disabled={!watch("staffType")} >
                    <option value="">Select</option>
                    {watch("staffType") === "TEACHING" &&
                      TEACHING_DESIGNATIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}

                    {watch("staffType") === "NON_TEACHING" &&
                      NON_TEACHING_DESIGNATIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {errors.designation && <div className="invalid-feedback d-block" >{errors.designation?.message}</div>}
                </div>
              </li>
              {selectedDesignation === "Others" && (
                <li>
                  <div className="form-group">
                    <input
                      className="form-control"
                      placeholder="Enter specific designation"
                      {...register("designationOther")}
                    />
                  </div>
                  {selectedDesignation === "Others" && <div className="invalid-feedback d-block" >{errors.designationOther?.message}</div>}
                </li>
              )}

              {/* Qualification */}
              <li>
                <div className="form-group">
                  <label>Qualification <span className="text-danger">*</span></label>
                  <select className="form-control" {...register("qualification")}>
                    <option value="">Select</option>
                    {QUALIFICATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {errors.qualification && <div className="invalid-feedback d-block" >{errors.qualification?.message}</div>}
                </div>
              </li>
              {selectedQualification === "Others" && (
                <li>
                  <div className="form-group">
                    <input
                      className="form-control"
                      placeholder="Enter specific qualification"
                      {...register("qualificationOther")}
                    />

                    {selectedQualification === "Others" && errors.qualificationOther && (<div className="invalid-feedback d-block" >{errors.qualificationOther?.message}</div>)}
                  </div>
                </li>
              )}

              {/* Specialization */}
              <li>
                <div className="form-group">
                  <label>Specialization <span className="text-danger">*</span></label>
                  <select className="form-control" {...register("specialization")}>
                    <option value="">Select</option>
                    {SPECIALIZATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {errors.specialization && <div className="invalid-feedback d-block" >{errors.specialization?.message}</div>}
                </div>
              </li>

              {selectedSpecialization === "Others" && (
                <li>
                  <div className="form-group">
                    <input
                      className="form-control"
                      placeholder="Enter specific specialization"
                      {...register("specializationOther")}
                    />
                    {selectedSpecialization === "Others" && errors.specializationOther && (<div className="invalid-feedback d-block" >{errors.specializationOther?.message}</div>)}
                  </div>

                </li>
              )}

              <li>
                <div className="form-group">
                  <label>Basic Salary <span className="text-danger">*</span></label>
                  <input className="form-control" {...register("basicSalary")} placeholder="Enter Basic Salary" onInput={handleSalaryInput} />
                  {errors.basicSalary && <div className="invalid-feedback d-block" >{errors.basicSalary?.message}</div>}
                </div>
              </li>

              {/* Joining Date */}
              <li>
                <div className="form-group">
                  <label>Joining Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" {...register("joiningDate")} 
                  //  min={minJoiningDate} 
                   />
                  {errors.joiningDate && <div className="invalid-feedback d-block" >{errors.joiningDate?.message}</div>}
                </div>
              </li>

              {/* Effective From */}
              <li>
                <div className="form-group">
                  <label>Effective From <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    {...register("effectiveFrom")}
                    // min={minEffectiveFrom}
                  />
                  {errors.effectiveFrom && <div className="invalid-feedback d-block" >{errors.effectiveFrom?.message}</div>}
                </div>
              </li>

              {/* Effective To */}
              <li>
                <div className="form-group">
                  <label>Effective To <span className="text-muted">(Optional)</span></label>
                  <input
                    type="date"
                    className="form-control"
                    {...register("effectiveTo")}
                    // min={todayDate}
                  />
                  {errors.effectiveTo && <div className="invalid-feedback d-block" >{errors.effectiveTo?.message}</div>}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="whitebox mt-4">
          <h4>Documents Upload</h4>
          <div className="formbox stapform">
            <ul>
            
              <li className="fullsec">
                <FileUpload
                  label="Teacher Photo"
                  file={photo}
                  onChange={(e) => setPhoto({ file: e.target.files[0], name: e.target.files[0].name })}
                  accept="image/*"
                />
              </li>

             
              <li className="fullsec">
                <FileUpload
                  label="Aadhar Card (PDF/Image)"
                  file={aadhar}
                  onChange={(e) => setAadhar({ file: e.target.files[0], name: e.target.files[0].name })}
                  accept=".pdf,image/*"
                />
              </li>
            </ul>

            <hr />
            <h5>Educational Documents</h5>
            <ul>
              {educationalDocs.map((doc, index) => (
                <li
                  key={index}
                  className="fullsec mb-4 p-3 border rounded bg-light position-relative"
                >
                 
                  <div className="d-flex justify-content-between align-items-center mb-2">

                    {educationalDocs.length > 1 && (
                      <div className="actionbtns">
                        <button
                          type="button"
                          className="delete-btn"
                          style={{
                            cursor: 'pointer',
                            zIndex: 10,
                            position: 'relative' // Ensures it stays above other elements in mobile
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            setEducationalDocs(educationalDocs.filter((_, i) => i !== index));
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="row">
                   
                    <div>
                      <div className="form-group">
                        <label>Document Type</label>
                        <select
                          className="form-control"
                          value={doc.type}
                          onChange={(e) => updateEduDoc(index, "type", e.target.value)}
                        >
                          <option value="">Select Type</option>
                          {getAvailableOptions(index).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {doc.type === "Others" && (
                        <div className="form-group mt-2">
                          <input
                            className="form-control"
                            placeholder="Specify document name"
                            value={doc.otherType}
                            onChange={(e) => updateEduDoc(index, "otherType", e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                   
                    <div  >
                      <FileUpload
                        label={doc.url ? "Update File (Optional)" : "Upload File"}
                        file={{ file: doc.file, name: doc.name }}
                        onChange={(e) => handleEduFileChange(index, e)}
                        accept=".pdf,image/*"
                      />
                      {doc.url && !doc.file && (
                        <div className="mt-1">
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-primary small">
                            <i className="fa fa-eye"></i> View Current Document
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>


            {(educationalDocs[educationalDocs.length - 1].file || educationalDocs[educationalDocs.length - 1].url) && (
              <button
                type="button"
                className="btn btn-secondary mt-2"
                onClick={handleAddEduDoc}
              >
                + Add New Document
              </button>
            )}
          </div>
        </div>

        <div className="form-group text-left text-center">
          <div className="btn-inline d-flex gap-3 justify-content-center">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isLoading}
              style={{ padding: "10px 32px" }}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ padding: "10px 32px" }}
            >
              {isLoading ? (
                <span>
                  <i className="fa fa-spinner fa-spin mr-2"></i> {loadingMessage || "Saving..."}
                </span>
              ) : (
                isEdit ? "Update Teacher" : "Submit"
              )}
            </button>
          </div>


            {/* <button type="button" className="btn btn-primary" onClick={onCancel}>
                        Cancel
                    </button> */}
          </div>
         
        


      </form>

      {/* --- SUCCESS POPUP --- */}
      {successData && (
        <Popup
          title="Success"
          closeOnOutsideClick={false}
          onClose={handlePopupClose}
          onSave={handlePopupClose}
          saveText="OK"
          // Hide reset button
          onReset={null}
        >
          <div className="text-center">
            <div className="tex-success"><Check size={40} /></div>
            <h3> {successData.isEdit ? "Teacher Updated Successfully!" : "Teacher Added Successfully!"}  </h3>

            <div>Teacher <strong>{successData.fullName}</strong> has been saved.</div>

            {/* Only show credentials for NEW teachers */}
            {!successData.isEdit && successData.username && (
              <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", marginTop: "15px", textAlign: "left", border: "1px solid #dee2e6" }}>
                <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Login Credentials:</strong></p>
                <p style={{ margin: "5px 0" }}>User Name: <strong style={{ color: "#007bff" }}>{successData.username}</strong></p>
                <p style={{ margin: "5px 0" }}>Password: <strong style={{ color: "#007bff" }}>{successData.password}</strong></p>
                <small className="text-muted">Please share these credentials with the teacher.</small>
              </div>
            )}
          </div>
        </Popup>
      )}

    </div>
  );
}


import { Loader } from "lucide-react";
import useAdmissionFormContext from "../../hooks/useAdmissionFormContext";
import { Placeholder } from "react-bootstrap";
import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../utills/axiosInstance";
import { X } from "lucide-react";
import Select from "./customField/Select";
import Input from "./customField/Input";
import { sanitizeValue } from "./hooks/AdmissionHeleperFunction";
import useAcademicYears from "../../hooks/useAcademicYears";
const Step0StudentDetails = React.memo(({ errors, clearFieldError, admissionContextErrors, clearSiblingFieldError, setFieldError }) => {
  const { formData, updateFormData, AdmissionContextLoading, languages, setLanguages, siblings, setSiblings, setHasSibling, hasSibling } = useAdmissionFormContext();
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)

  const options = [
    { label: "Newspaper Ad", value: "NEWSPAPER_AD" },
    { label: "Banner", value: "BANNER" },
    { label: "Mailer", value: "MAILER" },
    { label: "TV", value: "TV" },
    { label: "Friends", value: "FRIENDS" },
    { label: "Sibling", value: "SIBLING" },
    { label: "Word of Mouth", value: "WORD_OF_MOUTH" },
    { label: "Live in the Area", value: "LIVE_IN_THE_AREA" },
    { label: "Others", value: "OTHERS" }
  ];
  const { academicYears } = useAcademicYears()


  // const today = new Date();
  const today = new Date();

  const maxDobDate = new Date(
    today.getFullYear(),
    today.getMonth() - 30, // 30 months = 2.5 years
    today.getDate()
  );

  // format as YYYY-MM-DD in local time
  const maxDob = [
    maxDobDate.getFullYear(),
    String(maxDobDate.getMonth() + 1).padStart(2, "0"),
    String(maxDobDate.getDate()).padStart(2, "0"),
  ].join("-");



  const LANGUAGE_OPTIONS = ["English", "Hindi", "Other"];
  const selectedLanguages = languages?.map(l => l.language) || [];
  const [otherLanguage, setOtherLanguage] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  // console.log("activeAcademicYear",activeAcademicYear)


  // const LANGUAGE_OPTIONS = ["English", "Hindi", "Other"];
  const remainingLanguages = LANGUAGE_OPTIONS.filter(
    lang => !languages.some(l => l.language === lang)
  );

  const classesOptions = classes.map((cls) => ({ label: cls.className, value: cls.classId }))

  const genderOptions = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Other", value: "OTHER" }
  ]

  const BLOOD_GROUPS = [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" }
  ];

  const AcademicYear = ["2025-2026", "2026-2027"]


  const handleChange = (e, allow, maxLength) => {
    const { name, value } = e.target;
    let cleanValue = value
    if (allow && maxLength) {

      cleanValue = sanitizeValue(value, allow, maxLength);
    }
      if (name === "dateOfBirth") {
    const year = value.split("-")[0];

    if (year.length > 4) return; // block if more than 4 digits
  }

    updateFormData(name, cleanValue)
    clearFieldError(name);
  }

  const fetchClasses = useCallback(
    async () => {
      if(!formData?.admissionYear) return
    try {
      setLoading(true);
      
      const res = await axiosInstance.get(
        `/api/v1/class/getAllClassesByAcademicYear?academicYear=${formData?.admissionYear ??""}`
      );
console.log("res from fetch classes",res)

      setClasses(res.data?.data || res.data || []);

    } catch (err) {

      console.error("error in fetching classes", err)

    } finally {

      setLoading(false);

    }
  },[formData?.admissionYear])

  useEffect(() => {
    fetchClasses()
  }, [formData?.admissionYear,fetchClasses])

  if (loading) {
    return <Loader />
  }
  return (
    <>
      <section className="whitebox">
        <h4>Applicant’s Details</h4>

        <div className="formbox stapform">
          <ul>
             <li>

              <Select
  name="admissionYear"
  label="Academic Year"
  required
  value={formData.admissionYear ?? ""}
  options={academicYears?.map(year => ({
    label: year.academicYear,
    value: year.academicYear,
  }))}
  placeholder="Select Academic Year"
  error={errors?.admissionYear}
  disabled={formData?.studentId}

  onChange={(e) => {
    const { name, value } = e.target;

    updateFormData(name, value);
    updateFormData("classId", null); // reset dependent field
    clearFieldError(name);
  }}
/>


            </li>

            <li className="fullsec">
              <Select name="classId" label="Class Name" required value={formData.classId ?? ""} options={classesOptions} placeholder="Select Class" error={errors?.classId}
                onChange={(e) => {
                  const { name, value } = e.target;
                  updateFormData(name, Number(value))


                  clearFieldError("classId");
                }}
                disabled={!formData?.admissionYear || formData?.studentId}
              />
            </li>


            <li className="fullsec">
              <Input name="studentFirstName" label="First Name" placeholder="Enter First Name" required value={formData.studentFirstName} error={errors.studentFirstName}

                onChange={(e) => handleChange(e, "alpha", 20)}

              />
            </li>


            <li>
              <Input name="studentMiddleName" label="Middle Name" placeholder="Enter Middle Name" value={formData.studentMiddleName} error={errors.studentMiddleName}

                onChange={(e) => handleChange(e, "alpha", 20)}

              />
            </li>

            <li>
              <Input name="studentLastName" label="Last Name" placeholder="Enter Last Name" required value={formData.studentLastName} error={errors.studentLastName}

                onChange={(e) => handleChange(e, "alpha", 20)}

              />

            </li>


            <li>

              <Select name="gender" label="Gender" required value={formData.gender ?? ""} options={genderOptions} placeholder="Select Gender" error={errors?.gender}

                onChange={(e) => handleChange(e)}
              />
            </li>

            <li>
              <Input name="dateOfBirth" label="Date of Birth" type="date" required  value={formData.dateOfBirth} error={errors.dateOfBirth}

                onChange={(e) => handleChange(e)}
              />
            </li>
            <li>
              <Input name="placeOfBirth" label="Place of Birth" placeholder="Enter Place of Birth" required value={formData.placeOfBirth} error={errors.placeOfBirth}

                onChange={(e) => handleChange(e, "alpha", 30)}

              />
            </li>


            <li>
              <Select name="nationality" label="Nationality" value={formData.nationality ?? ""} options={[{ label: "Indian", value: "indian" }]} placeholder="Enter Nationality" error={errors.nationality}

                onChange={(e) => handleChange(e)}
              />
            </li>

            <li>
              <Input name="heightInInches" label="Height (cm)" placeholder="Enter Height in (cm)" required value={formData.heightInInches} error={errors.heightInInches}

                onChange={(e) => handleChange(e, "numeric", 3)}

              />
            </li>
            <li>
              <Input name="weightInKg" label="Weight (kg)" placeholder="Enter Weight in (kg)" required value={formData.weightInKg} error={errors.weightInKg}

                onChange={(e) => handleChange(e, "numeric", 3)}

              />
            </li>

            <li>

              <Select name="bloodGroup" label="Blood Group" required value={formData.bloodGroup ?? ""} options={BLOOD_GROUPS} placeholder="Select" error={errors?.bloodGroup}

                onChange={(e) => handleChange(e)}
              />

            </li>
           



            <li className="fullsec">
              <Input name="languageSpokenHome" label="Language(s) spoken at home" placeholder="Enter Language" required value={formData.languageSpokenHome} error={errors.languageSpokenHome}

                onChange={(e) => handleChange(e, "alpha", 10)}

              />
            </li>
            <li className="fullsec">
              <Input name="previousSchoolAttended" label="Previous School" placeholder="Enter Previous School" value={formData.previousSchoolAttended} error={errors.previousSchoolAttended}

                onChange={(e) => handleChange(e, "alphanumeric", 50)}
              />
            </li>
            <li className="fullsec">
              <Input name="email" label="Email" placeholder="Enter Email" value={formData.email} error={errors.email}

                onChange={(e) => handleChange(e)}
              />
            </li>



          </ul>
        </div>
      </section>
      <section className="whitebox">
        <div className="checklist">
          <h4>How did you get to know of “Play School”?</h4>
          <div className="msf-reviewbox">
            <select
              className="form-control"
              name="sourceAboutSchool"
              value={formData.sourceAboutSchool ?? ""}
              required

              onChange={(e) => handleChange(e)}
            >
              <option value="" disabled>Select source</option>

              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

        </div>

      </section>
      <section className="whitebox">
        <h4>Languages Known by the Child<span class="text-danger">*</span></h4>
        <div className="formbox stapform langcheck">
          <ul>
            {languages.map((lang) => (

              <li className="fullsec">
                <div key={lang.language} className=" checkboxs">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>{lang.language}</strong>
                    <button type="button" className="crossbtn"
                      onClick={() => {
                        const updated = languages.filter(l => l.language !== lang.language); setLanguages(updated);
                        updateFormData("languagesKnown", updated);
                      }} >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Skills */}
                  <div className="flexbox">
                    {["understand", "speak", "write"].map(type => (
                      <label key={type} className="form-check d-flex align-items-center gap-2" >
                        <input type="checkbox" className="form-check-input"
                          checked={lang.skills.includes(type)}
                          onChange={(e) => {
                            const updatedLanguages = languages.map(item =>
                              item.language === lang.language

                                ? {
                                  ...item,
                                  skills: e.target.checked
                                    ? [...item.skills, type]
                                    : item.skills.filter(v => v !== type)
                                }
                                : item
                            );

                            setLanguages(updatedLanguages);
                            updateFormData("languagesKnown", updatedLanguages)

                            clearFieldError("languagesKnown", updatedLanguages);
                          }}
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </li>
            ))}

            {/* OTHER LANGUAGE INPUT */}
            {showOtherInput && languages.length < 3 && (
              <li className="fullsec">
                <div className="d-flex gap-2 mt-2">
                  <div className="flex-grow-1">
                    <Input name="otherLanguage" placeholder="Enter language name" value={otherLanguage}
                      onChange={(e) => {
                        const { name, value } = e.target
                        const clean = sanitizeValue(value, "alpha", 20);
                        setOtherLanguage(clean);
                      }}
                    />
                  </div>

                  <button type="button" className="btn addbtn" disabled={!otherLanguage.trim()}
                    onClick={() => {
                      const lang = otherLanguage.trim();

                      // prevent duplicates (case-insensitive)
                      if (languages.some(l => l.language.toLowerCase() === lang.toLowerCase())) {
                        return;
                      }

                      const updated = [
                        ...languages,
                        { id: Date.now(), language: lang, skills: [] }
                      ];

                      setLanguages(updated);

                      updateFormData("languagesKnown", updated)

                      clearFieldError("languagesKnown");

                      setOtherLanguage("");
                      setShowOtherInput(false);
                    }}
                  >
                    Add
                  </button>
                </div>
              </li>
            )}
            <li className="fullsec">
              {languages.length < 3 && (
                <Select name="languagePicker" placeholder="Select Language" value=""
                  options={LANGUAGE_OPTIONS
                    .filter(lang => !selectedLanguages.includes(lang))
                    .map(lang => ({ label: lang, value: lang }))}
                  error={errors?.languagesKnown}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return;

                    if (value === "Other") {
                      setShowOtherInput(true);
                      return;
                    }

                    // prevent duplicates
                    if (languages.some(l => l.language === value)) return;

                    const updated = [
                      ...languages,
                      { id: Date.now(), language: value, skills: [] }
                    ];

                    setLanguages(updated);

                    updateFormData("languagesKnown", updated)

                    clearFieldError("languagesKnown");
                  }}
                />
              )}

              {/* {errors?.languagesKnown && (
                <div className="invalid-feedback d-block">
                  {errors.languagesKnown}
                </div>
              )} */}
            </li>





          </ul>
        </div>
      </section>

      <section className="whitebox">

        <h4>Sibling's Information</h4>



        <div className="form-check">
          <input
            type="checkbox"
            id="hasSibling"
            className={`form-check-input ${hasSibling && admissionContextErrors?.siblings ? "is-invalid" : ""
              }`}
            checked={hasSibling}
            onChange={(e) => {
              const checked = e.target.checked;

              setHasSibling(checked);

              if (!checked) {
                setSiblings([]);
                clearSiblingFieldError("siblings"); // 🔥 remove sibling-level error
              }
            }}
          />

          <label className="form-check-label" htmlFor="hasSibling">
            Sibling studying in this school
          </label>
        </div>

        {hasSibling && admissionContextErrors?.siblings && (
          <div className="invalid-feedback d-block">
            {admissionContextErrors.siblings}
          </div>
        )}



        {hasSibling && siblings.map((s, index) => (
          <div className="stapform lightbg" key={s.id}>
            <ul>

              <li className="fullsec">
                <Input
                  name={`siblings.${index}.name`}
                  label={`${s.type}'s Name`}
                  placeholder="Enter Name"
                  value={s.name}
                  error={admissionContextErrors?.[`siblings.${index}.name`]}
                  onChange={(e) => {
                    const { name, value } = e.target
                    const clean = sanitizeValue(value, "alpha", 20);

                    setSiblings(prev =>
                      prev.map(item =>
                        item.id === s.id
                          ? { ...item, name: clean }
                          : item
                      )
                    );

                    clearSiblingFieldError(`siblings.${index}.name`);
                  }}
                />
              </li>


              <li className="fullsec">
                <Input
                  name={`siblings.${index}.school`}
                  label="School"
                  placeholder="Enter School"
                  value={s.school}
                  error={admissionContextErrors?.[`siblings.${index}.school`]}
                  onChange={(e) => {
                    const { name, value } = e.target
                    const clean = sanitizeValue(value, "alpha", 20);

                    setSiblings(prev =>
                      prev.map(item =>
                        item.id === s.id
                          ? { ...item, school: clean }
                          : item
                      )
                    );

                    clearSiblingFieldError(`siblings.${index}.school`);
                  }}
                />
              </li>



              <li className="fullsec">
                <Input
                  name={`siblings.${index}.standard`}
                  label="Standard"
                  placeholder="Enter Standard"
                  value={s.standard}
                  error={admissionContextErrors?.[`siblings.${index}.standard`]}
                  onChange={(e) => {
                    const { name, value } = e.target
                    // allow letters + numbers + one space, max 10
                    const clean = sanitizeValue(value, "alphanumeric", 10);

                    setSiblings(prev =>
                      prev.map(item =>
                        item.id === s.id
                          ? { ...item, standard: clean }
                          : item
                      )
                    );

                    clearSiblingFieldError(`siblings.${index}.standard`);
                  }}
                />

                <button
                  type="button"
                  className="crossbtn"
                  onClick={() =>
                    setSiblings(prev => prev.filter(item => item.id !== s.id))
                  }
                >
                  <X size={16} />
                </button>
              </li>
            </ul>
          </div>
        ))}




        {hasSibling && siblings.length < 2 && (
          <div className="row mb-3">
            <div className="col-md-4">
              <Select
                name="siblingTypePicker"
                placeholder="Select Sibling"
                value=""   // always reset after selection
                options={[
                  { label: "Brother", value: "Brother" },
                  { label: "Sister", value: "Sister" }
                ]}
                onChange={(e) => {
                  const type = e.target.value;
                  if (!type) return;

                  setSiblings(prev => [
                    ...prev,
                    {
                      id: Date.now(),
                      type,
                      name: "",
                      school: "",
                      standard: ""
                    }
                  ]);
                }}
              />
            </div>
          </div>

        )}



      </section>
      <section className="whitebox">

        <div className="formbox">

          <div className="col-md-6">
            <Input
              name="familyPhysicianName"
              label="Name of Family Physician / Pediatrician"
              placeholder="Enter Name"
              value={formData.familyPhysicianName}
              error={errors.familyPhysicianName}
              onChange={(e) => {
                const { name, value } = e.target
                const clean = sanitizeValue(value, "alpha", 20);
                updateFormData(name, clean)


                clearFieldError("familyPhysicianName");
              }}
            />
          </div>

          <div className="col-md-6">
            <Input
              name="familyPhysicianPhone"
              label="Physician Mobile No."
              placeholder="Enter Mobile No."
              value={formData.familyPhysicianPhone}
              error={errors.familyPhysicianPhone}
              onChange={(e) => {
                const { name, value } = e.target
                const clean = sanitizeValue(value, "numeric", 10);
                updateFormData(name, clean)


                clearFieldError("familyPhysicianPhone");
              }}
            />
          </div>

        </div>
      </section>
    </>

  );
});

export default Step0StudentDetails;



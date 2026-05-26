import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Plus, X } from "lucide-react";
import {
  useCreateHomework,
  useGetActivities,
  useGetClasses,
  useGetHomeworkById,
  useGetSyllabus,
  useGetTopics,
} from "../../../services/homework.services";
import { useEffect } from "react";
import { homeworkSchema } from "../../../validations/homework.schema";
import { useGetAcademicYears } from "../../../services/academicYear.services";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetActiveSubjects } from "../../../services/subject.services";
import { getCurrentAcademicYear } from "../../../utils";

export default function AddHomework() {
  const navigate = useNavigate();
  const location = useLocation();
  const hwId = location.state?.id;
  const currentAcademicYear = getCurrentAcademicYear()
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    resetField,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(homeworkSchema),
    mode: "all",
    defaultValues: {
      academicYear: currentAcademicYear,
      visibleToParents: "Y",
      activityId: null,
      attachments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attachments",
  });

  const academicYear = watch("academicYear");
  const classId = watch("classId");
  const subjectId = watch("subjectId");
  const syllabusId = watch("syllabusId");
  const topicId = watch("topicId");

  const { data: academicYears = [] } = useGetAcademicYears();

  const { data: classes = [] } = useGetClasses(academicYear);

  const { data: subjects = [] } = useGetActiveSubjects();

  const { data: topics = [] } = useGetTopics(syllabusId, subjectId);

  const { data: activities = [] } = useGetActivities(
    topicId,
    subjectId,
    classId,
  );

  const { data: syllabuses = [] } = useGetSyllabus(classId, academicYear);

  const hwMutation = useCreateHomework();

  const { data: hw, isLoading: isHwLoading } = useGetHomeworkById(hwId);

  useEffect(() => {
    if (hw && hwId) {
      reset(hw);
    }
  }, [hw]);

  useEffect(() => {
    resetField("classId");
  }, [academicYear]);

  useEffect(() => {
    resetField("topicId");
  }, [syllabusId]);

  useEffect(() => {
    resetField("activityId");
  }, [classId]);

  useEffect(() => {
    resetField("activityId");
    resetField("topicId");
  }, [subjectId]);

  useEffect(() => {
    resetField("activityId");
  }, [topicId]);

  const onSubmit = (data) => {
    const formData = new FormData();

    const homework = {
      academicYear: data.academicYear,
      classId: data.classId,
      teacherId: data.teacherId,
      subjectId: data.subjectId,
      topicId: data.topicId,
      activityId: data.activityId,
      homeworkTitle: data.homeworkTitle,
      description: data.description,
      assignedDate: new Date().toISOString().split("T")[0],
      totalMarks: data.totalMarks,
      submissionType: data.submissionType,
      visibleToParents: data.visibleToParents,
      documentInfo: data.attachments?.map((att) => ({
        caption: att.caption,
        description: att.description,
      })),
    };

    // 1️⃣ Append normal fields
    formData.append(
      "homework",
      new Blob([JSON.stringify(homework)], { type: "application/json" }),
    );

    // 2️⃣ Append attachments
    data.attachments?.forEach((att, index) => {
      if (att?.file) {
        formData.append("documents", att.file[0]);
      }
    });

    hwMutation.mutate(formData, {
      onError: (error) => {
        console.error("Error creating homework:", error);
      },
      onSuccess: () => {
        resetField();
        navigate("/admin/homework-list");
      },
    });
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* CLASS DETAILS */}
        <div className="whitebox">
          <h3>Class & Topic Details</h3>
          <div className="formbox searchsec stapform">
            <ul>
              <li>
                <div className="form-group">
                  <label>
                    Academic Year <span className="text-red">*</span>{" "}
                  </label>
                  <select
                    className={`form-control ${
                      errors.academicYear ? "is-invalid" : ""
                    }`}
                    {...register("academicYear")}
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map((y) => (
                      <option key={y.academicYear} value={y.academicYear}>
                        {y.academicYear}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    {errors.academicYear?.message}
                  </div>
                </div>
              </li>
              <li>
                <div className="form-group">
                  <label>
                    Class <span className="text-red">*</span>
                  </label>
                  <select
                    className={`form-control ${
                      errors.classId ? "is-invalid" : ""
                    }`}
                    {...register("classId")}
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.classId} value={c.classId}>
                        {c.className}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    {errors.classId?.message}
                  </div>
                </div>
              </li>
              <li>
                <div className="form-group">
                  <label>
                    {" "}
                    Syllabus <span className="text-red">*</span>{" "}
                  </label>
                  <select
                    className={`form-control`}
                    aria-readonly="true"
                    {...register("syllabusId")}
                  >
                    <option value="">Select Syllabus</option>
                    {syllabuses.map((s) => (
                      <option key={s.syllabusId} value={s.syllabusId}>
                        {s.syllabusName}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    {errors.classId?.message}
                  </div>
                </div>
              </li>
              <li>
                <div className="form-group">
                  <label>
                    {" "}
                    Subject <span className="text-red">*</span>{" "}
                  </label>
                  <select
                    className={`form-control ${
                      errors.subjectId ? "is-invalid" : ""
                    }`}
                    {...register("subjectId")}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.subjectId} value={s.subjectId}>
                        {s.subjectName}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    {errors.subjectId?.message}
                  </div>
                </div>
              </li>
              <li>
                <div className="form-group">
                  <label>
                    Topic <span className="text-red">*</span>{" "}
                  </label>
                  <select
                    className={`form-control ${
                      errors.topicId ? "is-invalid" : ""
                    }`}
                    {...register("topicId")}
                  >
                    <option value="">Select Topic</option>
                    {topics.length > 0 &&
                      topics?.map((t) => (
                        <option key={t.topicId} value={t.topicId}>
                          {t.topicName}
                        </option>
                      ))}
                  </select>
                  <div className="invalid-feedback">
                    {errors.topicId?.message}
                  </div>
                </div>
              </li>
              <li></li>
              <li></li>
            </ul>
          </div>
        </div>

        <div className="whitebox">
          <h3>Homework Information</h3>
          <div className="formbox searchsec stapform">
            <ul>
              <li>
                <div className="form-group">
                  <label>Activity</label>
                  <select
                    className={`form-control ${
                      errors.activityId ? "is-invalid" : ""
                    }`}
                    {...register("activityId")}
                  >
                    <option value="">Select Activity</option>
                    {activities.map((a) => (
                      <option key={a.activityId} value={a.activityId}>
                        {a.activityTitle}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    {errors.activityId?.message}
                  </div>
                </div>
              </li>
              <li>
                <div className="form-group">
                  <label>
                    Title <span className="text-red">*</span>
                  </label>
                  <input
                    className={`form-control ${
                      errors.homeworkTitle ? "is-invalid" : ""
                    }`}
                    placeholder="Enter title"
                    {...register("homeworkTitle")}
                  />
                  <div className="invalid-feedback">
                    {errors.homeworkTitle?.message}
                  </div>
                </div>
              </li>
              <li>
                <div className="form-group">
                  <label>
                    Total Marks <span className="text-red">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter marks"
                    className={`form-control ${
                      errors.totalMarks ? "is-invalid" : ""
                    }`}
                    {...register("totalMarks")}
                  />
                  <div className="invalid-feedback">
                    {errors.totalMarks?.message}
                  </div>
                </div>
              </li>
              <li className="deskfull">
                <div className="form-group">
                  <label>
                    Description <span className="text-red">*</span>{" "}
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Enter description"
                    className={`form-control ${
                      errors.description ? "is-invalid" : ""
                    }`}
                    {...register("description")}
                  />
                  <div className="invalid-feedback">
                    {errors.description?.message}
                  </div>
                </div>
              </li>
              <li>
                <div className="form-group">
                  <label>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={watch("visibleToParents") === "Y"}
                      onChange={(e) =>
                        setValue(
                          "visibleToParents",
                          e.target.checked ? "Y" : "N",
                        )
                      }
                    />{" "}
                    Visible To Parents
                  </label>
                  <div className="invalid-feedback">
                    {errors.visibleToParents?.message}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ATTACHMENTS */}
        <div>
          {fields.map((item, index) => (
            <div className="whitebox" key={item.id}>
              <div className="formbox searchsec stapform addtopic">
                <h3>Add Attachment</h3>
                <ul>
                  <li className="fullsec">
                    <div className="form-group">
                      <input
                        type="file"
                        className={`form-control ${
                          errors.attachments?.[index]?.file ? "is-invalid" : ""
                        }`}
                        {...register(`attachments.${index}.file`)}
                      />
                      <div className="invalid-feedback">
                        {errors.attachments?.[index]?.file?.message}
                      </div>
                    </div>
                  </li>
                  <li className="fullsec">
                    <div className="form-group">
                      <label>
                        {" "}
                        Caption <span className="text-red">*</span>{" "}
                      </label>
                      <input
                        type="text"
                        placeholder="Enter caption"
                        className={`form-control ${
                          errors.attachments?.[index]?.caption
                            ? "is-invalid"
                            : ""
                        }`}
                        {...register(`attachments.${index}.caption`)}
                      />
                      <div className="invalid-feedback">
                        {errors.attachments?.[index]?.caption?.message}
                      </div>
                    </div>
                  </li>
                  <li className="fullsec">
                    <div className="form-group">
                      <label>
                        Description <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter description"
                        className={`form-control ${
                          errors.attachments?.[index]?.description
                            ? "is-invalid"
                            : ""
                        }`}
                        {...register(`attachments.${index}.description`)}
                      />
                      <div className="invalid-feedback">
                        {errors.attachments?.[index]?.description?.message}
                      </div>
                    </div>
                  </li>
                </ul>
                <button
                  type="button"
                  className="deletebtn"
                  onClick={() => remove(index)}
                >
                  <X size={16} />{" "}
                </button>
              </div>
            </div>
          ))}
          <div className="text-right ">
            <button type="button" onClick={() => append({ file: null })}>
              + Add Attachment
            </button>
          </div>
        </div>

        <div className="text-center mt-2">
          <button disabled={hwMutation.isPending} type="submit" className="btn btn-primary fullsec">
            {hwMutation.isPending ? 'Saving...' : 'Save Homework'}
          </button>
        </div>
      </form>
    </div>
  );
}

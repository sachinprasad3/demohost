import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { X, Pencil } from "lucide-react";
import {
  useGetTextBooks,
  useCreateTextBook,
  useUpdateTextBook,
  useDeleteTextBook,
} from "../../../services/textBook.services";
import Popup from "../../../components/Popup";
import { textBookSchema } from "../../../validations/textBook.schema";
import { useGetClasses } from "../../../services/homework.services";
import useClasses from "../../../hooks/useClasses";
import Select from "../../../components/AmissionFormComponents/customField/Select";
import { useGetActiveSubjects } from "../../../services/subject.services";
import { getCurrentAcademicYear } from "../../../utils";
import { useGetActiveAcademicYears } from "../../../services/academicYear.services";

export default function TextBookHero() {
  const currentAcademicYear = getCurrentAcademicYear();
  const [editingBook, setEditingBook] = useState(null);
  const [activeModal, setActiveModal] = useState("");
  const [filteredTextBook, setFilteredTextBook] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
    watch,
  } = useForm({
    mode: "all",
    resolver: yupResolver(textBookSchema),
    defaultValues: {
      academicYear: currentAcademicYear,
      classId: "",
    },
  });
  const { data: textBooks = [], isLoading: isLoadingTextBooks } =
    useGetTextBooks();

  const selectedAcademicYear = watch("academicYear");
  const createMutation = useCreateTextBook();
  const updateMutation = useUpdateTextBook();
  const deleteMutation = useDeleteTextBook();
  const { classesOptions } = useClasses();
  const { data: academicYears } = useGetActiveAcademicYears();
  const { data: classes = [] } = useGetClasses(selectedAcademicYear);

  const { data: subjects = [] } = useGetActiveSubjects();

  const selectedClassId = watch("classId");

  /* ================= OPEN POPUPS ================= */

  const openAdd = () => {
    reset({
      academicYear: currentAcademicYear,
      classId: "",
      subjectId: "",
      textBookName: "",
      author: "",
      publisher: "",
      publishedYear: "",
    });
    setEditingBook(null);
    setActiveModal("ADD");
  };

  const openEdit = (row) => {
    reset({ ...row, academicYear: currentAcademicYear });
    setEditingBook({ ...row, academicYear: currentAcademicYear });
    setActiveModal("EDIT");
  };

  useEffect(() => {
    if (!selectedClassId) {
      setFilteredTextBook(textBooks);
      return;
    }

    const filteredBook = textBooks?.filter(
      (book) => String(book?.classId) === String(selectedClassId),
    );

    setFilteredTextBook(filteredBook);
  }, [selectedClassId, textBooks]);

  /* ================= SAVE ================= */

  const onSubmit = (data) => {
    if (editingBook) {
      updateMutation.mutate(
        {
          ...data,
          textBookId: editingBook.textBookId,
        },
        {
          onSuccess: () => setActiveModal(""),
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setActiveModal(""),
      });
    }
  };

  /* ================= DELETE ================= */

  const onDelete = (textBookId) => {
    if (window.confirm("Delete this text book?")) {
      deleteMutation.mutate(textBookId);
    }
  };

  return (
    <div className="container  ">
      <div className="addfee-head">
        <h3>Create / Edit Text Books</h3>

        <button className="btn btn-primary" onClick={openAdd}>
          + Add Text Book
        </button>
      </div>
      <div class="whitebox">
        <div class="formbox searchsec stapform">
          <ul>
            <li>
              <Controller
                name="classId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Filter by class"
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    options={classesOptions}
                    placeholder="Select Class"
                  />
                )}
              />
            </li>
          </ul>
        </div>
      </div>
      <div className="listsec">
        <div className="listbox texbooks theading">
          <div>Sl</div>
          <div>Text Book Name</div>
          <div>Class</div>
          <div>Subject</div>
          <div>Author</div>
          <div>Publisher</div>
          <div>Edit</div>
        </div>

        <ul>
          {isLoadingTextBooks ? (
            <li>
              <div className="listbox texbooks text-center">Loading...</div>
            </li>
          ) : !filteredTextBook.length ? (
            <li>
              <div className="listbox texbooks text-center">No Data Found</div>
            </li>
          ) : (
            <>
              {filteredTextBook.map((b, index) => (
                <li key={b.textBookId}>
                  <div className="listbox texbooks">
                    <div>{index + 1}</div>
                    <div data-head="Text Book Name">
                      {b.textBookName} {/*- {b.publishedYear || "-"}*/}
                    </div>
                    <div data-head="Class">{b?.className || "-"}</div>
                    <div data-head="Subject">{b?.subjectName || "-"}</div>
                    <div data-head="Author">{b.author || "-"}</div>
                    <div data-head="Publisher">{b.publisher || "-"}</div>
                    <div className="actionbtns ">
                      <button className="editbtn" onClick={() => openEdit(b)}>
                        <Pencil size={18} />
                      </button>

                      <button
                        className="crossbtn"
                        onClick={() => onDelete(b.textBookId)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </>
          )}
        </ul>
      </div>

      {/* POPUP */}
      {activeModal && (
        <Popup
          title={editingBook ? "Edit Text Book" : "Add Text Book"}
          closeOnOutsideClick={false}
          onClose={() => setActiveModal("")}
          onSave={handleSubmit(onSubmit)}
          saveText={editingBook ? "Save Changes" : "Save"}
          submitClass={"btn btn-primary"}
        >
          <div className="inputRow">
            <label>Academic Year</label>
            <div>
              <select
                className={`form-control ${errors.academicYear ? "is-invalid" : ""
                  }`}
                {...register("academicYear")}
              >
                <option value="">Select Academic</option>
                {academicYears.map((y) => (
                  <option key={y.academicYear} value={y.academicYear}>
                    {y.academicYear}
                  </option>
                ))}
              </select>
            </div>
            {errors.academicYear && (
              <div className="invalid-feedback d-block">
                {errors.academicYear?.message}
              </div>
            )}
          </div>
          <div className="inputRow">
            <label>Class</label>
            <div>
              <select
                className={`form-control ${errors.classId ? "is-invalid" : ""}`}
                {...register("classId")}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.classId} value={c.classId}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>
            {errors.classId && (
              <div className="invalid-feedback d-block">
                {errors.classId?.message}
              </div>
            )}
          </div>

          <div className="inputRow">
            <label>Subject</label>
            <div>
              <select
                className={`form-control ${errors.subjectId ? "is-invalid" : ""
                  }`}
                {...register("subjectId")}
              >
                <option value="">Select Subject</option>
                {subjects.map((c) => (
                  <option key={c.subjectId} value={c.subjectId}>
                    {c.subjectName}
                  </option>
                ))}
              </select>
            </div>
            {errors.subjectId && (
              <div className="invalid-feedback d-block">
                {errors.subjectId?.message}
              </div>
            )}
          </div>
          <div className="inputRow">
            <label>Text Book Name</label>
            <div>
              <input
                placeholder="Book name"
                className={`form-control ${errors.textBookName ? "is-invalid" : ""
                  }`}
                {...register("textBookName")}
              />
            </div>
            {errors.textBookName && (
              <div className="invalid-feedback d-block">
                {errors.textBookName?.message}
              </div>
            )}
          </div>

          <div className="inputRow">
            <label>Author</label>
            <div>
              <input
                placeholder="Author"
                className={`form-control ${errors.author ? "is-invalid" : ""}`}
                {...register("author")}
              />
            </div>
            {errors.author && (
              <div className="invalid-feedback d-block">
                {errors.author?.message}
              </div>
            )}
          </div>

          <div className="inputRow">
            <label>Publisher</label>
            <div>
              <input
                placeholder="Publisher"
                className={`form-control ${errors.publisher ? "is-invalid" : ""
                  }`}
                {...register("publisher")}
              />
            </div>
            {errors.publisher && (
              <div className="invalid-feedback d-block">
                {errors.publisher?.message}
              </div>
            )}
          </div>

          <div className="inputRow">
            <label>Published Year</label>
            <div>
              <input
                className={`form-control ${errors.publishedYear ? "is-invalid" : ""
                  }`}
                placeholder="YYYY"
                {...register("publishedYear")}
              />
            </div>
            {errors.publishedYear && (
              <div className="invalid-feedback">
                {errors.publishedYear?.message}
              </div>
            )}
          </div>
        </Popup>
      )}
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Pencil } from "lucide-react";

import {
  useGetSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from "../../../services/subject.services";
import Popup from "../../../components/Popup";
import { subjectSchema } from "../../../validations/subject.schema";

export default function SubjectHero() {
  const [editingSubject, setEditingSubject] = useState(null);
  const [activeModal, setActiveModal] = useState("");

  const { data: subjects = [], isLoading: isLoadingSubjects } =
    useGetSubjects();

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "all",
    resolver: yupResolver(subjectSchema),
  });

  /* ================= OPEN POPUPS ================= */

  const openAdd = () => {
    reset({
      subjectName: "",
      // subjectCode: "",
      displayOrder: "",
      active: "Y",
    });
    setEditingSubject(null);
    setActiveModal("ADD");
  };

  const openEdit = (row) => {
    reset(row);
    setEditingSubject(row);
    setActiveModal("EDIT");
  };

  /* ================= SAVE ================= */

  const onSubmit = (data) => {
    if (editingSubject) {
      updateMutation.mutate(
        {
          ...data,
          subjectId: editingSubject.subjectId,
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

  const handleToggleStatus = (data) => {
    const { active, subjectId, ...rest } = data;
    deleteMutation.mutate({
      subjectId,
      isCurrent: active === "Y" ? "N" : "Y",
    });
  };

  return (
    <div className="container">
      <div className="addfee-head">
        <h3>Create / Edit Subjects</h3>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add Subject
        </button>
      </div>
      <div className="listsec">
        <div className="listbox academicterm theading">
          <div>Sl.</div>
          <div>Subject Name</div>
          <div>Code</div>
          {/* <div>Display Order</div> */}
          <div>Status/Action</div>
        </div>

        <ul>
          {isLoadingSubjects ? (
            <li>
              <div colSpan={5} className="listbox academicterm text-center">
                Loading...
              </div>
            </li>
          ) : !subjects.length ? (
            <tr>
              <td colSpan={5} className="listbox academicterm text-center">
                No Data Found
              </td>
            </tr>
          ) : (
            <>
              {subjects.map((s, index) => (
                <li key={s.subjectId}>
                  <div className="listbox academicterm">
                    <div>{index + 1}</div>
                    <div data-head="Subject Name">{s.subjectName}</div>
                    <div data-head="Code">{s.subjectCode}</div>
                    {/* <div data-head="Display Order">{s.displayOrder ?? "-"}</div> */}
                    <div className="actionbtns actions-heading">
                      <div
                        className={`defaultbtn ${
                          s.active === "Y" ? "on" : "off"
                        }`}
                        onClick={() => handleToggleStatus(s)}
                        style={{ cursor: "pointer" }} // Adds a hand cursor so it looks clickable
                        title={
                          s.active === "Y"
                            ? "Click to Deactivate"
                            : "Click to Activate"
                        }
                      >
                        <div className="toggle-circle">
                          {s.active === "Y" ? "✓" : "✕"}
                        </div>
                      </div>
                      <button className="editbtn" onClick={() => openEdit(s)}>
                        <Pencil/>
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
          title={editingSubject ? "Edit Subject" : "Add Subject"}
          closeOnOutsideClick={false}
          onClose={() => setActiveModal("")}
          onSave={handleSubmit(onSubmit)}
          saveText={editingSubject ? "Save Changes" : "Save"}
          submitClass={"btn btn-primary fullwidth"}
        >
          <div className="inputRow">
            <label>Subject Name</label>
            <div>
              <input
                placeholder="Mathematics"
                className="form-control"
                {...register("subjectName")}
              />
            </div>
            <p className="invalid-feedback d-block">
              {errors.subjectName?.message}
            </p>
          </div>

          <div className="inputRow">
            <label>Subject Code</label>
            <div>
              <input
                placeholder="Math"
                className="form-control"
                {...register("subjectCode")}
              />
            </div>
            <p className="invalid-feedback d-block">
              {errors.subjectCode?.message}
            </p>
          </div>

          {/* <div className="inputRow">
            <label>Display Order</label>
            <div>
              <input
                placeholder="1"
                type="number"
                className="form-control"
                {...register("displayOrder")}
              />
            </div>
            <p className="invalid-feedback d-block">
              {errors.displayOrder?.message}
            </p>
          </div> */}

          <div className="inputRow">
            <label>Status</label>
            <select className="form-control" {...register("active")}>
              <option value="Y">Active</option>
              <option value="N">Inactive</option>
            </select>
          </div>
        </Popup>
      )}
    </div>
  );
}

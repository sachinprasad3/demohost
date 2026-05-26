import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { academicTermSchema } from "../../../validations/academicTerm.schema";
import { Pencil } from "lucide-react";

import {
  useGetAcademicTerms,
  useCreateAcademicTerm,
  useUpdateAcademicTerm,
} from "../../../services/academicTerm.services";

import Popup from "../../../components/Popup";
import { useGetActiveAcademicYears } from "../../../services/academicYear.services";
import { isUpcomingAcademicYear } from "../../../utils";

export default function AcademicTermHero() {
  const [editingTerm, setEditingTerm] = useState(null);
  const [activeModal, setActiveModal] = useState("");
  const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

  const { data: terms = [], isLoading: isLoadingAcademicTerms } =
    useGetAcademicTerms();
  const { data: academicYears = [] } = useGetActiveAcademicYears();

  const createMutation = useCreateAcademicTerm();
  const updateMutation = useUpdateAcademicTerm();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "all",
    resolver: yupResolver(academicTermSchema),
  });

  /* ================= OPEN MODALS ================= */

  const openAdd = () => {
    reset({
      academicYear: "",
      termName: "",
      startDate: "",
      endDate: "",
      termSequence: "",
      isCurrent: "N",
    });
    setEditingTerm(null);
    setActiveModal("ADD");
  };

  const openEdit = (row) => {
    const canEdit = isUpcomingAcademicYear(row.academicYear.academicYear);
        if (!canEdit) {
          alert("You can't change running year");
          return;
        }

    reset({ ...row, academicYear: row.academicYear.academicYear });
    setEditingTerm(row);
    setActiveModal("EDIT");
  };

  const handleToggleStatus = (data) => {
    const { isCurrent, academicYear, ...rest } = data;
    const canEdit = isUpcomingAcademicYear(academicYear.academicYear);
        if (!canEdit) {
          alert("You can't change running year");
          return;
        }
    updateMutation.mutate({
      ...rest,
      academicYear: academicYear.academicYear,
      isCurrent: isCurrent === "Y" ? "N" : "Y",
    });
  };

  /* ================= SAVE ================= */

  const onSubmit = (data) => {
    if (editingTerm) {
      updateMutation.mutate(
        {
          ...data,
          term_id: editingTerm.term_id,
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

  const academicYearRegister = register("academicYear");

  const handleAcademicYearChange = useCallback(
    (e) => {
      academicYearRegister.onChange(e);
      const [startYear, endYear] = e.target.value.split("-");
      const startDate = new Date(`${startYear}-04-01`);
      const endDate = new Date(`${endYear}-03-31`);

      setValue("startDate", startDate.toISOString().split("T")[0], {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("endDate", endDate.toISOString().split("T")[0], {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [academicYearRegister, setValue],
  );

  return (
    <div className="container ">
      <div className="addfee-head">
        <div></div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add Academic Term
        </button>
        </div> 
         <div className="listsec">
          <div className="listbox academicterm theading">
            <div>Sl.</div>
            <div>Academic Year</div>
            
           <div>Start & End Date</div> 
           <div>Term</div>
            <div>Sequence</div>
            <div>Status/Action</div>
          </div>
          <ul>
            
 
            {isLoadingAcademicTerms ? (
              <li>
                <div colSpan={5} className="listbox text-center">
                  Loading...
                </div>
              </li>
            ) : !terms.length ? (
              <li>
                <div colSpan={5} className="listbox text-center">
                  No Data Found
                </div>
              </li>
            ) : (
              <>
                {terms?.map((t, index) => (
                  <li key={t.termId}>
                    <div className="listbox academicterm"> 
                    <div>{index + 1}</div>
                    <div data-head="Academic Year">{t.academicYear.academicYear}</div> 
                    <div data-head="Start & End Date">{formatDate(t.startDate)} - {formatDate(t.endDate)}</div>
                    <div data-head="Term">{t.termName}</div>
                    <div data-head="Sequence">{t.termSequence}</div>
                    <div className="actionbtns actions-heading">
                    <div className={`defaultbtn ${ t.isCurrent === "Y" ? "on" : "off"}`}
                      onClick={() => handleToggleStatus(t)}  title={ t.isCurrent === "Y" ? "Click to Deactivate" : "Click to Activate" } >
                      <div className="toggle-circle">
                        {t.isCurrent === "Y" ? "✓" : "✕"}
                      </div>
                    </div>
                    <button className="editbtn" onClick={() => openEdit(t)}><Pencil /></button>
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
          <Popup title={editingTerm ? "Edit Academic Term" : "Add Academic Term"}
            closeOnOutsideClick={false}
            onClose={() => setActiveModal("")}
            onSave={handleSubmit(onSubmit)}
            saveText={editingTerm ? "Save Changes" : "Save"}
            submitClass={"btn btn-primary fullwidth"}
          >
            <div className="inputRow"> 
              <label>Academic Year</label>
            <select
              className="form-control"
              {...academicYearRegister}
              onChange={handleAcademicYearChange}
              //disabled={!!editingTerm}
            >
                  <option value="">Select</option>
                  {academicYears.map((y) => (
                    <option key={y.academicYear} value={y.academicYear}>
                      {y.academicYear}
                    </option>
                  ))}
                </select> 
                {errors.academicYear && (<div className="invalid-feedback d-block">{errors.academicYear?.message}</div>)} 
            </div>
            

            <div className="inputRow">
              <label>Term Name</label> 
              <input placeholder="Term name" className="form-control" {...register("termName")} /> 
              {errors.termName && (<div className="invalid-feedback d-block">{errors.termName?.message}</div>)}
            </div>
              
            <div className="inputRow">
              <label>Term Sequence</label> 
              <input placeholder="Term sequence" type="number" className="form-control" {...register("termSequence")} />
              {errors.termSequence && (<div className="invalid-feedback d-block">{errors.termSequence?.message}</div>)}
            </div>
              

            <div className="inputRow">
              <label>Start Date</label> 
              <input type="date" className="form-control" {...register("startDate")} disabled />
              <div className="invalid-feedback d-block">{errors.startDate?.message}</div> 
            </div>

            <div className="inputRow">
              <label>End Date</label>
              <input type="date" className="form-control" {...register("endDate")} disabled/>
              <div className="invalid-feedback d-block">{errors.endDate?.message}</div>
            </div>

            <div className="inputRow">
              <label>Is Current</label>
              <select className="form-control" {...register("isCurrent")}>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
          </Popup>
        )} 
    </div>
  );
}

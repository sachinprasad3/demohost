import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { academicYearSchema } from "../../../validations/academicYear.schema";
import { Pencil } from "lucide-react";
import {
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useGetAcademicYears,
} from "../../../services/academicYear.services";
import Popup from "../../../components/Popup";
import { SelectAcademicYear } from "../../../components/RangeYearPicker";
import { isUpcomingAcademicYear } from "../../../utils";

export default function AcademicYearHero() {
  const [editingYear, setEditingYear] = useState("");
  const [activeModal, setActiveModal] = useState("");

  const { data: academicYears = [], isLoading: isLoadingAcademicYears } =
    useGetAcademicYears();
  const createMutation = useCreateAcademicYear();
  const updateMutation = useUpdateAcademicYear();
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(academicYearSchema),
    context: { academicYears, originalValue: editingYear },
    mode: "all",
  });

  const academicYearValue = watch("academicYear");

  /* ================= OPEN POPUP ================= */

  const openAdd = () => {
    reset({
      academicYear: "",
      startDate: "",
      endDate: "",
      isCurrent: "N",
    });
    setEditingYear("");
    setActiveModal("ADD");
  };

  const openEdit = (row) => {
    const canEdit = isUpcomingAcademicYear(row.academicYear);
    // if (!canEdit) {
    //   alert("You can't change running year");
    //   return;
    // }
    reset({ ...row, isCurrent: row.isCurrent });
    setEditingYear(row.academicYear);
    setActiveModal("EDIT");
  };

  /* ================= SAVE ================= */

  const onSubmit = (data) => {
    if (editingYear) {
      updateMutation.mutate(data, {
        onSuccess: () => setActiveModal(""),
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setActiveModal(""),
      });
    }
  };

  const handleToggleIsCurrent = (data) => {
    const { isCurrent, ...rest } = data;
    const canEdit = isUpcomingAcademicYear(rest.academicYear);
    // if (!canEdit) {
    //   alert("You can't change running year");
    //   return;
    // }

    updateMutation.mutate({
      ...rest,
      isCurrent: isCurrent === "Y" ? "N" : "Y",
    });
  };

  const handleToggleStatus = (data) => {
    const { status, ...rest } = data;
    const canEdit = isUpcomingAcademicYear(rest.academicYear);
    // if (!canEdit) {
    //   alert("You can't change running year");
    //   return;
    // }

    updateMutation.mutate({
      ...rest,
      status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });
  };

  const handleAcademicYearChange = useCallback(
    (value) => {
      setValue("academicYear", value, {
        shouldTouch:true,
        shouldValidate: true,
      });
      const [startYear, endYear] = value.split("-");

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
    [setValue],
  );

  return (
    <div className="container ">
      <div className="addfee-head">
        <div></div>
       <button className="btn btn-primary" onClick={openAdd}>
          + Add Academic Year
        </button>
        </div> 

        <div className="listsec">
          <div className="listbox academicyear theading">
            <div>Sl.</div>
            <div>Academic Year</div>
              <div>Start & End Date</div> 
              <div>Is Current</div> 
              <div>Status/Action</div>
          </div>
          <ul> 
            {isLoadingAcademicYears ? (
              <li>
                <div colSpan={5} className="listbox text-center">
                  Loading...
                </div>
              </li>
            ) : !academicYears.length ? (
              <li>
                <div colSpan={5} className="listbox text-center">
                  No Data Found
                </div>
              </li>
            ) : (
              <>
                {academicYears.map((row, index) => (
                  <li key={row.academicYear}>
                    <div className="listbox academicyear"> 
                      <div>{index + 1}</div>
                    <div data-head="Academic Year">{row.academicYear}</div> 
                     <div data-head="Start & End Date">{formatDate(row.startDate)} - {formatDate(row.endDate)}</div>
                      <div data-head="Status" className="actionbtns actions-heading">
                        <div
                        className={`defaultbtn ${
                          row.isCurrent === "Y" ? "on" : "off"
                        }`}
                        onClick={() => handleToggleIsCurrent(row)}
                        style={{ cursor: "pointer" }} 
                        title={
                          row.isCurrent === "Y"
                            ? "Click to Deactivate"
                            : "Click to Activate"
                        }
                      >
                        <div className="toggle-circle">
                          {row.isCurrent === "Y" ? "✓" : "✕"}
                        </div>
                      </div>
                      </div>
                    <div className="actionbtns actions-heading">
                      <div
                        className={`defaultbtn ${
                          row.status === "ACTIVE" ? "on" : "off"
                        }`}
                        onClick={() => handleToggleStatus(row)}
                        style={{ cursor: "pointer" }} 
                        title={
                          row.status === "ACTIVE"
                            ? "Click to Deactivate"
                            : "Click to Activate"
                        }
                      >
                        <div className="toggle-circle">
                          {row.status === "ACTIVE" ? "✓" : "✕"}
                        </div>
                      </div>
                      <button className="editbtn" onClick={() => openEdit(row)}>
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
            title={editingYear ? `Edit: ${editingYear}` : "Add Academic Year"}
            closeOnOutsideClick={false}
            onClose={() => setActiveModal("")}
            onSave={handleSubmit(onSubmit)}
            saveText={editingYear ? "Save Changes" : "Save"}
            submitClass={"btn btn-primary fullwidth"}
          >
            <div className="inputRow">
              <label>Academic Year</label> 
            <SelectAcademicYear
                    placeholderText="YYYY-YYYY"
                    onChange={handleAcademicYearChange}
                    value={academicYearValue}
                    className={"form-control"}
                  />
                {errors.academicYear && (<div className="invalid-feedback d-block">{errors.academicYear?.message}</div>)}
              
            </div>

            <div className="inputRow">
              <label>Start Date</label>
               
                <input
                  type="date"
                  className="form-control"
                  {...register("startDate")}
                  
                />
                {errors.startDate && (<div className="invalid-feedback d-block">{errors.startDate?.message}</div>)}
              
            </div>

            <div className="inputRow">
              <label>End Date</label>
              
                <input
                  type="date"
                  className="form-control"
                  {...register("endDate")}
                  
                />
                {errors.endDate && (<div className="invalid-feedback d-block">{errors.endDate?.message}</div>)}
              
            </div>

            <div className="inputRow">
              <label>Is Current</label>
              <select className="form-control" {...register("isCurrent")}>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
            <div className="inputRow">
              <label>Status</label>
              <select className="form-control" {...register("status")}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </Popup>
        )} 
    </div>
  );
}

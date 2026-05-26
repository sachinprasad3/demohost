import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Popup from "../../../components/Popup";
import * as yup from "yup";
import {
  useGetThemes,
  useGetThemesByClassId,
  useUploadTheme,
} from "../../../services/theme.services";
import { X } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { useGetClasses } from "../../../services/homework.services";
import Select from "../../../components/AmissionFormComponents/customField/Select";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import FileViewer from "../../../components/FileViewer";
import Loader from "../../../components/Loader";
import { useLoader } from "../../../context/LoaderContext";
export const File_Base_Url =
  "https://cargofile.s3.ap-south-1.amazonaws.com/PlaySchool/Theme/";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const getPdfPageImage = async (pdfUrl, pageNumber) => {
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas.toDataURL("image/png");
};

export const getValidPageIndexes = (pages, totalPages) => {
  const valid = [];
  const invalid = [];

  pages.forEach((p) => {
    if (Number.isInteger(p) && p >= 1 && p <= totalPages) {
      valid.push(p - 1); // convert to 0-based
    } else {
      invalid.push(p);
    }
  });

  return { valid, invalid };
};

export async function createPdfFromPages(pdfUrl, pages) {
  // Fetch original PDF
  const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());

  // Load original PDF
  const originalPdf = await PDFDocument.load(existingPdfBytes);
  const totalPages = originalPdf.getPageCount();

  const { valid, invalid } = getValidPageIndexes(pages, totalPages);

  if (valid.length === 0) {
    throw new Error("No valid page numbers provided");
  }

  // Create new PDF
  const newPdf = await PDFDocument.create();

  // Convert to 0-based indexes
  const pageIndexes = pages.map((p) => p - 1);

  // Copy selected pages
  const copiedPages = await newPdf.copyPages(originalPdf, pageIndexes);

  copiedPages.forEach((page) => newPdf.addPage(page));

  // Save new PDF
  const newPdfBytes = await newPdf.save();

  return new Blob([newPdfBytes], { type: "application/pdf" });
}

function getMinType(url) {
  if (url.toLowerCase().includes(".pdf")) return "application/pdf";

  return null;
}

export async function getBase64AndMime(url) {
  const res = await fetch(url);
  const blob = await res.blob();

  const base64Data = await new Promise((resolve) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result.split(",")[1]);
    r.readAsDataURL(blob);
  });

  return {
    mimeType: getMinType(url) || blob.type,
    base64Data,
  };
}

export const themeSchema = yup.object({
  classId: yup
    .number()
    .required("Class is required")
    .typeError("Class is required"),
  theme: yup
    .string()
    .required("theme is required")
    .max(100, "Max 100 characters"),

  pageNo: yup
    .string()
    .required("Page no is required")
    .matches(
      /^\d+(-\d+)?$/,
      "Page no must be a number or range like 10 or 10-30",
    )
    .test("valid-range", "Invalid page range", (value) => {
      if (!value) return false;

      if (value.includes("-")) {
        const [start, end] = value.split("-").map(Number);
        return start > 0 && end > start;
      }

      return Number(value) > 0;
    }),
  file: yup
    .mixed()
    .notRequired()
    .test("fileType", "Only pdf allowed", (value) => {
      if (!value || !value[0]) return true; // ✅ skip validation if no file
      return value[0].type === "application/pdf";
    })
    .test("fileSize", "File size must be less than 50MB", (value) => {
      if (!value || !value[0]) return true; // ✅ skip validation if no file
      return value[0].size <= 50 * 1024 * 1024;
    }),
  // file: yup.mixed().when("$isEdit", {
  //   is: true,
  //   then: (schema) => schema.notRequired(),
  //   otherwise: (schema) =>
  //     schema
  //       .required("File is required")
  //       .test("fileType", "Only pdf allowed", (value) => {
  //         const file = value?.[0];
  //         if (!file) return false;
  //         return ["application/pdf"].includes(file.type);
  //       })
  //       .test("fileSize", "File size must be less than 50MB", (value) => {
  //         const file = value?.[0];
  //         if (!file) return false;
  //         return file.size <= 50 * 1024 * 1024;
  //       }),
  // }),
});

export default function ThemeHero() {
  const [editingTheme, setEditingTheme] = useState(null);
  const [activeModal, setActiveModal] = useState("");
  const [existingImage, setExistingImage] = useState(null);
  const [images, setImages] = useState([]);
  const [classId, setClassId] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const themeUploadMutation = useUploadTheme();
  const [processedFile, setProcessedFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setValue,
    watch,
    setPreview,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(themeSchema),
    context: {
      isEdit: !!editingTheme && !!existingImage,
    },
  });

  const { data: classes = [] } = useGetClasses();
  const { data: themes, isLoading: isLoadingThemes } =
    useGetThemesByClassId(classId);

    useEffect(() => {
      if (themeUploadMutation.isPending) {
        showLoader(editingTheme ? "Updating theme..." : "Saving theme...");
      } else {
        hideLoader();
      }
    }, [themeUploadMutation.isPending])

  /* ================= OPEN POPUPS ================= */
  const file = watch("file");

  const openAdd = () => {
    reset({
      theme: "",
      pageNo: "",
    });
    setExistingImage(null);
    setEditingTheme(null);
    setActiveModal("ADD");
  };

  const openEdit = (row) => {
    const { theme, pageNo, fileName, classId } = row;
    reset({ theme, pageNo, file: null, classId });
    setExistingImage(fileName);
    setEditingTheme(row);
    setActiveModal("EDIT");
  };

  /* ================= SAVE ================= */

  const onSubmit = (data) => {
    if (themeUploadMutation.isPending) return;

    if (editingTheme) data["id"] = editingTheme.id;

    const formData = new FormData();
    const { file, ...metadata } = data;

    formData.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    if (processedFile) {
      formData.append("file", processedFile);
    } else if (file?.length) {
      formData.append("file", file[0]);
    }

    themeUploadMutation.mutate(formData, {
      onSuccess: () => setActiveModal(""),
    });
  };

  //   const handleToggleStatus = (data) => {
  //     const { active, id, ...rest } = data;
  //     deleteMutation.mutate({
  //       id,
  //       isCurrent: active === "Y" ? "N" : "Y",
  //     });
  //   };

  const handleView = async (s) => {
    if (!s.fileName) {
      alert("There is no file");
      return;
    }
    const pdfUrl = File_Base_Url + s.fileName;

    setSelectedFile({ fileName: s.fileName, filePath: pdfUrl, isPdf: true, isDownloadable: true });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessedFile(file);
  };

  return (
    <div className="container">
      <div className="addfee-head">
        <div>
          <select
            className={`form-control`}
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value={0}>All</option>
            {classes?.map((cl) => (
              <option key={cl.classId} value={cl.classId}>
                {cl.className || cl.classId}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add Theme
        </button>
      </div>

      <div className="listsec">
        <div className="listbox academicterm theading">
          <div>Sl.</div>
          <div>Theme</div>
          <div>Page No</div>
          <div>Class</div>
          <div>Action</div>
        </div>

        <ul>
          {isLoadingThemes ? (
            <li>
              <Loader />
            </li>
          ) : !themes?.length ? (
            <li>
              <div className="listbox academicterm text-center">
                No Data Found
              </div>
            </li>
          ) : (
            <>
              {themes?.map((s, index) => (
                <li key={s.id}>
                  <div className="listbox academicterm">
                    <div>{index + 1}</div>
                    <div data-head="Theme">{s.theme}</div>
                    <div data-head="Page No">{s.pageNo}</div>
                    <div data-head="Class">
                      {s?.classname || s?.className || "-"}
                    </div>
                    <div className="actionbtns actions-heading">
                      {/* <div
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
                      </div> */}
                      <button className="editBtn" onClick={() => openEdit(s)}>
                        Edit
                      </button>
                      <button className="editBtn" onClick={() => handleView(s)}>
                        View
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </>
          )}
        </ul>
      </div>

      <FileViewer
        file={selectedFile}
        open={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        title="Theme Attachments"
      />

      <div>
        {images.map((src, i) => (
          <img key={i} src={src} alt={`Page ${i + 1}`} />
        ))}
      </div>
      {/* POPUP */}
      {activeModal && (
        <Popup
          title={editingTheme ? "Edit Theme" : "Add Theme"}
          closeOnOutsideClick={false}
          onClose={() => setActiveModal("")}
          onSave={handleSubmit(onSubmit)}
          saveText={
            editingTheme
              ? themeUploadMutation.isPending
                ? "Saving...."
                : "Save Changes"
              : themeUploadMutation.isPending
                ? "Saving...."
                : "Save"
          }
          submitClass={"btn btn-primary fullwidth"}
        >
          <div className="inputRow">
            <label>Class</label>
            <div>
              <select
                className={`form-control ${
                  errors?.classId ? "is-invalid" : ""
                }`}
                {...register("classId")}
              >
                <option value={""}>Select Class</option>
                {classes?.map((cl) => (
                  <option key={cl.classId} value={cl.classId}>
                    {cl.className}
                  </option>
                ))}
              </select>
            </div>
            {errors.classId?.message && (
              <div className="invalid-feedback d-block">
                {errors.classId?.message}
              </div>
            )}
          </div>

          <div className="inputRow">
            <label>Theme</label>
            <div>
              <input
                placeholder="Theme name"
                className={`form-control ${errors.theme ? "is-invalid" : ""}`}
                {...register("theme")}
              />
            </div>
            {errors.theme?.message && (
              <div className="invalid-feedback d-block">
                {errors.theme?.message}
              </div>
            )}
          </div>

          <div className="inputRow">
            <label>Page No</label>
            <div>
              <input
                placeholder="1-4"
                className={`form-control ${errors.pageNo ? "is-invalid" : ""}`}
                {...register("pageNo")}
              />
            </div>
            {errors.pageNo?.message && (
              <div className="invalid-feedback d-block">
                {errors.pageNo?.message}
              </div>
            )}
          </div>

          <div className="inputRow formbox addtopic">
            <label>Document</label>
            {existingImage && !file?.length ? (
              <div className="existing-file-box">
                <span className="file-name">📄 {existingImage}</span>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="application/pdf"
                  className={`form-control ${errors.file ? "is-invalid" : ""}`}
                  {...register("file", {
                    onChange: handleFileChange, // ✅ RHF-safe
                  })}
                />
                {errors.file?.message && (
                  <div className="invalid-feedback d-block">
                    {errors.file?.message}
                  </div>
                )}
              </div>
            )}

            {(file?.length > 0 || existingImage) && (
              <button
                type="button"
                className="deletebtn"
                onClick={() => {
                  resetField("file");
                  setExistingImage(null);
                }}
              >
                <X size={16} />{" "}
              </button>
            )}
          </div>

          {/* <div className="inputRow">
            <label>Status</label>
            <select className="form-control" {...register("active")}>
              <option value="Y">Active</option>
              <option value="N">Inactive</option>
            </select>
          </div> */}
        </Popup>
      )}
    </div>
  );
}

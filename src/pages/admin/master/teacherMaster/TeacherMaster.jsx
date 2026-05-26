// TeacherMaster.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "../../../../utills/axiosInstance";
import { Pencil, Eye } from "lucide-react";
import Popup from "../../../../components/Popup";
import { useNavigate } from "react-router-dom";

export default function TeacherMasterHero() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    designations: [],
    qualifications: [],
    specializations: [],
  });

  const [filters, setFilters] = useState({
    searchKey: "",
    designation: "",
    qualification: "",
    specialization: "",
  });

  const [sortParams, setSortParams] = useState({
    sortBy: "joiningDate",
    sortDir: "desc",
  });

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [statusConfirmTeacher, setStatusConfirmTeacher] = useState(null);

  const schoolId = "SCH001";
  const currentUserId = "ADM_000001";

  /* ---------- Infinite Scroll ---------- */
  const observer = useRef();
  const lastTeacherElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  /* ---------- Load Filters ---------- */
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/teachers/filters?schoolId=${schoolId}`
        );
        if (res.data.status === "Success") {
          setFilterOptions(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };
    fetchFilters();
  }, []);

  /* ---------- Load Teachers ---------- */
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const params = {
          schoolId,
          page,
          size: 10,
          sortBy: sortParams.sortBy,
          sortDir: sortParams.sortDir,
          ...filters,
        };

        Object.keys(params).forEach(
          (k) => (params[k] === "" || params[k] == null) && delete params[k]
        );

        const res = await axiosInstance.get("/api/teachers", { params });
        const data = res.data.data;

        setTeachers((prev) =>
          page === 0 ? data.content : [...prev, ...data.content]
        );

        setHasMore(!data.lastPage);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [page, filters, sortParams, refreshKey]);

  /* ---------- Handlers ---------- */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
    setPage(0);
    setTeachers([]);
  };

  const handleSortChange = (e) => {
    const [sortBy, sortDir] = e.target.value.split(",");
    setSortParams({ sortBy, sortDir });
    setPage(0);
    setTeachers([]);
  };

  const handleToggleClick = (teacher) => {
    setStatusConfirmTeacher(teacher);
  };

  const executeStatusToggle = async () => {
    const teacher = statusConfirmTeacher;
    if (!teacher) return;

    setStatusConfirmTeacher(null);

    const newStatus = teacher.active === "Y" ? "N" : "Y";

    setTeachers((prev) =>
      prev.map((t) =>
        t.teacherId === teacher.teacherId ? { ...t, active: newStatus } : t
      )
    );

    try {
      await axiosInstance.post("/api/teachers", {
        ...teacher,
        active: newStatus,
        schoolId: schoolId,
        userId: currentUserId,
      });
    } catch (err) {
      console.error("Status update failed", err);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleEdit = (teacher) => {
    navigate(`/admin/edit-teacher`, {
      state: { teacher },
    });
  };
  const handleClearFilters = () => {
    setFilters({
      searchKey: "",
      designation: "",
      qualification: "",
    });

    setSort("joiningDate,desc"); // optional: reset sort
    setPage(0);                  // reset pagination if used
  };

  /* ---------- UI ---------- */
  return (
    <div className="container">
      <div className="addfee-head">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/add-teacher")}
        >
          + Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="whitebox">
        <div className="formbox searchsec">
          <ul>
            <li className="fullsec">
              <label>Search</label>
              <input
                className="form-control"
                name="searchKey"
                placeholder="Name or Phone..."
                value={filters.searchKey}
                onChange={handleFilterChange}
              />
            </li>

            <li>
              <label>Designation</label>
              <select
                className="form-control"
                name="designation"
                value={filters.designation}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {filterOptions.designations.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </li>

            <li>
              <label>Qualification</label>
              <select
                className="form-control"
                name="qualification"
                value={filters.qualification}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {filterOptions.qualifications.map((q) => (
                  <option key={q}>{q}</option>
                ))}
              </select>
            </li>

            <li>
              <label>Sort By</label>
              <select className="form-control" onChange={handleSortChange}>
                <option value="joiningDate,desc">Joining Date (Newest)</option>
                <option value="joiningDate,asc">Joining Date (Oldest)</option>
                <option value="fullName,asc">Name (A-Z)</option>
                <option value="fullName,desc">Name (Z-A)</option>
              </select>
            </li>
            <li >
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClearFilters}
              >
                Clear
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* List */}
      <div className="listsec syllabus-master ">
        <div className="listbox studentlist theading">
          <div>Sl.</div>
          <div className="img-width">Photo</div>
          <div>Full Name</div>
          <div>Designation</div>
          <div>Phone / Email</div>
          <div>Class Teacher</div>
          <div>Basic Salary</div>
          <div>Joining Date</div>
          <div>Status / Action</div>
        </div>

        <ul>
          {teachers.map((t, i) => {
            const isLast = teachers.length === i + 1;
            return (
              <li
                key={t.teacherId}
                ref={isLast ? lastTeacherElementRef : null}
              >
                <div className="listbox studentlist">
                  <div>{i + 1}</div>
                  <TeacherRowData
                    t={t}
                    onToggle={() => handleToggleClick(t)}
                    onEdit={() => handleEdit(t)}
                  />
                </div>
              </li>
            );
          })}

          {loading && (
            <li>
              <div className="listbox text-center">Loading more data…</div>
            </li>
          )}

        </ul>
      </div>

      {/* Confirm Popup */}
      {statusConfirmTeacher && (
        <Popup
          title={
            statusConfirmTeacher.active === "Y"
              ? "Deactivate Teacher"
              : "Activate Teacher"
          }
          onClose={() => setStatusConfirmTeacher(null)}
        >
          <p>
            Are you sure you want to{" "}
            <b>
              {statusConfirmTeacher.active === "Y"
                ? "Deactivate"
                : "Activate"}
            </b>{" "}
            {statusConfirmTeacher.fullName}?
          </p>
          <button className="btn btn-primary" onClick={executeStatusToggle}>
            Confirm
          </button>
        </Popup>
      )}
    </div>
  );
}
const formatDate = (dateStr) => {
  if (!dateStr) return "---";

  const date = new Date(dateStr);
  if (isNaN(date)) return "---";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount) || amount === "") {
    return null;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
/* ---------- Row ---------- */
const TeacherRowData = ({ t, onToggle, onEdit }) => {
  const isInactive = t.active === "N";
  const formattedSalary = formatCurrency(t.basicSalary);
  const profilePhoto = t.documents?.find(doc => doc.documentName === "TEACHER_PHOTO")?.storagePath;
  const navigate = useNavigate();

  return (
    <>
      {/* <div className="tphoto" data-head="Photo"><img src="/images/defaultprofile.jpg" alt="Photo" height={40} /></div> */}
      {/* <div className="img-width">
        <div className="simg tphoto" data-head="Photo">
          <img
            src={profilePhoto || "/images/defaultprofile.jpg"}
            alt="Photo"
            onError={(e) => {
              e.target.src = "/images/defaultprofile.jpg";
            }}
          />
        </div>
      </div> */}
      <div data-head="Photo" className="scheckbox img-width">
        <label><div className="simg"><img
            src={profilePhoto || "/images/defaultprofile.jpg"}
            alt="Photo"
            onError={(e) => {
              e.target.src = "/images/defaultprofile.jpg";
            }}
          />  </div>
           </label>
      </div>
      <div data-head="Name">
        <strong>{t.fullName}</strong>
        <small className="text-muted d-block">{t.gender}</small>
      </div>

      <div data-head="Designation">{t.designation}</div>

      <div data-head="Phone/Email">
        {t.phone}
        <small className="text-muted d-block">{t.email}</small>
      </div>

      <div data-head="Class Teacher">
        {t.className || "---"}
      </div>

      <div data-head="Basic Salary">
        {formattedSalary ? `₹ ${formattedSalary}` : "---"}
      </div>

      <div data-head="Joining Date">
        {formatDate(t.joiningDate)}
      </div>

      <div className="actionbtns">
        <div
          className={`defaultbtn ${t.active === "Y" ? "on" : "off"}`}
          onClick={onToggle}
        >
          <div className="toggle-circle">{t.active === "Y" ? "✓" : "✕"}</div>
        </div>
        <button
          className="editbtn"
          onClick={(e) => {
            if (isInactive) {
              e.preventDefault();
              return; // Stop the function here
            }
            onEdit();
          }}
          disabled={isInactive}>
          <Pencil size={18} />
        </button>
        <button className="viewbtn" title="View Details" onClick={() => navigate(`/admin/teacher-profile`, {
          state: { teacherId: t.teacherId }
        })}>
          <Eye size={18} /> <span>Details</span>
        </button>
      </div>
    </>
  );
};

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SendMessage from "../../components/SendMessage";
import axiosInstance from "../../utills/axiosInstance";
import { Eye, CreditCard, Bus, CalendarCheck, Check, Pencil, Search, X, Plus } from "lucide-react";
import SearchPanel from "../../components/SearchPanel";
import { useKeyPairSelector } from "../../context/KeyPairSelectorContext";
import Popup from "../../components/Popup";
import { usePopup } from "../../context/PopupContext";
import StudentAttendanceCalender from "../../components/Attendance/StudentAttendanceCalender";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [academicYearList, setAcademicYearList] = useState([]);
const { openPopup,modalData,activeModal,closePopup} = usePopup();
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

  const navigate = useNavigate();
  const nonAdmittedInitializedRef = useRef(false);
  // Tab State
  const [activeTab, setActiveTab] = useState("admitted");
  const [pendingAdmissionData, setPendingAdmissionData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastPage, setLastPage] = useState(false);
  const [admittedStudentsData, setAdmittedStudentsData] = useState([]);
  const [admittedCurrentPage, setAdmittedCurrentPage] = useState(0);
  const [admittedLoading, setAdmittedLoading] = useState(false);
  const [admittedLastPage, setAdmittedLastPage] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    admissionYear: "",
    className: "",
    admissionStatus: "",
  });
  const [sortBy, setSortBy] = useState("appliedOn");
  const [sortDir, setSortDir] = useState("DESC");
  const [admittedSearchText, setAdmittedSearchText] = useState("");
  const [admittedFilters, setAdmittedFilters] = useState({
    academicYear: "",
    className: "",
    phonePrimary: "",
    status: "",
  });
  const [admittedSortBy, setAdmittedSortBy] = useState("enrollmentDate");
  const [admittedSortDir, setAdmittedSortDir] = useState("DESC");

  const [availableClasses, setAvailableClasses] = useState([]);

  const isFetchingRef = useRef(false);
  const lastPageRef = useRef(false);
  const currentPageRef = useRef(0);
  const mobileObserverTarget = useRef(null);
  const searchTimeoutRef = useRef(null);

  const admittedIsFetchingRef = useRef(false);
  const admittedLastPageRef = useRef(false);
  const admittedCurrentPageRef = useRef(0);
  const admittedMobileObserverTarget = useRef(null);
  const admittedSearchTimeoutRef = useRef(null);
  const [totalStudent, setTotalStudent] = useState(null);
  const {
    size,
    handleSelect,
    isSelected,
    isAllSelected,
    handleSelectAll,
    clear
    
  } = useKeyPairSelector();

  const fetchPendingAdmission = async (page = 0, append = false) => {
    if (isFetchingRef.current || (page > 0 && lastPageRef.current)) return;

    try {
      isFetchingRef.current = true;
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", "10");
      if (searchText.trim()) {
        const trimmedVal = searchText.trim();
        const isNumber = /^\d+$/.test(trimmedVal);
        if (isNumber) { 
          params.append("phonePrimary", trimmedVal);
        } else { 
          params.append("studentFirstName", trimmedVal);
        }
      } 

      if (filters.admissionYear) {
        params.append("admissionYear", filters.admissionYear);
      }
      if (filters.className) {
        params.append("className", filters.className);
      }
      if (filters.admissionStatus) {
        params.append("admissionStatus", filters.admissionStatus);
      }

      params.append("sortBy", sortBy);
      params.append("sortDir", sortDir);

      const res = await axiosInstance.get(
        `/api/admissions/getAllCandidates?${params.toString()}`
      );

      const responseData = res.data?.data;
      const studentList = responseData?.content || [];
      const isLastPage = responseData?.lastPage || false;

      setPendingAdmissionData(prev =>
        append ? [...prev, ...studentList] : studentList
      );

      setLastPage(isLastPage);
      lastPageRef.current = isLastPage;
      setCurrentPage(page);
      currentPageRef.current = page;

    } catch (error) {
      console.error("error in fetching pending admission", error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }

    console.log("NonAdmitted fetch:", {
      searchText,
      page: page
    });
  };

  const fetchAdmittedStudents = async (page = 0, append = false) => {
    if (admittedIsFetchingRef.current || (page > 0 && admittedLastPageRef.current)) return;

    try {
      admittedIsFetchingRef.current = true;
      setAdmittedLoading(true);

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", "10");
      params.append("sortBy", admittedSortBy);
      params.append("sortDir", admittedSortDir);

      if (admittedSearchText.trim()) {
        const trimmedSearch = admittedSearchText.trim();
        const isPhone = /^\d+$/.test(trimmedSearch);

        if (isPhone) {
          params.append("phonePrimary", trimmedSearch);
        } else {
          params.append("searchName", trimmedSearch);
        }
      }

      if (admittedFilters.academicYear) {
        params.append("academicYear", admittedFilters.academicYear);
      }
      if (admittedFilters.className) {
        params.append("className", admittedFilters.className);
      }
      if (admittedFilters.status) {
        params.append("status", admittedFilters.status);
      }

      const res = await axiosInstance.get(`/api/students/getAllStudents?${params.toString()}`);
      const responseData = res.data?.data;
      const studentList = responseData?.content || [];
      const isLastPage = responseData?.lastPage || false;
      // console.log(" students p", res.data);
      if (append) {
        setAdmittedStudentsData(prev => [...prev, ...studentList]);
      } else {
        setAdmittedStudentsData(studentList);
      }
      setTotalStudent(responseData?.totalElements);
      setAdmittedLastPage(isLastPage);
      admittedLastPageRef.current = isLastPage;
      setAdmittedCurrentPage(page);
      admittedCurrentPageRef.current = page;

    } catch (error) {
      console.error("error in fetching admitted students", error);
    } finally {
      setAdmittedLoading(false);
      admittedIsFetchingRef.current = false;
    }
  };

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await axiosInstance.get("/api/academicYear");
        const years = res.data || [];
        setAcademicYearList(years);

        const currentYearObj = years.find((y) => y.isCurrent === "Y");

        if (currentYearObj) {
          const currentYearValue = currentYearObj.academicYear;

          // Set default for Non-Admitted filters
          setFilters((prev) => ({
            ...prev,
            admissionYear: currentYearValue,
          }));

          // Set default for Admitted filters
          setAdmittedFilters((prev) => ({
            ...prev,
            academicYear: currentYearValue,
          }));
        }

      } catch (error) {
        console.error("Error fetching academic years", error);
      }
    };
    fetchYears();
  }, []);

  // New Logic: Fetch Classes based on selected Year
  useEffect(() => {
    const selectedYear = activeTab === "nonAdmitted" ? filters.admissionYear : admittedFilters.academicYear;

    const fetchClassesByYear = async () => {
      if (!selectedYear) {
        setAvailableClasses([]); // Clear classes if no year is selected
        return;
      }
      try {
        // Updated endpoint to fetch classes dependent on the year
        const res = await axiosInstance.get(`/api/v1/class/getAllClassesByAcademicYear?academicYear=${selectedYear}`);
        const classes = res.data?.data || res.data || [];
        setAvailableClasses(classes);
      } catch (error) {
        console.error("Error fetching dependent classes", error);
      }
    };
    fetchClassesByYear();
  }, [filters.admissionYear, admittedFilters.academicYear, activeTab]);


  useEffect(() => {
    if (activeTab !== "nonAdmitted") return;
    if (!nonAdmittedInitializedRef.current) {
      nonAdmittedInitializedRef.current = true;
      fetchPendingAdmission(0, false);
    }
  }, [activeTab]);



  useEffect(() => {
    if (activeTab !== "nonAdmitted") return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    lastPageRef.current = false;
    setCurrentPage(0);
    fetchPendingAdmission(0, false);


    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText, filters, sortBy, sortDir]);

  useEffect(() => {
    if (activeTab !== "admitted") return;
    if (admittedSearchTimeoutRef.current) {
      clearTimeout(admittedSearchTimeoutRef.current);
    }
    setAdmittedCurrentPage(0);
    setAdmittedStudentsData([]);
    admittedLastPageRef.current = false;

    fetchAdmittedStudents(0, false);


    return () => {
      if (admittedSearchTimeoutRef.current) {
        clearTimeout(admittedSearchTimeoutRef.current);
      }
    };
  }, [admittedSearchText, admittedFilters, admittedSortBy, admittedSortDir, activeTab]);

  useEffect(() => {
    if (activeTab !== "nonAdmitted") {
      nonAdmittedInitializedRef.current = false;
    }
  }, [activeTab]);


  const getFullName = (s) => {
    const first = s.studentFirstName || " ";
    const middle = s.studentMiddleName ? s.studentMiddleName + " " : " ";
    const last = s.studentLastName || "";
    return `${first} ${middle} ${last}`.trim();
  };



  const getStatusDisplay = (status) => {
    if (!status) return { label: "---", className: "inactive" };

    const activeStatuses = [
      "PENDING",
      "FORM_REQUEST",
      "REGISTERED",
      "ENQUIRY",
      "INVOICE_GENERATED",
      "APPLICATION_APPROVED",
    ];

    const className = activeStatuses.includes(status)
      ? "active"
      : "inactive";

    return { label: status, className };
  };

  const sendSelectedReminders = () => alert("Feature coming soon");
  const sendAllReminders = () => alert("Feature coming soon");

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdmittedFilterChange = (key, value) => {
    setAdmittedFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortDir("ASC");
    }
  };

  const handleAdmittedSortChange = (field) => {
    if (admittedSortBy === field) {
      setAdmittedSortDir((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setAdmittedSortBy(field);
      setAdmittedSortDir("ASC");
    }
  };

  const clearFilters = () => {
    setAvailableClasses([]); // Clear classes when filters are reset
    const currentYearObj = academicYearList.find(y => y.isCurrent === "Y");
    const defaultYear = currentYearObj ? currentYearObj.academicYear : "";
    if (activeTab === "nonAdmitted") {
      setSearchText("");
      setFilters({
        admissionYear: defaultYear,
        className: "",
        admissionStatus: "",
      });
      setSortBy("appliedOn"); // Changed back to match default behavior
      setSortDir("DESC");
    } else {
      setAdmittedSearchText("");
      setAdmittedFilters({
        academicYear: defaultYear,
        className: "",
        phonePrimary: "",
        status: "",
      });
      setAdmittedSortBy("enrollmentDate");
      setAdmittedSortDir("DESC");
    }
  };

  const handleEditClick = (studentId, candidateId) => {
  if (studentId) {
    localStorage.setItem("studentId", studentId);
    localStorage.setItem("candidateId", candidateId);

  } else {
    localStorage.setItem("candidateId", candidateId);
    localStorage.removeItem("studentId");
  }

  navigate("/admin/admin-admission-review", {
    state: { studentId, candidateId }
  });
};


  const handleNavigateToFees = (studentId, academicYear) => {
    navigate(
      `/admin/payment-details?studentId=${studentId}&academicYear=${academicYear}`
    );
  };

  // --- OBSERVER 1: Non-Admitted Students ---
  useEffect(() => {
    if (activeTab !== "nonAdmitted") return;
    if (loading || lastPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current && !lastPageRef.current) {
          const nextPage = currentPageRef.current + 1;
          fetchPendingAdmission(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (mobileObserverTarget.current) {
      observer.observe(mobileObserverTarget.current);
    }

    return () => {
      if (mobileObserverTarget.current) observer.unobserve(mobileObserverTarget.current);
    };
  }, [activeTab, loading, lastPage, pendingAdmissionData]);


  // --- OBSERVER 2: Admitted Students ---
  useEffect(() => {
    if (activeTab !== "admitted") return;
    if (admittedLoading || admittedLastPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !admittedIsFetchingRef.current && !admittedLastPageRef.current) {
          const nextPage = admittedCurrentPageRef.current + 1;
          fetchAdmittedStudents(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (admittedMobileObserverTarget.current) {
      observer.observe(admittedMobileObserverTarget.current);
    }

    return () => {
      if (admittedMobileObserverTarget.current) observer.unobserve(admittedMobileObserverTarget.current);
    };
  }, [activeTab, admittedLoading, admittedLastPage, admittedStudentsData]);

  const handleStatusToggle = (student) => {
    const isActive = student.status === "ACTIVE";
    const actionText = isActive ? "deactivate" : "re-activate";

    // Open the custom popup instead of window.confirm
    openPopup("CONFIRM_TOGGLE_STATUS", {
      student: student,
      message: `Are you sure you want to ${actionText} ${student.studentName}?`,
      confirmText: isActive ? "Deactivate" : "Activate",
      buttonClass: isActive ? "deletebtn" : "saveBtn" // Custom styling based on action
    });
  };

  const processStatusToggle = async (student) => {
    try {
      const res = await axiosInstance.put(`/api/students/toggle-status/${student.studentId}`);
      const newStatus = res.data.data;

      if (res.data.status === "Success" || res.status === 200) {
        setAdmittedStudentsData((prev) =>
          prev.map((s) =>
            s.studentId === student.studentId ? { ...s, status: newStatus } : s
          )
        );
        closePopup(); // Close modal on success
      }
    } catch (error) {
      console.error("Failed to update status", error);
      alert(error.response?.data?.message || "Error updating status");
    }
  };

  const handleToggle = (student) => {
    const {
      studentId,
      studentName,
      rollNumber,
      className,
      primaryContactPhone,
    } = student;
    handleSelect({
      key: studentId,
      value: {
        studentId,
        studentName,
        rollNumber,
        className,
        primaryContactPhone,
      },
    });
  };

  const handleNavigateToSendNotification = () => {
    navigate("/admin/send-notification", {
      state: { searchText, ...admittedFilters },
    });
  };

  useEffect(() => {
    clear();
  }, [admittedFilters, searchText]);

  return (
    <div className="mainpro">
      <div className="container">
        <div className="whitebox">
          <SearchPanel
            type="advanced"
            activeTab={activeTab}
            filters={filters}
            admittedFilters={admittedFilters}
            searchText={searchText}
            admittedSearchText={admittedSearchText}
            setSearchText={setSearchText}
            setAdmittedSearchText={setAdmittedSearchText}
            handleFilterChange={handleFilterChange}
            handleAdmittedFilterChange={handleAdmittedFilterChange}
            availableClasses={availableClasses}
            academicYearList={academicYearList} // Added prop
            sortBy={sortBy}
            admittedSortBy={admittedSortBy}
            handleSortChange={handleSortChange}
            handleAdmittedSortChange={handleAdmittedSortChange}
            sortDir={sortDir}
            admittedSortDir={admittedSortDir}
            setSortDir={setSortDir}
            setAdmittedSortDir={setAdmittedSortDir}
            clearFilters={clearFilters}
          />
        </div>

        <div className="sendselected">
         

        {admittedStudentsData.length > 0 && ( 
           <label className="btn lightbtn"><input type="checkbox" checked={isAllSelected} onChange={() => handleSelectAll(totalStudent)} /> <span>Select All</span></label>
        )}
         {size > 0 && ( 
            <button className="btn btn-primary" onClick={handleNavigateToSendNotification}>
              Procced for brodcast ({size})
            </button> 
        )}
        </div>
        <div className="tabs">
          <button className={`tab ${activeTab === "admitted" ? "activeTab" : ""}`} onClick={() => setActiveTab("admitted")}>Admitted Students</button>
          <button className={`tab ${activeTab === "nonAdmitted" ? "activeTab" : ""}`} onClick={() => setActiveTab("nonAdmitted")}>Non-Admitted Students</button>
        </div>

        {activeTab === "nonAdmitted" && (
          <div className="listsec syllabus-master" key="nonAdmitted">
            <div className="listbox studentlist theading">
              <div>Sl.</div>
              <div>Name</div>
              <div>Class</div>
              <div>Contact</div>
              <div>Applied On</div>
              <div className="actions-heading">Status</div>
              {/* <div>Action</div> */}
            </div>
            <ul>
              {pendingAdmissionData.map((student, index) => (
                <li key={student.candidateId || index}>
                  <div className="listbox studentlist">
                    <div data-head="Sl.">{index + 1}</div>
                    <div data-head="Name">{getFullName(student)}</div>
                    <div data-head="Class" className="classname"> {student.className || "---"} </div>
                    <div data-head="Contact">{student.academicContactPrimaryPhone || "---"} </div>
                    <div data-head="Applied On">{formatDate(student.appliedOn || "---")}  </div>
                    <div data-head="Status" className="actions-heading actionbtns"> <div className={`status btn ${getStatusDisplay(student.admissionStatus).className}`}>{getStatusDisplay(student.admissionStatus).label}</div></div>
                    {/* <div className="actionbtns">
                      <button className="editbtn" title="Edit Student Information" onClick={() => handleEditClick(student.studentId, student.candidateId)}><Pencil size={18} /></button>
                    </div> */}
                  </div>
                </li>
              ))}
              {loading && <div className="text-center py-3">Loading...</div>}
              {lastPage && !loading && pendingAdmissionData.length > 0 && <div className="text-center py-3 text-muted">No More</div>}
              {!loading && pendingAdmissionData.length === 0 && <div className="text-center py-3 text-muted">No students found.</div>}
              {!lastPage && !loading && <div ref={mobileObserverTarget} style={{ height: "40px", margin: "10px 0" }} />}
            </ul>
          </div>
        )}
        

        {activeTab === "admitted" && (
          <div className="listsec admittedstudent syllabus-master" key="admitted">
            <div className="listbox studentlist theading">
              <div>Sl.</div>
              <div>Photo</div>
              {/* {admittedStudentsData.length > 0 && (
                <div className="allcheckbox">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => handleSelectAll(totalStudent)}
                  />
                </div>
              )} */} 
              <div>Name</div>
              <div className="classname">Class</div>
              <div className="roll-heading">Roll No</div>
              <div>Relation</div>
              <div className="fix-heading">Contact</div>
              <div className="fix-heading">Applied On</div>
              <div className="fix-heading">Joining Date</div>
              <div className="fix-heading">Enrolled On</div>
              <div className="actions-heading">Status / Action</div>
            </div>
            <ul>
              {admittedStudentsData.map((student, index) => (
                <li key={student.studentId || index}>
                  <div className={student.status === "INACTIVE" ? "inactive listbox studentlist" : "listbox studentlist"}>
                    <div>{index + 1}</div>

                    <div className="scheckbox">
                      <label>
                        {/* <div className="simg"> <img src="../images/default.jpg" /> </div> */}
                        <div className="simg"> <img src={student.imageUrl || "../images/default.jpg"} /> </div>
                        <input type="checkbox" checked={isSelected(student.studentId)} onChange={() => handleToggle(student)} /></label>
                    </div>
                    <div data-head="Name">{student.studentName || "---"}</div>
                    <div data-head="Class" className="classname">{student.className || "---"}</div>
                    <div data-head="Roll No" className="roll-heading">{student.rollNumber || "---"} </div>
                    <div data-head="Relation" >
                      {student.primaryContactRelation === "Father" ? (
                        <>{student.primaryContactName || "---"} <small>(Father)</small></>
                      ) : student.primaryContactRelation === "Mother" ? (
                        <>{student.primaryContactName || "---"} <small>(Mother)</small></>
                      ) : student.primaryContactRelation === "Guardian" ? (
                        <>{student.primaryContactName || "---"} <small>(Guardian)</small></>
                      ) : ("---")}
                    </div>
                    <div data-head="Contact" className="fix-heading">{student.primaryContactPhone || "---"}</div>
                    <div data-head="Applied On" className="fix-heading">{formatDate(student.appliedOn)}</div>
                    <div data-head="Joining Date" className="fix-heading">{formatDate(student.joiningDate)}</div>
                    <div data-head="Enrolled On" className="fix-heading">{formatDate(student.enrollmentDate)}</div>
                    <div className="actionbtns actions-heading">
                      <div
                        className={`defaultbtn ${student.status === "ACTIVE" ? "on" : "off"}`}
                        onClick={() => handleStatusToggle(student)}
                        style={{ cursor: "pointer" }}
                        title={student.status === "ACTIVE" ? "Click to Deactivate" : "Click to Activate"}
                      >
                        <div className="toggle-circle">{student.status === "ACTIVE" ? "✓" : "✕"}</div>
                      </div>
                      <button className="viewbtn" title="View Details" onClick={() => navigate(`/admin/profile?studentId=${student.studentId}`)} >
                        <Eye size={18} /> <span>Details</span>
                      </button>
                      <button className="successbtn" title="View Payment History" onClick={() => handleNavigateToFees(student?.studentId, student?.academicYear)}>
                        <CreditCard size={18} /> <span>Payment</span>
                      </button>
                      <button className="successbtn" title="View Attendance"  onClick={() =>
    openPopup("ATTENDANCE_POPUP", {
      studentId: student?.studentId,
      
    })
  }>
                        <CalendarCheck size={18} /> <span>Attendance</span>
                      </button>
                      <button className="editbtn" title="Edit Student Information" onClick={() => handleEditClick(student.studentId, student.candidateId)} >
                        <Pencil size={18} /> <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {admittedLastPage && <div className="text-center py-3 text-muted">No More.</div>}
              {admittedLoading && <div className="text-center py-3">Loading...</div>}
              {!admittedLastPage && !admittedLoading && <div ref={admittedMobileObserverTarget} style={{ height: "40px", margin: "10px 0" }} />}
            </ul>
          </div>
        )}

        {activeModal === "ATTENDANCE_POPUP" && (
          <Popup title="Attendance" onClose={closePopup}>
            <StudentAttendanceCalender
              entityId={modalData?.studentId}
              academicYear={modalData?.academicYear}
            />
          </Popup>
        )}

        {/* New Status Confirmation Popup */}
        {activeModal === "CONFIRM_TOGGLE_STATUS" && (
          <Popup
            title="Confirm Action"
            onClose={closePopup}
            onSave={() => processStatusToggle(modalData.student)}
            saveText={modalData.confirmText}
            submitClass={modalData.student.status === "ACTIVE" ? "btn-danger" : "btn-primary"}
          >
            <div className="text-center py-4">
              <p style={{ fontSize: '1.1rem' }}>{modalData.message}</p>
            </div>
          </Popup>
        )}
      </div>
    </div>
  );
}

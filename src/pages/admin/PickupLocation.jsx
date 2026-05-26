// IntegratedFeeEngine.jsx
import React, { useState, useEffect } from "react";
 import Popup from "../../components/Popup";
export default function PickupLocation() {
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  // ------------------------
  // CLASS FEES (with new fields)
  // ------------------------
  const [CLASS_FEES, setClassFees] = useState({
    Nursery: {
      tuition: 5500,
      transport: 1500, // default transport monthly scheme (kept for reference)
      quarterly: 16500,
      once: 3000,
      annual: 60500,
    },
    LKG: {
      tuition: 6000,
      transport: 1500,
      quarterly: 18000,
      once: 3000,
      annual: 65000,
    },
    UKG: {
      tuition: 6500,
      transport: 1500,
      quarterly: 19500,
      once: 3000,
      annual: 68000,
    },
  });

  // ------------------------
  // PICKUP LOCATIONS (transport master)
  // ------------------------
  const [pickupData, setPickupData] = useState([
    {
      pickup_id: 1,
      pickup_name: "Sector 10 (North Route)",
      monthly_fee: 1500,
      quarterly_fee: 4500,
      yearly_fee: 18000,
      status: "Active",
      start_date: "2025-04-01",
      end_date: "2026-03-31",
    },
    {
      pickup_id: 2,
      pickup_name: "Green Park (South Route)",
      monthly_fee: 1800,
      quarterly_fee: 5400,
      yearly_fee: 21600,
      status: "Active",
      start_date: "2025-04-01",
      end_date: "2026-03-31",
    },
  ]);

  // ------------------------
  // STUDENTS (class assignment + transport mapping)
  // ------------------------
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Aarav",
      class_name: "Nursery",
      pickup_id: 1,
      feeType: "Monthly", // Monthly | Quarterly | Term | Once | Annual
      transportAssigned: true,
    },
    {
      id: 2,
      name: "Isha",
      class_name: "Nursery",
      pickup_id: null,
      feeType: "Annual",
      transportAssigned: false,
    },
    {
      id: 3,
      name: "Rohan",
      class_name: "LKG",
      pickup_id: 2,
      feeType: "Quarterly",
      transportAssigned: true,
    },
    {
      id: 4,
      name: "Meera",
      class_name: "LKG",
      pickup_id: null,
      feeType: "Monthly",
      transportAssigned: false,
    },
    {
      id: 5,
      name: "Kabir",
      class_name: "UKG",
      pickup_id: null,
      feeType: "Annual",
      transportAssigned: false,
    },
    {
      id: 6,
      name: "Sara",
      class_name: "UKG",
      pickup_id: 1,
      feeType: "Monthly",
      transportAssigned: true,
    },
  ]);

  // ------------------------
  // UI / Form states for adding/editing class, pickup, student
  // ------------------------
  const [tab, setTab] = useState("dashboard"); // dashboard | classes | pickups | students | calculator

  // Class form state
  const [classFormOpen, setClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(""); // class name string when editing
  const [classNameInput, setClassNameInput] = useState("");
  const [classFeesInput, setClassFeesInput] = useState({
    tuition: "",
    transport: "",
    quarterly: "",
    once: "",
    annual: "",
  });

  // Pickup form state
  const [pickupEditId, setPickupEditId] = useState(null);
  const [pickupForm, setPickupForm] = useState({
    pickup_id: "",
    pickup_name: "",
    monthly_fee: "",
    quarterly_fee: "",
    yearly_fee: "",
    status: "Active",
    start_date: "",
    end_date: "",
  });

  // Student form state
  const [studentEditId, setStudentEditId] = useState(null);
  const [studentForm, setStudentForm] = useState({
    id: "",
    name: "",
    class_name: "",
    pickup_id: "",
    feeType: "Monthly",
    transportAssigned: false,
  });


  // RESET HANDLERS (no changes to your existing logic)
const resetClassForm = () => {
  setEditingClass("");
  setClassNameInput("");
  setClassFeesInput({
    tuition: "",
    transport: "",
    quarterly: "",
    once: "",
    annual: "",
  });
};

const resetPickupForm = () => {
  setPickupEditId(null);
  setPickupForm({
    pickup_id: "",
    pickup_name: "",
    monthly_fee: "",
    quarterly_fee: "",
    yearly_fee: "",
    status: "Active",
    start_date: "",
    end_date: "",
  });
};

const resetStudentForm = () => {
  setStudentEditId(null);
  setStudentForm({
    id: "",
    name: "",
    class_name: "",
    pickup_id: "",
    feeType: "Monthly",
    transportAssigned: false,
  });
};

  // Calculator UI state
  const [calcSelectedStudentId, setCalcSelectedStudentId] = useState("");
  const [calcSelectedClass, setCalcSelectedClass] = useState("");
  const [calcSelectedPickupId, setCalcSelectedPickupId] = useState("");
  const [calcFeeType, setCalcFeeType] = useState("Monthly");

  // Computed values
  const [calcClassAmount, setCalcClassAmount] = useState(0);
  const [calcTransportAmount, setCalcTransportAmount] = useState(0);
  const [calcTotal, setCalcTotal] = useState(0);

  // Helper: get pickup row by id
  const findPickupById = (id) => pickupData.find((p) => p.pickup_id === Number(id));

  // Helper: get student by id
  const findStudentById = (id) => students.find((s) => s.id === Number(id));

  // ------------------------
  // Add / Edit Class Functions
  // ------------------------
  const openAddClass = () => {
    setClassFormOpen(true);
    setEditingClass("");
    setClassNameInput("");
    setClassFeesInput({
      tuition: "",
      transport: "",
      quarterly: "",
      once: "",
      annual: "",
    });
  };

  const openEditClass = (clsName) => {
    const fees = CLASS_FEES[clsName];
    setClassFormOpen(true);
    setEditingClass(clsName);
    setClassNameInput(clsName);
    setClassFeesInput({
      tuition: fees.tuition ?? "",
      transport: fees.transport ?? "",
      quarterly: fees.quarterly ?? "",
      once: fees.once ?? "",
      annual: fees.annual ?? "",
    });
  };

  const saveClass = () => {
    if (!classNameInput.trim()) {
      alert("Enter class name.");
      return;
    }
    // require some fields
    if (
      classFeesInput.tuition === "" ||
      classFeesInput.quarterly === "" ||
      classFeesInput.annual === ""
    ) {
      alert("Please enter tuition, quarterly and annual amounts.");
      return;
    }

    setClassFees((prev) => ({
      ...prev,
      [classNameInput]: {
        tuition: Number(classFeesInput.tuition),
        transport: Number(classFeesInput.transport || 0),
        quarterly: Number(classFeesInput.quarterly),
        once: Number(classFeesInput.once || 0),
        annual: Number(classFeesInput.annual),
      },
    }));

    // if new class name (not editing), ensure students map has those class references handled elsewhere
    setClassFormOpen(false);
    setEditingClass("");
    setClassNameInput("");
    setClassFeesInput({ tuition: "", transport: "", quarterly: "", once: "", annual: "" });
  };

  const deleteClass = (clsName) => {
    if (!window.confirm(`Delete class ${clsName}?`)) return;
    const newObj = { ...CLASS_FEES };
    delete newObj[clsName];
    setClassFees(newObj);
    // optionally, remove class assignments from students
    setStudents((prev) => prev.map((s) => (s.class_name === clsName ? { ...s, class_name: "" } : s)));
  };

  // ------------------------
  // Pickup CRUD functions
  // ------------------------
  const openNewPickup = () => {
    setPickupEditId(null);
    setPickupForm({
      pickup_id: "",
      pickup_name: "",
      monthly_fee: "",
      quarterly_fee: "",
      yearly_fee: "",
      status: "Active",
      start_date: "",
      end_date: "",
    });
  };

  const editPickup = (row) => {
    setPickupEditId(row.pickup_id);
    setPickupForm({ ...row });
  };

  const savePickup = () => {
    if (!pickupForm.pickup_name.trim()) {
      alert("Enter pickup name");
      return;
    }
    if (pickupEditId) {
      // update existing
      setPickupData((prev) => prev.map((p) => (p.pickup_id === pickupEditId ? { ...pickupForm } : p)));
    } else {
      // add new with generated id
      const newId = pickupData.length ? Math.max(...pickupData.map((p) => p.pickup_id)) + 1 : 1;
      setPickupData((prev) => [...prev, { ...pickupForm, pickup_id: newId }]);
    }
    setPickupEditId(null);
    openNewPickup();
  };

  const deletePickup = (id) => {
    if (!window.confirm("Delete pickup?")) return;
    setPickupData((prev) => prev.filter((p) => p.pickup_id !== id));
    // remove pickup assignment from students
    setStudents((prev) => prev.map((s) => (s.pickup_id === id ? { ...s, pickup_id: null, transportAssigned: false } : s)));
  };

  // ------------------------
  // Student CRUD functions
  // ------------------------
  const openNewStudent = () => {
    setStudentEditId(null);
    setStudentForm({
      id: "",
      name: "",
      class_name: "",
      pickup_id: "",
      feeType: "Monthly",
      transportAssigned: false,
    });
  };

  const editStudent = (row) => {
    setStudentEditId(row.id);
    setStudentForm({
      id: row.id,
      name: row.name,
      class_name: row.class_name,
      pickup_id: row.pickup_id ?? "",
      feeType: row.feeType,
      transportAssigned: !!row.transportAssigned,
    });
  };

  const saveStudent = () => {
    if (!studentForm.name.trim()) {
      alert("Enter student name");
      return;
    }
    if (!studentForm.class_name) {
      alert("Choose class");
      return;
    }

    if (studentEditId) {
      setStudents((prev) => prev.map((s) => (s.id === studentEditId ? { ...studentForm, id: studentEditId } : s)));
    } else {
      const newId = students.length ? Math.max(...students.map((s) => s.id)) + 1 : 1;
      setStudents((prev) => [...prev, { ...studentForm, id: newId }]);
    }
    setStudentEditId(null);
    openNewStudent();
  };

  const deleteStudent = (id) => {
    if (!window.confirm("Delete student?")) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // ------------------------
  // Calculator logic
  // ------------------------
  // When user selects a student in calculator, we prefill class/pickup/feeType
  useEffect(() => {
    if (calcSelectedStudentId) {
      const st = findStudentById(calcSelectedStudentId);
      if (st) {
        setCalcSelectedClass(st.class_name || "");
        setCalcSelectedPickupId(st.pickup_id ?? "");
        setCalcFeeType(st.feeType || "Monthly");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcSelectedStudentId]);

  // Compute class amount and transport amount based on selections
  useEffect(() => {
    let classAmt = 0;
    const cls = calcSelectedClass;
    if (cls && CLASS_FEES[cls]) {
      const fees = CLASS_FEES[cls];
      switch (calcFeeType) {
        case "Monthly":
          classAmt = fees.tuition ?? 0;
          break;
        case "Quarterly":
          classAmt = fees.quarterly ?? (fees.tuition ? fees.tuition * 3 : 0);
          break;
        case "Term":
          classAmt = fees.quarterly ?? (fees.tuition ? fees.tuition * 3 : 0);
          break;
        case "Once":
          classAmt = fees.once ?? 0;
          break;
        case "Annual":
          classAmt = fees.annual ?? 0;
          break;
        default:
          classAmt = 0;
      }
    }

    setCalcClassAmount(classAmt);

    // transport amount logic
    let transportAmt = 0;
    const pickup = findPickupById(calcSelectedPickupId);
    if (pickup && calcFeeType) {
      switch (calcFeeType) {
        case "Monthly":
          transportAmt = pickup.monthly_fee ?? 0;
          break;
        case "Quarterly":
        case "Term":
          transportAmt = pickup.quarterly_fee ?? 0;
          break;
        case "Annual":
          transportAmt = pickup.yearly_fee ?? 0;
          break;
        case "Once":
          // decision: Once does NOT include transport by default
          transportAmt = 0;
          break;
        default:
          transportAmt = 0;
      }
    }

    setCalcTransportAmount(transportAmt);

    // total combines classAmt and transportAmt (transport included according to rule above)
    setCalcTotal(classAmt + transportAmt);
  }, [calcSelectedClass, calcSelectedPickupId, calcFeeType, CLASS_FEES, pickupData]);

  // ------------------------
  // Quick helpers for display
  // ------------------------
  const feeTypeLabel = (key) => {
    switch (key) {
      case "Monthly":
        return "Monthly";
      case "Quarterly":
        return "Quarterly";
      case "Term":
        return "Term";
      case "Once":
        return "Once";
      case "Annual":
        return "Annual";
      default:
        return key;
    }
  };

  // ------------------------
  // Render
  // ------------------------
  return (
    <div className="mainpro">
        <div className="container">
      
      {/* Top navigation */}
      <div className="tabs">
        <button className={tab === "dashboard" ? "tab activeTab" : "tab"} onClick={() => setTab("dashboard")}>
          Dashboard
        </button>

        <button  className={tab === "classes" ? "tab activeTab" : "tab"} onClick={() => setTab("classes")}  >
          Class Fees
        </button>
        <button  className={tab === "pickups" ? "tab activeTab" : "tab"} onClick={() => setTab("pickups")}  >
          Pickup Locations
        </button>
        <button  className={tab === "students" ? "tab activeTab" : "tab"} onClick={() => setTab("students")}  >
          Students
        </button>
        <button  className={tab === "calculator" ? "tab activeTab" : "tab"} onClick={() => setTab("calculator")}  >
          Calculator
        </button>
      </div>

      {/* ------------------ DASHBOARD ------------------ */}
     {tab === "dashboard" && (
        <div>
          <h2>Dashboard Overview</h2>

          <div className="transportsec">
            
            {/* ---------------- CLASS SUMMARY ---------------- */}
            <div className="box">
              <h3>Class Fee Summary</h3>

              <table className="table" border="1" cellPadding="8">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Tuition</th>
                    <th>Quarterly</th>
                    <th>Once</th>
                    <th>Annual</th>
                    <th width="120">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(CLASS_FEES).map((cls) => (
                    <tr key={cls}>
                      <td>{cls}</td>
                      <td>₹{CLASS_FEES[cls].tuition}</td>
                      <td>₹{CLASS_FEES[cls].quarterly}</td>
                      <td>₹{CLASS_FEES[cls].once}</td>
                      <td>₹{CLASS_FEES[cls].annual}</td>
                      <td>
                        <button
                          className="editBtn"
                          onClick={() => {
                            openEditClass(cls);
                            setShowClassModal(true);   // OPEN POPUP
                          }}
                        >
                          Edit
                        </button>
                        <button className="deleteBtn" onClick={() => deleteClass(cls)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                className="saveBtn"
                onClick={() => {
                  openAddClass();
                  setShowClassModal(true);  // OPEN POPUP
                }}
              >
                Add / Edit Classes
              </button>
            </div>

            {/* ---------------- PICKUP SUMMARY ---------------- */}
            <div className="box">
              <h3>Pickup Locations</h3>

              <table className="table" border="1" cellPadding="8">
                <thead>
                  <tr>
                    <th>Pickup</th>
                    <th>Monthly</th>
                    <th>Quarterly</th>
                    <th>Yearly</th>
                    <th width="120">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pickupData.map((p) => (
                    <tr key={p.pickup_id}>
                      <td>{p.pickup_name}</td>
                      <td>₹{p.monthly_fee}</td>
                      <td>₹{p.quarterly_fee}</td>
                      <td>₹{p.yearly_fee}</td>
                      <td>
                        <button
                          className="editBtn"
                          onClick={() => {
                            editPickup(p);
                            setShowPickupModal(true);  // OPEN POPUP
                          }}
                        >
                          Edit
                        </button>
                        <button className="deleteBtn" onClick={() => deletePickup(p.pickup_id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                className="saveBtn"
                onClick={() => {
                  openNewPickup();
                  setShowPickupModal(true);  // OPEN POPUP
                }}
              >
                Manage Pickups
              </button>
            </div>

            {/* ---------------- STUDENT SUMMARY ---------------- */}
            <div className="box">
              <h3>Students</h3>

              <table className="table" border="1" cellPadding="8">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Pickup</th>
                    <th>Fee Type</th>
                    <th>Transport</th>
                    <th width="120">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.class_name}</td>
                      <td>{findPickupById(s.pickup_id)?.pickup_name ?? "-"}</td>
                      <td>{s.feeType}</td>
                      <td>{s.transportAssigned ? "Yes" : "No"}</td>
                      <td>
                        <button
                          className="editBtn"
                          onClick={() => {
                            editStudent(s);
                            setShowStudentModal(true);  // OPEN POPUP
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="deleteBtn"
                          onClick={() => deleteStudent(s.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                className="saveBtn"
                onClick={() => {
                  openNewStudent();
                  setShowStudentModal(true);  // OPEN POPUP
                }}
              >
                Manage Students
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------ CLASSES ------------------ */}
      {tab === "classes" && (
         <div className="transportsec">
          <h2>Class Fee Management</h2> 
          <button className="saveBtn" onClick={() => { openAddClass(); setShowClassModal(true);}}>Add New Class</button>
          <div className="box">
           <table className="table" >
            <thead>
              <tr>
                <th>Class</th>
                <th>Tuition</th>
                <th>Transport (ref)</th>
                <th>Quarterly</th>
                <th>Once</th>
                <th>Annual</th>
                <th width="120">Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(CLASS_FEES).map((cls) => (
                <tr key={cls}>
                  <td>{cls}</td>
                  <td>₹{CLASS_FEES[cls].tuition}</td>
                  <td>₹{CLASS_FEES[cls].transport}</td>
                  <td>₹{CLASS_FEES[cls].quarterly}</td>
                  <td>₹{CLASS_FEES[cls].once}</td>
                  <td>₹{CLASS_FEES[cls].annual}</td>
                  <td>
                    <button className="editBtn"onClick={() => { openEditClass(cls); setShowClassModal(true);}}>Edit</button>
                    <button className="deleteBtn" onClick={() => deleteClass(cls)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div> 
        </div>
      )}

      {/* ------------------ PICKUPS ------------------ */}
      {tab === "pickups" && (
         <div className="transportsec">
          <h2>Pickup Locations</h2>
          <button className="saveBtn"  onClick={() => {  openNewPickup(); setShowPickupModal(true); }}>Add New Pickup</button>        
          <div className="box">
           <table className="table">
            <thead>
              <tr>
                <th>Pickup</th>
                <th>Monthly</th>
                <th>Quarterly</th>
                <th>Yearly</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pickupData.map((p) => (
                <tr key={p.pickup_id}>
                  <td>{p.pickup_name}</td>
                  <td>₹{p.monthly_fee}</td>
                  <td>₹{p.quarterly_fee}</td>
                  <td>₹{p.yearly_fee}</td>
                  <td>{p.start_date}</td>
                  <td>{p.end_date}</td>
                  <td>{p.status}</td>
                  <td>
                    <button className="editBtn"  onClick={() => {editPickup(p); setShowPickupModal(true);}}>Edit</button>
                    
                    <button className="deleteBtn" onClick={() => deletePickup(p.pickup_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* ------------------ STUDENTS ------------------ */}
      {tab === "students" && (
         <div className="transportsec">
          <h2>Students</h2>
          <button className="saveBtn" onClick={() => { openNewStudent(); setShowStudentModal(true);}}>Add New Student</button>
          <div className="box">
           <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Pickup</th>
                <th>Fee Type</th>
                <th>Transport</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.class_name}</td>
                  <td>{findPickupById(s.pickup_id)?.pickup_name ?? "-"}</td>
                  <td>{s.feeType}</td>
                  <td>{s.transportAssigned ? "Yes" : "No"}</td>
                  <td>
                    <button className="editBtn" onClick={() => {editStudent(s);setShowStudentModal(true);}}>Edit</button>
                    <button className="deleteBtn" style={{ marginLeft: 8 }} onClick={() => deleteStudent(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* ------------------ CALCULATOR ------------------ */}
      {tab === "calculator" && (
         <div className="transportsec">
          <h2>Fee Calculator</h2>

          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <label>Select Student</label>
              <select value={calcSelectedStudentId} onChange={(e) => setCalcSelectedStudentId(e.target.value)} style={{ display: "block", marginTop: 6 }}>
                <option value="">-- Select Student --</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.class_name || "No class"})</option>)}
              </select>
            </div>

            <div>
              <label>Or Select Class</label>
              <select value={calcSelectedClass} onChange={(e) => setCalcSelectedClass(e.target.value)} style={{ display: "block", marginTop: 6 }}>
                <option value="">-- Select Class --</option>
                {Object.keys(CLASS_FEES).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label>Select Pickup</label>
              <select value={calcSelectedPickupId} onChange={(e) => setCalcSelectedPickupId(e.target.value)} style={{ display: "block", marginTop: 6 }}>
                <option value="">No Pickup</option>
                {pickupData.map((p) => <option key={p.pickup_id} value={p.pickup_id}>{p.pickup_name}</option>)}
              </select>
            </div>

            <div>
              <label>Fee Type</label>
              <select value={calcFeeType} onChange={(e) => setCalcFeeType(e.target.value)} style={{ display: "block", marginTop: 6 }}>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Term">Term</option>
                <option value="Once">Once</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 16, border: "1px solid #ddd", padding: 12, width: 560 }}>
            <h3>Calculation</h3>
            <p>Class Amount ({calcFeeType}): ₹{calcClassAmount}</p>
            <p>Transport Amount: ₹{calcTransportAmount}</p>
            <hr />
            <h2>Total: ₹{calcTotal}</h2>
            <div style={{ marginTop: 8 }}>
              <button className="saveBtn" onClick={() => alert(`Total payable: ₹${calcTotal}`)}>Show / Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>






   {showClassModal && (
  <Popup
    title={editingClass ? `Edit Class: ${editingClass}` : "Add New Class"}
    onClose={() => setShowClassModal(false)}
    onSave={() => {
      saveClass();
      setShowClassModal(false); // CLOSE MODAL AFTER SAVE
    }} onReset={resetClassForm}
    saveText={editingClass ? "Save Changes" : "Add Class"}
  >
    <div className="inputRow">
      <label>Class Name</label>
      <input className="form-control"
        type="text"
        value={classNameInput}
        onChange={(e) => setClassNameInput(e.target.value)}
        disabled={!!editingClass}
      />
    </div>

    <div className="inputRow">
      <label>Tuition (Monthly)</label>
      <input className="form-control"
        type="number"
        value={classFeesInput.tuition}
        onChange={(e) =>
          setClassFeesInput((p) => ({ ...p, tuition: e.target.value }))
        }
      />
    </div>

    

    <div className="inputRow">
      <label>Transport (ref monthly)</label>
      <input className="form-control"
        type="number"
        value={classFeesInput.transport}
        onChange={(e) =>
          setClassFeesInput((p) => ({ ...p, transport: e.target.value }))
        }
      />
    </div>

    <div className="inputRow">
      <label>Quarterly</label>
      <input className="form-control"
        type="number"
        value={classFeesInput.quarterly}
        onChange={(e) =>
          setClassFeesInput((p) => ({ ...p, quarterly: e.target.value }))
        }
      />
    </div>

    <div className="inputRow">
      <label>Once (one-time)</label>
      <input className="form-control"
        type="number"
        value={classFeesInput.once}
        onChange={(e) =>
          setClassFeesInput((p) => ({ ...p, once: e.target.value }))
        }
      />
    </div>

    <div className="inputRow">
      <label>Annual</label>
      <input className="form-control" 
        type="number"
        value={classFeesInput.annual}
        onChange={(e) =>
          setClassFeesInput((p) => ({ ...p, annual: e.target.value }))
        }
      />
    </div> 
  </Popup>
)}

  {showPickupModal && (
  <Popup title={pickupEditId ? "Edit Pickup" : "Add Pickup"} onClose={() => setShowPickupModal(false)}
    onSave={savePickup} onReset={resetPickupForm}  saveText={pickupEditId ? "Save Pickup" : "Add Pickup"} >
    <div className="inputRow">
      <label>Pickup Name</label>
      <input className="form-control" value={pickupForm.pickup_name} onChange={(e) => setPickupForm((p) => ({ ...p, pickup_name: e.target.value })) } />
    </div>

    <div className="inputRow">
      <label>Monthly Fee</label>
      <input className="form-control" type="number" value={pickupForm.monthly_fee} onChange={(e) => setPickupForm((p) => ({ ...p, monthly_fee: e.target.value }))  } />
    </div>

    <div className="inputRow">
      <label>Quarterly Fee</label>
      <input className="form-control"
        type="number" value={pickupForm.quarterly_fee} onChange={(e) => setPickupForm((p) => ({ ...p, quarterly_fee: e.target.value })) } />
    </div>

    <div className="inputRow">
      <label>Yearly Fee</label>
      <input className="form-control" type="number" value={pickupForm.yearly_fee} onChange={(e) => setPickupForm((p) => ({ ...p, yearly_fee: e.target.value })) } />
    </div> 
  </Popup>
)}



{showStudentModal && (
  <Popup title={studentEditId ? "Edit Student" : "Add Student"} onClose={() => setShowStudentModal(false)} onSave={() => { saveStudent(); setShowStudentModal(false); }}
    onReset={resetStudentForm} saveText={studentEditId ? "Save Student" : "Add Student"} >
    <div className="inputRow">
      <label>Name</label>
      <input className="form-control"
        value={studentForm.name}
        onChange={(e) =>
          setStudentForm((p) => ({ ...p, name: e.target.value }))
        }
      />
    </div>

    <div className="inputRow">
      <label>Class</label>
      <select className="form-control"
        value={studentForm.class_name}
        onChange={(e) =>
          setStudentForm((p) => ({ ...p, class_name: e.target.value }))
        }
      >
        <option value="">Select Class</option>
        {Object.keys(CLASS_FEES).map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>

    <div className="inputRow">
      <label>Pickup</label>
      <select className="form-control"
        value={studentForm.pickup_id ?? ""}
        onChange={(e) =>
          setStudentForm((p) => ({
            ...p,
            pickup_id: e.target.value ? Number(e.target.value) : "",
          }))
        }
      >
        <option value="">No Pickup</option>
        {pickupData.map((p) => (
          <option key={p.pickup_id} value={p.pickup_id}>
            {p.pickup_name}
          </option>
        ))}
      </select>
    </div>

    <div className="inputRow">
      <label>Fee Type</label>
      <select className="form-control"
        value={studentForm.feeType}
        onChange={(e) =>
          setStudentForm((p) => ({ ...p, feeType: e.target.value }))
        }
      >
        <option value="Monthly">Monthly</option>
        <option value="Quarterly">Quarterly</option>
        <option value="Term">Term</option>
        <option value="Once">Once</option>
        <option value="Annual">Annual</option>
      </select>
    </div>

    <div className="inputRow">
      <label>Transport Assigned</label>
      <input
        type="checkbox"
        checked={studentForm.transportAssigned}
        onChange={(e) =>
          setStudentForm((p) => ({
            ...p,
            transportAssigned: e.target.checked,
          }))
        }
      />
    </div> 
  </Popup>
)}
    </div>
  );
}

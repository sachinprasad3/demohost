import React, { useState } from "react";

export default function TeacherTasks() {
  const [task, setTask] = useState({
    title: "",
    description: "",
    subject: "",
    className: "",
    section: "",
    dueDate: "",
    assignTo: "all", // all | selected
    students: "",
    priority: "normal", // low | normal | high
  });

  const [tasks, setTasks] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setTask((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const e = {};
    if (!task.title.trim()) e.title = "Title is required";
    if (!task.className.trim()) e.className = "Class is required";
    if (!task.section.trim()) e.section = "Section is required";
    if (!task.dueDate.trim()) e.dueDate = "Due date is required";

    // If assignTo = selected, students field is required
    if (task.assignTo === "selected" && !task.students.trim()) {
      e.students = "Enter student names/roll no.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newTask = {
      ...task,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    // Reset form
    setTask({
      title: "",
      description: "",
      subject: "",
      className: "",
      section: "",
      dueDate: "",
      assignTo: "all",
      students: "",
      priority: "normal",
    });
    setErrors({});
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
     <div className="mainpro">
      <div className="container">
    <div className="page-wrapper" >
      <h2 className="page-title">Teacher – Add Task / Homework</h2>

      <div className="task-layout" >
        {/* LEFT – FORM */}
        <form className="task-form card" onSubmit={handleSubmit} style={{ padding: "16px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)", background: "#fff" }}>
          <h3 style={{ marginBottom: "12px" }}>Create New Task</h3>

          {/* Title */}
          <div className="form-group">
            <label>Task Title <span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              className="input"
              value={task.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. English Homework – Chapter 3"
            />
            {errors.title && <div className="error">{errors.title}</div>}
          </div>

          {/* Subject / Class / Section */}
          <div className="form-row" style={{ display: "flex", gap: "10px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Subject</label>
              <input
                type="text"
                className="input"
                value={task.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="e.g. English"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Class <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                className="input"
                value={task.className}
                onChange={(e) => handleChange("className", e.target.value)}
                placeholder="e.g. Nursery / 1 / 2"
              />
              {errors.className && <div className="error">{errors.className}</div>}
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Section <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                className="input"
                value={task.section}
                onChange={(e) => handleChange("section", e.target.value)}
                placeholder="e.g. A / B"
              />
              {errors.section && <div className="error">{errors.section}</div>}
            </div>
          </div>

          {/* Due date + Priority */}
          <div className="form-row" style={{ display: "flex", gap: "10px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Due Date <span style={{ color: "red" }}>*</span></label>
              <input
                type="date"
                className="input"
                value={task.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
              {errors.dueDate && <div className="error">{errors.dueDate}</div>}
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Priority</label>
              <select
                className="input"
                value={task.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Assign to */}
          <div className="form-group">
            <label>Assign To</label>
            <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
              <label>
                <input
                  type="radio"
                  name="assignTo"
                  value="all"
                  checked={task.assignTo === "all"}
                  onChange={(e) => handleChange("assignTo", e.target.value)}
                />{" "}
                All Students in this Class
              </label>
              <label>
                <input
                  type="radio"
                  name="assignTo"
                  value="selected"
                  checked={task.assignTo === "selected"}
                  onChange={(e) => handleChange("assignTo", e.target.value)}
                />{" "}
                Selected Students
              </label>
            </div>
          </div>

          {task.assignTo === "selected" && (
            <div className="form-group">
              <label>Student Names / Roll Numbers <span style={{ color: "red" }}>*</span></label>
              <textarea
                className="input"
                rows="2"
                value={task.students}
                onChange={(e) => handleChange("students", e.target.value)}
                placeholder="e.g. Roll 1, Roll 5, Roll 7"
              />
              {errors.students && <div className="error">{errors.students}</div>}
            </div>
          )}

          {/* Description */}
          <div className="form-group">
            <label>Description / Instructions</label>
            <textarea
              className="input"
              rows="4"
              value={task.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Write task details or instructions for students..."
            />
          </div>

          {/* (Optional) File Upload Placeholder – integrate with API later */}
          {/* <div className="form-group">
            <label>Attachment (optional)</label>
            <input type="file" className="input" />
          </div> */}

          <button type="submit" className="btn-primary" style={{ marginTop: "10px" }}>
            Save Task
          </button>
        </form>

        {/* RIGHT – TASK LIST PREVIEW */}
        <div className="task-list card" style={{ padding: "16px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)", background: "#fff" }}>
          <h3 style={{ marginBottom: "12px" }}>Recent Tasks</h3>

          {tasks.length === 0 && <p style={{ color: "#888" }}>No tasks added yet.</p>}

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {tasks.map((t) => (
              <li
                key={t.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "6px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{t.title}</strong>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "20px",
                      textTransform: "uppercase",
                      border: "1px solid #ccc",
                    }}
                  >
                    {t.priority}
                  </span>
                </div>
                <div style={{ fontSize: "13px", marginTop: "4px" }}>
                  Class {t.className} – Section {t.section}
                  {t.subject && <> | {t.subject}</>}
                </div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  Due:{" "}
                  {t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </div>
                {t.description && (
                  <div style={{ fontSize: "12px", marginTop: "6px", color: "#555" }}>
                    {t.description}
                  </div>
                )}
                <div style={{ marginTop: "6px", fontSize: "12px", color: "#777" }}>
                  Assigned to:{" "}
                  {t.assignTo === "all" ? "All students" : `Selected – ${t.students}`}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "none",
                    background: "#ff5252",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Simple basic styles – you can move to CSS file */}
      <style>{`
        .input {
          width: 100%;
          padding: 6px 8px;
          font-size: 13px;
          border-radius: 4px;
          border: 1px solid #ccc;
          outline: none;
        }
         
        @media (max-width: 768px) {
          .task-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
    </div>
    </div>
  );
}
